import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

import { hydrateBracketFromSupabase, type SupabaseMatchScoreRow } from "../../lib/brackets";
import type {
  SupabaseMatchRow,
  SupabaseStageRow,
} from "../../lib/brackets";
import { fetchTournamentLiveSnapshot } from "./fetchTournamentLiveSnapshot";
import type {
  TournamentBroadcastChange,
  TournamentBroadcastEventType,
  TournamentLiveDerived,
  TournamentLiveSnapshot,
  TournamentLiveState,
  TournamentRealtimeOptions,
} from "./types";

type Listener = () => void;

type BroadcastCallbackPayload = {
  payload?: Record<string, unknown>;
} & Record<string, unknown>;

const STRUCTURAL_TABLES = new Set([
  "entries",
  "stages",
  "stage_rounds",
  "groups",
]);

export class TournamentRealtimeStore {
  private readonly categoryId: string;
  private readonly supabase: SupabaseClient<any>;

  private channel: RealtimeChannel | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isStarted = false;
  private isDisposed = false;
  private subscriptionVersion = 0;

  private state: TournamentLiveState;

  constructor(options: TournamentRealtimeOptions) {
    this.categoryId = options.categoryId;
    if (!options.supabase) {
      throw new Error("TournamentRealtimeStore requires a Supabase client instance.");
    }

    this.supabase = options.supabase as SupabaseClient<any>;
    this.state = buildInitialState(options.categoryId, options.initialSnapshot ?? null);
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): TournamentLiveState => {
    return this.state;
  };

  start = async (): Promise<void> => {
    if (this.isDisposed || this.isStarted) {
      return;
    }

    this.isStarted = true;

    if (!this.state.snapshot) {
      await this.refreshFromServer("initial");
    }

    await this.openChannel("initial");
  };

  refresh = async (): Promise<void> => {
    await this.refreshFromServer("manual");
  };

  reconnectNow = async (): Promise<void> => {
    if (this.isDisposed) {
      return;
    }

    this.clearReconnectTimer();
    await this.openChannel("manual_reconnect");
  };

  dispose = async (): Promise<void> => {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    this.isStarted = false;
    this.clearReconnectTimer();
    await this.teardownChannel();
    this.patchState({
      status: "disconnected",
      stale: false,
    });
  };

  private async refreshFromServer(reason: "initial" | "manual" | "reconnect" | "structural"): Promise<void> {
    if (this.isDisposed) {
      return;
    }

    this.patchState({
      status: reason === "initial" ? "connecting" : this.state.status,
      error: null,
    });

    try {
      const snapshot = await fetchTournamentLiveSnapshot(this.supabase, this.categoryId);
      this.replaceSnapshot(snapshot, {
        status: this.channel ? "subscribed" : this.state.status,
        error: null,
        stale: false,
        reconnectAttempt: reason === "reconnect" ? 0 : this.state.reconnectAttempt,
      });
    } catch (error) {
      const message = toErrorMessage(error);
      this.patchState({
        status: "error",
        error: message,
        stale: true,
      });

      if (reason !== "manual") {
        this.scheduleReconnect();
      }
    }
  }

  private async openChannel(
    reason: "initial" | "manual_reconnect",
  ): Promise<void> {
    if (this.isDisposed) {
      return;
    }

    await this.teardownChannel();
    await this.prepareRealtimeAuth();

    const version = ++this.subscriptionVersion;
    const topic = `category:${this.categoryId}`;

    this.patchState({
      status: reason === "initial" ? "connecting" : "reconnecting",
      error: null,
    });

    const channel = this.supabase.channel(topic, {
      config: { private: true },
    });

    this.channel = channel;

    channel
      .on("broadcast", { event: "INSERT" }, (message) => {
        this.handleBroadcastMessage("INSERT", message as BroadcastCallbackPayload);
      })
      .on("broadcast", { event: "UPDATE" }, (message) => {
        this.handleBroadcastMessage("UPDATE", message as BroadcastCallbackPayload);
      })
      .on("broadcast", { event: "DELETE" }, (message) => {
        this.handleBroadcastMessage("DELETE", message as BroadcastCallbackPayload);
      })
      .subscribe((status, error) => {
        if (this.isDisposed || version !== this.subscriptionVersion) {
          return;
        }

        this.handleChannelStatus(status, error);
      });
  }

  private async prepareRealtimeAuth(): Promise<void> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();

