import {
  advanceWinner,
  type AdvanceWinnerInput,
  type Bracket,
  type BracketMatch,
  type BracketParticipant,
  type BracketSlot,
  type MatchStatus,
  type SlotSource,
} from "./bracketEngine";

export type SupabaseCategoryFormat =
  | "group_only"
  | "knockout_only"
  | "group_to_knockout";

export type SupabaseStageType = "group" | "knockout";
export type SupabaseEntryType = "individual" | "team";
export type SupabaseMatchStatus =
  | "pending"
  | "ready"
  | "scheduled"
  | "live"
  | "finished"
  | "cancelled";
export type SupabaseSlotSourceType =
  | "manual"
  | "entry"
  | "group_rank"
  | "match_winner"
  | "match_loser"
  | "bye";
export type SupabaseSlotResult =
  | "pending"
  | "win"
  | "loss"
  | "draw"
  | "walkover"
  | "bye";

export interface SupabaseCategoryRow {
  id: string;
  format: SupabaseCategoryFormat;
  name?: string | null;
}

export interface SupabaseStageRow {
  id: string;
  category_id: string;
  stage_type: SupabaseStageType;
  sequence_no: number;
  name: string;
  config?: Record<string, unknown> | null;
}

export interface SupabaseStageRoundRow {
  id: string;
  stage_id: string;
  round_no: number;
  name: string;
}

export interface SupabaseGroupRow {
  id: string;
  stage_id: string;
  code: string;
  name: string;
  sequence_no: number;
}

export interface SupabaseParticipantRelation {
  display_name?: string | null;
}

export interface SupabaseTeamRelation {
  name?: string | null;
  short_name?: string | null;
}

export interface SupabaseEntryRow {
  id: string;
  category_id: string;
  entry_type: SupabaseEntryType;
  seed?: number | null;
  status?: string | null;
  participant_id?: string | null;
  team_id?: string | null;
  metadata?: Record<string, unknown> | null;
  participant?: SupabaseParticipantRelation | null;
  team?: SupabaseTeamRelation | null;
}

