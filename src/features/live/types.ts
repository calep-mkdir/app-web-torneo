import type { SupabaseClient } from "@supabase/supabase-js";

import type { Bracket } from "../../lib/brackets";
import type {
  SupabaseCategoryRow,
  SupabaseEntryRow,
  SupabaseGroupRow,
  SupabaseMatchRow,
  SupabaseMatchScoreRow,
  SupabaseMatchSlotRow,
  SupabaseStageRoundRow,
  SupabaseStageRow,
} from "../../lib/brackets";

export type TournamentConnectionStatus =
  | "idle"
  | "connecting"
  | "subscribed"
  | "reconnecting"
  | "disconnected"
  | "error";

export type TournamentBroadcastEventType = "INSERT" | "UPDATE" | "DELETE";

export interface TournamentLiveSnapshot {
  category: SupabaseCategoryRow;
  stages: SupabaseStageRow[];
  stageRounds: SupabaseStageRoundRow[];
  groups: SupabaseGroupRow[];
  entries: SupabaseEntryRow[];
  matches: SupabaseMatchRow[];
  matchSlots: SupabaseMatchSlotRow[];
  matchScores: SupabaseMatchScoreRow[];
}

export interface TournamentLiveDerived {
  knockoutStage: SupabaseStageRow | null;
  bracket: Bracket | null;
  liveMatches: SupabaseMatchRow[];
  upcomingMatches: SupabaseMatchRow[];
  finishedMatches: SupabaseMatchRow[];
}

export interface TournamentLiveState extends TournamentLiveDerived {
  categoryId: string;
  status: TournamentConnectionStatus;
  snapshot: TournamentLiveSnapshot | null;
  stale: boolean;
  error: string | null;
  lastSyncAt: string | null;
  reconnectAttempt: number;
}

export interface TournamentRealtimeOptions {
  categoryId: string;
  initialSnapshot?: TournamentLiveSnapshot | null;
  supabase?: SupabaseClient<any>;
}

export interface TournamentBroadcastChange<
  Row extends Record<string, unknown> = Record<string, unknown>,
> {
  schema: string;
  table: string;
  eventType: TournamentBroadcastEventType;
  commitTimestamp?: string;
  new: Row | null;
  old: Row | null;
}

export interface UseTournamentRealtimeResult extends TournamentLiveState {
  refresh: () => Promise<void>;
  reconnectNow: () => Promise<void>;
}