      if (session?.access_token) {
        await this.supabase.realtime.setAuth(session.access_token);
      } else {
        await this.supabase.realtime.setAuth();
      }
    } catch {
      await this.supabase.realtime.setAuth();
    }
  }

  private handleChannelStatus(status: string, error: Error | undefined): void {
    switch (status) {
      case "SUBSCRIBED":
      {
        const needsRefresh =
          this.state.stale ||
          this.state.snapshot == null ||
          this.state.reconnectAttempt > 0;

        this.clearReconnectTimer();
        this.patchState({
          status: "subscribed",
          error: null,
          stale: false,
          reconnectAttempt: 0,
        });

        if (needsRefresh) {
          void this.refreshFromServer("reconnect");
        }
        return;
      }

      case "CHANNEL_ERROR":
      case "TIMED_OUT":
        this.patchState({
          status: "error",
          error: error?.message ?? `Realtime channel status: ${status}.`,
          stale: true,
        });
        this.scheduleReconnect();
        return;

      case "CLOSED":
        if (!this.isStarted || this.isDisposed) {
          this.patchState({
            status: "disconnected",
          });
          return;
        }

        this.patchState({
          status: "reconnecting",
          stale: true,
        });
        this.scheduleReconnect();
        return;

      default:
        return;
    }
  }

  private handleBroadcastMessage(
    fallbackEventType: TournamentBroadcastEventType,
    rawMessage: BroadcastCallbackPayload,
  ): void {
    if (this.isDisposed) {
      return;
    }

    const change = normalizeBroadcastChange(rawMessage, fallbackEventType);
    if (!change) {
      return;
    }

    if (STRUCTURAL_TABLES.has(change.table)) {
      void this.refreshFromServer("structural");
      return;
    }

    if (
      (change.table === "matches" ||
        change.table === "match_slots" ||
        change.table === "match_scores") &&
      change.eventType !== "UPDATE"
    ) {
      void this.refreshFromServer("structural");
      return;
    }

    if (!this.state.snapshot) {
      void this.refreshFromServer("reconnect");
      return;
    }

    const nextSnapshot = cloneSnapshot(this.state.snapshot);
    const changed = applyBroadcastChange(nextSnapshot, change);

    if (!changed) {
      return;
    }

    try {
      this.replaceSnapshot(nextSnapshot, {
        status: "subscribed",
        stale: false,
        error: null,
      });
    } catch {
      void this.refreshFromServer("structural");
    }
  }

  private scheduleReconnect(): void {
    if (this.isDisposed || this.reconnectTimer) {
      return;
    }

    const attempt = this.state.reconnectAttempt + 1;
    const baseDelay = Math.min(1000 * 2 ** (attempt - 1), 15000);
    const jitter = Math.floor(Math.random() * 400);
    const delayMs = baseDelay + jitter;

    this.patchState({
      status: "reconnecting",
      stale: true,
      reconnectAttempt: attempt,
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.openChannel("manual_reconnect");
    }, delayMs);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private async teardownChannel(): Promise<void> {
    if (!this.channel) {
      return;
    }

    const current = this.channel;
    this.channel = null;

    try {
      await this.supabase.removeChannel(current);
    } catch {
      await current.unsubscribe();
    }
  }

  private replaceSnapshot(
    snapshot: TournamentLiveSnapshot,
    patch: Partial<TournamentLiveState>,
  ): void {
    const derived = deriveLiveSnapshot(snapshot);
    this.state = {
      ...this.state,
      ...derived,
      ...patch,
      snapshot,
      lastSyncAt: new Date().toISOString(),
    };
    this.emit();
  }

  private patchState(patch: Partial<TournamentLiveState>): void {
    this.state = {
      ...this.state,
      ...patch,
    };
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

function buildInitialState(
  categoryId: string,
  snapshot: TournamentLiveSnapshot | null,
): TournamentLiveState {
  const derived = snapshot ? deriveLiveSnapshot(snapshot) : emptyDerivedState();

  return {
    categoryId,
    status: "idle",
    snapshot,
    stale: false,
    error: null,
    lastSyncAt: null,
    reconnectAttempt: 0,
    ...derived,
  };
}

function deriveLiveSnapshot(snapshot: TournamentLiveSnapshot): TournamentLiveDerived {
  const knockoutStage = getPrimaryKnockoutStage(snapshot.stages);

  let bracket = null;
  if (knockoutStage) {
    const knockoutMatches = snapshot.matches.filter(
      (match) => match.stage_id === knockoutStage.id,
    );
    const knockoutMatchIds = new Set(knockoutMatches.map((match) => match.id));

    bracket = hydrateBracketFromSupabase({
      category: snapshot.category,
      stage: knockoutStage,
      stageRounds: snapshot.stageRounds.filter(
        (round) => round.stage_id === knockoutStage.id,
      ),
      groups: snapshot.groups.filter((group) => group.stage_id === knockoutStage.id),
      entries: snapshot.entries,
      matches: knockoutMatches,
      matchSlots: snapshot.matchSlots.filter((slot) =>
        knockoutMatchIds.has(slot.match_id),
      ),
      matchScores: snapshot.matchScores.filter((score) =>
        knockoutMatchIds.has(score.match_id),
      ),
    });
  }

  const orderedMatches = [...snapshot.matches].sort(compareMatchRows);

  return {
    knockoutStage,
    bracket,
    liveMatches: orderedMatches.filter((match) => match.status === "live"),
    upcomingMatches: orderedMatches.filter((match) =>
      match.status === "pending" ||
      match.status === "ready" ||
      match.status === "scheduled"
    ),
    finishedMatches: orderedMatches.filter((match) => match.status === "finished"),
  };
}

function emptyDerivedState(): TournamentLiveDerived {
  return {
    knockoutStage: null,
    bracket: null,
    liveMatches: [],
    upcomingMatches: [],
    finishedMatches: [],
  };
}

function getPrimaryKnockoutStage(stages: SupabaseStageRow[]): SupabaseStageRow | null {
  const knockoutStages = stages
    .filter((stage) => stage.stage_type === "knockout")
    .sort((left, right) => left.sequence_no - right.sequence_no);

  return knockoutStages[0] ?? null;
}

function compareMatchRows(left: SupabaseMatchRow, right: SupabaseMatchRow): number {
  const leftStatus = matchStatusRank(left.status);
  const rightStatus = matchStatusRank(right.status);

  if (leftStatus !== rightStatus) {
    return leftStatus - rightStatus;
  }

  const leftPosition = left.bracket_position ?? left.match_no ?? 0;
  const rightPosition = right.bracket_position ?? right.match_no ?? 0;

  if (leftPosition !== rightPosition) {
    return leftPosition - rightPosition;
  }

  return left.id.localeCompare(right.id);
}

function matchStatusRank(status: SupabaseMatchRow["status"]): number {
  switch (status) {
    case "live":
      return 0;
    case "ready":
      return 1;
    case "scheduled":
      return 2;
    case "pending":
      return 3;
    case "finished":
      return 4;
    case "cancelled":
      return 5;
    default:
      return 99;
  }
}

function normalizeBroadcastChange(
  rawMessage: BroadcastCallbackPayload,
  fallbackEventType: TournamentBroadcastEventType,
): TournamentBroadcastChange | null {
  const payload = isRecord(rawMessage.payload) ? rawMessage.payload : rawMessage;

  const eventType =
    asEventType(payload.eventType) ??
    asEventType(payload.type) ??
    fallbackEventType;
  const table = asString(payload.table);
  const schema = asString(payload.schema) ?? "public";

  if (!eventType || !table) {
    return null;
  }

  return {
    schema,
    table,
    eventType,
    commitTimestamp: asString(payload.commit_timestamp),
    new: asRecord(payload.new),
    old: asRecord(payload.old),
  };
}

function applyBroadcastChange(
  snapshot: TournamentLiveSnapshot,
  change: TournamentBroadcastChange,
): boolean {
  switch (change.table) {
    case "matches":
      return applyRowChange(
        snapshot.matches,
        change,
        (row) => asString(row.id) ?? "",
      );
    case "match_slots":
      return applyRowChange(
        snapshot.matchSlots,
        change,
        (row) => asString(row.id) ?? "",
      );
    case "match_scores":
      return applyRowChange(
        snapshot.matchScores,
        change,
        (row) => asString(row.id) ?? "",
      );
    default:
      return false;
  }
}

function applyRowChange<Row extends object>(
  collection: Row[],
  change: TournamentBroadcastChange,
  getKey: (row: Row) => string,
): boolean {
  const currentRow = (change.eventType === "DELETE" ? change.old : change.new) as Row | null;
  if (!currentRow) {
    return false;
  }

  const key = getKey(currentRow);
  if (!key) {
    return false;
  }

  const index = collection.findIndex((row) => getKey(row) === key);

  if (change.eventType === "DELETE") {
    if (index < 0) {
      return false;
    }

    collection.splice(index, 1);
    return true;
  }

  if (index < 0) {
    collection.push(currentRow);
    return true;
  }

  collection[index] = {
    ...collection[index],
    ...currentRow,
  };
  return true;
}

function cloneSnapshot(snapshot: TournamentLiveSnapshot): TournamentLiveSnapshot {
  return {
    category: { ...snapshot.category },
    stages: snapshot.stages.map((stage) => ({ ...stage })),
    stageRounds: snapshot.stageRounds.map((round) => ({ ...round })),
    groups: snapshot.groups.map((group) => ({ ...group })),
    entries: snapshot.entries.map((entry) => ({
      ...entry,
      metadata: entry.metadata ? { ...entry.metadata } : entry.metadata,
      participant: entry.participant ? { ...entry.participant } : entry.participant,
      team: entry.team ? { ...entry.team } : entry.team,
    })),
    matches: snapshot.matches.map((match) => ({
      ...match,
      metadata: match.metadata ? { ...match.metadata } : match.metadata,
    })),
    matchSlots: snapshot.matchSlots.map((slot) => ({ ...slot })),
    matchScores: snapshot.matchScores.map((score) => ({ ...score })) as SupabaseMatchScoreRow[],
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown realtime error.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asEventType(value: unknown): TournamentBroadcastEventType | undefined {
  if (value === "INSERT" || value === "UPDATE" || value === "DELETE") {
    return value;
  }

  return undefined;
}