export interface SupabaseMatchRow {
  id: string;
  category_id: string;
  stage_id: string;
  group_id?: string | null;
  stage_round_id?: string | null;
  match_no?: number | null;
  bracket_position?: number | null;
  leg_no?: number | null;
  status: SupabaseMatchStatus;
  scheduled_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  venue?: string | null;
  winning_slot_no?: 1 | 2 | null;
  is_draw?: boolean | null;
  lock_version?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface SupabaseMatchSlotRow {
  id: string;
  match_id: string;
  slot_no: 1 | 2;
  entry_id?: string | null;
  source_type: SupabaseSlotSourceType;
  source_match_id?: string | null;
  source_group_id?: string | null;
  source_rank?: number | null;
  label?: string | null;
}

export interface SupabaseMatchScoreRow {
  id: string;
  match_id: string;
  slot_no: 1 | 2;
  score: number;
  sets_won?: number | null;
  ranking_points?: number | null;
  result: SupabaseSlotResult;
}

export interface SupabaseKnockoutSnapshot {
  category: SupabaseCategoryRow;
  stage: SupabaseStageRow;
  stageRounds: SupabaseStageRoundRow[];
  groups?: SupabaseGroupRow[];
  entries: SupabaseEntryRow[];
  matches: SupabaseMatchRow[];
  matchSlots: SupabaseMatchSlotRow[];
  matchScores?: SupabaseMatchScoreRow[];
}

export interface SupabaseMatchPatch {
  id: string;
  status: SupabaseMatchStatus;
  winning_slot_no: 1 | 2 | null;
  is_draw: boolean;
  finished_at: string | null;
}

export interface SupabaseMatchSlotPatch {
  match_id: string;
  slot_no: 1 | 2;
  entry_id: string | null;
  source_type: SupabaseSlotSourceType;
  source_match_id: string | null;
  source_group_id: string | null;
  source_rank: number | null;
  label: string | null;
}

export interface SupabaseMatchScorePatch {
  match_id: string;
  slot_no: 1 | 2;
  score: number;
  result: SupabaseSlotResult;
}

export interface SupabaseBracketPatch {
  matches: SupabaseMatchPatch[];
  slots: SupabaseMatchSlotPatch[];
  scores: SupabaseMatchScorePatch[];
  championEntryId?: string;
}

export interface AdvanceWinnerSnapshotResult {
  current: Bracket;
  next: Bracket;
  patch: SupabaseBracketPatch;
}

export function hydrateBracketFromSupabase(snapshot: SupabaseKnockoutSnapshot): Bracket {
  if (snapshot.stage.stage_type !== "knockout") {
    throw new Error(
      `Stage "${snapshot.stage.id}" is of type "${snapshot.stage.stage_type}". Bracket hydration only supports knockout stages.`,
    );
  }

  const entryMap = new Map(snapshot.entries.map((entry) => [entry.id, entry]));
  const roundMap = new Map(snapshot.stageRounds.map((round) => [round.id, round]));
  const groupMap = new Map((snapshot.groups ?? []).map((group) => [group.id, group]));
  const scoreMap = new Map(
    (snapshot.matchScores ?? []).map((score) => [buildSlotKey(score.match_id, score.slot_no), score]),
  );

  const slotsByMatch = snapshot.matchSlots.reduce<Map<string, SupabaseMatchSlotRow[]>>(
    (accumulator, slot) => {
      const list = accumulator.get(slot.match_id) ?? [];
      list.push(slot);
      accumulator.set(slot.match_id, list);
      return accumulator;
    },
    new Map(),
  );

  const participants = snapshot.entries.reduce<Record<string, BracketParticipant>>(
    (accumulator, entry) => {
      accumulator[entry.id] = mapEntryToParticipant(entry);
      return accumulator;
    },
    {},
  );

  const rounds = snapshot.stageRounds
    .slice()
    .sort((left, right) => left.round_no - right.round_no)
    .map((round) => ({
      id: round.id,
      roundNumber: round.round_no,
      bracketSide: "main" as const,
      name: round.name,
      matchIds: [] as string[],
    }));

  const roundsByNumber = new Map(rounds.map((round) => [round.roundNumber, round]));
  const matches: Record<string, BracketMatch> = {};

  const orderedMatches = snapshot.matches
    .slice()
    .sort((left, right) => compareMatches(left, right, roundMap));

  for (const matchRow of orderedMatches) {
    const slotRows = (slotsByMatch.get(matchRow.id) ?? []).slice().sort((left, right) => left.slot_no - right.slot_no);
    if (slotRows.length !== 2) {
      throw new Error(
        `Match "${matchRow.id}" must have exactly 2 slots, received ${slotRows.length}.`,
      );
    }

    const roundNumber = getRoundNumber(matchRow, roundMap);
    const roundName = getRoundName(matchRow, roundMap);
    const round = roundsByNumber.get(roundNumber);
    if (!round) {
      roundsByNumber.set(roundNumber, {
        id: `derived-round-${roundNumber}`,
        roundNumber,
        bracketSide: "main",
        name: roundName,
        matchIds: [],
      });
    }

    const slots = slotRows.map((slotRow) =>
      mapSlotRowToBracketSlot(slotRow, entryMap, groupMap, scoreMap),
    ) as [BracketSlot, BracketSlot];

    const winnerParticipantId =
      matchRow.winning_slot_no != null
        ? slots[matchRow.winning_slot_no - 1]?.participantId
        : undefined;
    const loserParticipantId =
      winnerParticipantId != null
        ? slots.find((slot) => slot.participantId !== winnerParticipantId)?.participantId
        : undefined;

    const status = hydrateMatchStatus(matchRow.status, slots, winnerParticipantId);

    matches[matchRow.id] = {
      id: matchRow.id,
      roundNumber,
      roundName,
      bracketSide: "main",
      position: matchRow.bracket_position ?? matchRow.match_no ?? 1,
      status,
      slots,
      winnerParticipantId,
      loserParticipantId,
      decidedBy: winnerParticipantId ? inferDecisionFromRows(matchRow, slots) : undefined,
      completedAt: matchRow.finished_at ?? undefined,
      notes: [],
    };
  }

  for (const round of Array.from(roundsByNumber.values()).sort((left, right) => left.roundNumber - right.roundNumber)) {
    round.matchIds = orderedMatches
      .filter((match) => getRoundNumber(match, roundMap) === round.roundNumber)
      .sort((left, right) => compareMatches(left, right, roundMap))
      .map((match) => match.id);
  }

  connectMatchesFromSlotSources(matches);

  const championParticipantId = findChampionParticipantId(matches);
  const format = mapCategoryFormatToBracketFormat(snapshot.category.format);

  return {
    id: snapshot.stage.id,
    title: buildBracketTitle(snapshot.category.name, snapshot.stage.name),
    format,
    generatedAt: new Date().toISOString(),
    autoAdvanceByes: true,
    rounds: Array.from(roundsByNumber.values()).sort((left, right) => left.roundNumber - right.roundNumber),
    matches,
    participants,
    championParticipantId,
    warnings: [],
  };
}

export function buildSupabaseBracketPatch(
  previous: Bracket,
  next: Bracket,
): SupabaseBracketPatch {
  const matchIds = new Set([
    ...Object.keys(previous.matches),
    ...Object.keys(next.matches),
  ]);

  const matches: SupabaseMatchPatch[] = [];
  const slots: SupabaseMatchSlotPatch[] = [];
  const scores: SupabaseMatchScorePatch[] = [];

  for (const matchId of matchIds) {
    const before = previous.matches[matchId];
    const after = next.matches[matchId];

    if (!before || !after) {
      throw new Error(
        `Bracket patch generation expects the same match ids before and after. Missing "${matchId}".`,
      );
    }

    if (didMatchChange(before, after)) {
      matches.push({
        id: matchId,
        status: mapMatchStatusToSupabase(after.status),
        winning_slot_no: getWinningSlotNo(after),
        is_draw: false,
        finished_at: after.completedAt ?? null,
      });
    }

    for (let index = 0; index < after.slots.length; index += 1) {
      const beforeSlot = before.slots[index];
      const afterSlot = after.slots[index];

      if (didSlotChange(beforeSlot, afterSlot)) {
        slots.push(toSupabaseSlotPatch(after, afterSlot));
      }

      if (shouldUpsertScore(before, after, index as 0 | 1)) {
        scores.push(toSupabaseScorePatch(after, index as 0 | 1));
      }
    }
  }

  return {
    matches,
    slots,
    scores,
    championEntryId: next.championParticipantId,
  };
}

export function advanceWinnerFromSnapshot(
  snapshot: SupabaseKnockoutSnapshot,
  input: AdvanceWinnerInput,
): AdvanceWinnerSnapshotResult {
  const current = hydrateBracketFromSupabase(snapshot);
  const next = advanceWinner(current, input);
  const patch = buildSupabaseBracketPatch(current, next);

  return {
    current,
    next,
    patch,
  };
}

function mapEntryToParticipant(entry: SupabaseEntryRow): BracketParticipant {
  const displayName =
    entry.entry_type === "team"
      ? entry.team?.short_name ?? entry.team?.name ?? entry.metadata?.name
      : entry.participant?.display_name ?? entry.metadata?.name;

  return {
    id: entry.id,
    name: typeof displayName === "string" && displayName.trim().length > 0
      ? displayName
      : `Entry ${entry.id}`,
    seed: entry.seed ?? undefined,
    metadata: entry.metadata ?? undefined,
  };
}

function mapSlotRowToBracketSlot(
  slotRow: SupabaseMatchSlotRow,
  entryMap: Map<string, SupabaseEntryRow>,
  groupMap: Map<string, SupabaseGroupRow>,
  scoreMap: Map<string, SupabaseMatchScoreRow>,
): BracketSlot {
  const entry = slotRow.entry_id ? entryMap.get(slotRow.entry_id) : undefined;
  const group = slotRow.source_group_id ? groupMap.get(slotRow.source_group_id) : undefined;
  const score = scoreMap.get(buildSlotKey(slotRow.match_id, slotRow.slot_no));

  if (slotRow.entry_id && !entry) {
    throw new Error(
      `Slot "${slotRow.id}" references entry "${slotRow.entry_id}" which is missing from the snapshot.`,
    );
  }

  return {
    slotIndex: (slotRow.slot_no - 1) as 0 | 1,
    participantId: slotRow.entry_id ?? undefined,
    source: mapSlotSourceToRuntime(slotRow, entry, group),
    score: score?.score ?? null,
    isLocked: Boolean(slotRow.entry_id) || slotRow.source_type === "bye",
    label: slotRow.label ?? undefined,
  };
}

function mapSlotSourceToRuntime(
  slotRow: SupabaseMatchSlotRow,
  entry: SupabaseEntryRow | undefined,
  group: SupabaseGroupRow | undefined,
): SlotSource {
  switch (slotRow.source_type) {
    case "entry":
      if (entry?.seed != null) {
        return { type: "seed", seed: entry.seed };
      }
      return { type: "manual" };
    case "group_rank":
      if (!slotRow.source_group_id || slotRow.source_rank == null) {
        throw new Error(
          `Slot "${slotRow.id}" is group_rank but source_group_id/source_rank is missing.`,
        );
      }
      if (!group) {
        throw new Error(
          `Slot "${slotRow.id}" references group "${slotRow.source_group_id}" which is missing from the snapshot.`,
        );
      }
      return {
        type: "group_qualifier",
        groupId: slotRow.source_group_id,
        groupRank: slotRow.source_rank,
      };
    case "match_winner":
      if (!slotRow.source_match_id) {
        throw new Error(`Slot "${slotRow.id}" is match_winner but source_match_id is missing.`);
      }
      return { type: "winner_of_match", matchId: slotRow.source_match_id };
    case "match_loser":
      if (!slotRow.source_match_id) {
        throw new Error(`Slot "${slotRow.id}" is match_loser but source_match_id is missing.`);
      }
      return { type: "loser_of_match", matchId: slotRow.source_match_id };
    case "bye":
      return { type: "bye" };
    case "manual":
    default:
      return { type: "manual" };
  }
}

function compareMatches(
  left: SupabaseMatchRow,
  right: SupabaseMatchRow,
  roundMap: Map<string, SupabaseStageRoundRow>,
): number {
  const leftRound = getRoundNumber(left, roundMap);
  const rightRound = getRoundNumber(right, roundMap);

  if (leftRound !== rightRound) {
    return leftRound - rightRound;
  }

  const leftPosition = left.bracket_position ?? left.match_no ?? 0;
  const rightPosition = right.bracket_position ?? right.match_no ?? 0;

  if (leftPosition !== rightPosition) {
    return leftPosition - rightPosition;
  }

  return left.id.localeCompare(right.id);
}

function getRoundNumber(
  match: SupabaseMatchRow,
  roundMap: Map<string, SupabaseStageRoundRow>,
): number {
  if (match.stage_round_id && roundMap.has(match.stage_round_id)) {
    return roundMap.get(match.stage_round_id)!.round_no;
  }

  return 1;
}

function getRoundName(
  match: SupabaseMatchRow,
  roundMap: Map<string, SupabaseStageRoundRow>,
): string {
  if (match.stage_round_id && roundMap.has(match.stage_round_id)) {
    return roundMap.get(match.stage_round_id)!.name;
  }

  return "Round 1";
}

function hydrateMatchStatus(
  status: SupabaseMatchStatus,
  slots: [BracketSlot, BracketSlot],
  winnerParticipantId: string | undefined,
): MatchStatus {
  if (winnerParticipantId) {
    return "finished";
  }

  if (status === "live" || status === "scheduled" || status === "cancelled") {
    return status;
  }

  if (status === "ready") {
    return "ready";
  }

  const knownParticipants = slots.filter((slot) => Boolean(slot.participantId)).length;
  const byes = slots.filter((slot) => slot.source.type === "bye").length;

  if (knownParticipants === 2) {
    return "ready";
  }

  if (knownParticipants === 1 && byes === 1) {
    return "ready";
  }

  return "pending";
}

function inferDecisionFromRows(
  match: SupabaseMatchRow,
  slots: [BracketSlot, BracketSlot],
): BracketMatch["decidedBy"] {
  if (
    slots.some((slot) => slot.source.type === "bye") &&
    slots.some((slot) => Boolean(slot.participantId))
  ) {
    return "bye";
  }

  if (match.is_draw) {
    return "tiebreaker";
  }

  return "score";
}

function connectMatchesFromSlotSources(matches: Record<string, BracketMatch>): void {
  for (const match of Object.values(matches)) {
    for (const slot of match.slots) {
      if (slot.source.type !== "winner_of_match" && slot.source.type !== "loser_of_match") {
        continue;
      }

      const sourceMatch = matches[slot.source.matchId];
      if (!sourceMatch) {
        throw new Error(
          `Match "${match.id}" references source match "${slot.source.matchId}" which is missing.`,
        );
      }

      const connection = { matchId: match.id, slotIndex: slot.slotIndex };
      if (slot.source.type === "winner_of_match") {
        if (
          sourceMatch.nextWinner &&
          (sourceMatch.nextWinner.matchId !== connection.matchId ||
            sourceMatch.nextWinner.slotIndex !== connection.slotIndex)
        ) {
          throw new Error(
            `Match "${sourceMatch.id}" has multiple winner targets, which this runtime does not support.`,
          );
        }
        sourceMatch.nextWinner = connection;
      } else {
        if (
          sourceMatch.nextLoser &&
          (sourceMatch.nextLoser.matchId !== connection.matchId ||
            sourceMatch.nextLoser.slotIndex !== connection.slotIndex)
        ) {
          throw new Error(
            `Match "${sourceMatch.id}" has multiple loser targets, which this runtime does not support.`,
          );
        }
        sourceMatch.nextLoser = connection;
      }
    }
  }
}

function findChampionParticipantId(
  matches: Record<string, BracketMatch>,
): string | undefined {
  const finals = Object.values(matches)
    .filter((match) => !match.nextWinner && Boolean(match.winnerParticipantId))
    .sort((left, right) => {
      if (left.roundNumber !== right.roundNumber) {
        return right.roundNumber - left.roundNumber;
      }
      return right.position - left.position;
    });

  return finals[0]?.winnerParticipantId;
}

function mapCategoryFormatToBracketFormat(
  format: SupabaseCategoryFormat,
): Bracket["format"] {
  if (format === "group_to_knockout") {
    return "group_to_knockout";
  }

  return "single_elimination";
}

function buildBracketTitle(
  categoryName: string | null | undefined,
  stageName: string,
): string {
  if (categoryName && categoryName.trim().length > 0) {
    return `${categoryName} - ${stageName}`;
  }

  return stageName;
}

function didMatchChange(before: BracketMatch, after: BracketMatch): boolean {
  return (
    before.status !== after.status ||
    before.winnerParticipantId !== after.winnerParticipantId ||
    before.completedAt !== after.completedAt
  );
}

function didSlotChange(before: BracketSlot, after: BracketSlot): boolean {
  return (
    before.participantId !== after.participantId ||
    before.label !== after.label ||
    !isSameSource(before.source, after.source)
  );
}

function shouldUpsertScore(
  beforeMatch: BracketMatch,
  afterMatch: BracketMatch,
  slotIndex: 0 | 1,
): boolean {
  const beforeSlot = beforeMatch.slots[slotIndex];
  const afterSlot = afterMatch.slots[slotIndex];
  const beforeResult = getSlotResult(beforeMatch, slotIndex);
  const afterResult = getSlotResult(afterMatch, slotIndex);

  const scoreChanged = beforeSlot.score !== afterSlot.score;
  const resultChanged = beforeResult !== afterResult;
  const becameFinished = beforeMatch.status !== "finished" && afterMatch.status === "finished";

  if (scoreChanged || resultChanged || becameFinished) {
    return true;
  }

  return false;
}

function toSupabaseSlotPatch(
  match: BracketMatch,
  slot: BracketSlot,
): SupabaseMatchSlotPatch {
  const source = toSupabaseSlotSource(slot.source, slot.participantId);

  return {
    match_id: match.id,
    slot_no: (slot.slotIndex + 1) as 1 | 2,
    entry_id: slot.participantId ?? null,
    source_type: source.source_type,
    source_match_id: source.source_match_id,
    source_group_id: source.source_group_id,
    source_rank: source.source_rank,
    label: slot.label ?? null,
  };
}

function toSupabaseScorePatch(
  match: BracketMatch,
  slotIndex: 0 | 1,
): SupabaseMatchScorePatch {
  const slot = match.slots[slotIndex];

  return {
    match_id: match.id,
    slot_no: (slotIndex + 1) as 1 | 2,
    score: slot.score ?? 0,
    result: getSlotResult(match, slotIndex),
  };
}

function toSupabaseSlotSource(
  source: SlotSource,
  participantId: string | undefined,
): {
  source_type: SupabaseSlotSourceType;
  source_match_id: string | null;
  source_group_id: string | null;
  source_rank: number | null;
} {
  switch (source.type) {
    case "winner_of_match":
      return {
        source_type: "match_winner",
        source_match_id: source.matchId,
        source_group_id: null,
        source_rank: null,
      };
    case "loser_of_match":
      return {
        source_type: "match_loser",
        source_match_id: source.matchId,
        source_group_id: null,
        source_rank: null,
      };
    case "group_qualifier":
      return {
        source_type: "group_rank",
        source_match_id: null,
        source_group_id: source.groupId,
        source_rank: source.groupRank,
      };
    case "bye":
      return {
        source_type: "bye",
        source_match_id: null,
        source_group_id: null,
        source_rank: null,
      };
    case "seed":
    case "manual":
    default:
      return {
        source_type: participantId ? "entry" : "manual",
        source_match_id: null,
        source_group_id: null,
        source_rank: null,
      };
  }
}

function mapMatchStatusToSupabase(status: MatchStatus): SupabaseMatchStatus {
  switch (status) {
    case "scheduled":
    case "live":
    case "finished":
    case "cancelled":
    case "ready":
      return status;
    case "pending":
    default:
      return "pending";
  }
}

function getWinningSlotNo(match: BracketMatch): 1 | 2 | null {
  if (!match.winnerParticipantId) {
    return null;
  }

  const winnerIndex = match.slots.findIndex(
    (slot) => slot.participantId === match.winnerParticipantId,
  );

  if (winnerIndex < 0) {
    return null;
  }

  return (winnerIndex + 1) as 1 | 2;
}

function getSlotResult(
  match: BracketMatch,
  slotIndex: 0 | 1,
): SupabaseSlotResult {
  const slot = match.slots[slotIndex];

  if (slot.source.type === "bye" && !slot.participantId) {
    return "bye";
  }

  if (match.status !== "finished") {
    return "pending";
  }

  if (match.winnerParticipantId && slot.participantId === match.winnerParticipantId) {
    return "win";
  }

  if (match.decidedBy === "bye" && !slot.participantId) {
    return "bye";
  }

  if (match.loserParticipantId && slot.participantId === match.loserParticipantId) {
    return "loss";
  }

  return "pending";
}

function isSameSource(left: SlotSource, right: SlotSource): boolean {
  if (left.type !== right.type) {
    return false;
  }

  switch (left.type) {
    case "seed":
      return right.type === "seed" && left.seed === right.seed;
    case "group_qualifier":
      return (
        right.type === "group_qualifier" &&
        left.groupId === right.groupId &&
        left.groupRank === right.groupRank
      );
    case "winner_of_match":
    case "loser_of_match":
      return right.type === left.type && left.matchId === right.matchId;
    case "manual":
    case "bye":
    default:
      return true;
  }
}

function buildSlotKey(matchId: string, slotNo: 1 | 2): string {
  return `${matchId}:${slotNo}`;
}
