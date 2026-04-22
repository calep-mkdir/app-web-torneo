import { getParticipantPath, hydrateBracketFromSupabase, type Bracket } from "@/lib/brackets";
import type { TournamentLiveSnapshot } from "@/features/live";

import type {
  PublicEntryDirectoryItem,
  PublicMatchViewModel,
} from "./types";

export function buildPublicBracket(snapshot: TournamentLiveSnapshot): Bracket | null {
  const knockoutStage = getPrimaryKnockoutStage(snapshot);
  if (!knockoutStage) {
    return null;
  }

  const stageMatches = snapshot.matches.filter((match) => match.stage_id === knockoutStage.id);
  const stageMatchIds = new Set(stageMatches.map((match) => match.id));

  return hydrateBracketFromSupabase({
    category: snapshot.category,
    stage: knockoutStage,
    stageRounds: snapshot.stageRounds.filter((round) => round.stage_id === knockoutStage.id),
    groups: snapshot.groups.filter((group) => group.stage_id === knockoutStage.id),
    entries: snapshot.entries,
    matches: stageMatches,
    matchSlots: snapshot.matchSlots.filter((slot) => stageMatchIds.has(slot.match_id)),
    matchScores: snapshot.matchScores.filter((score) => stageMatchIds.has(score.match_id)),
  });
}

export function buildMatchViewModels(
  snapshot: TournamentLiveSnapshot,
  entryId?: string,
): PublicMatchViewModel[] {
  const stageMap = new Map(snapshot.stages.map((stage) => [stage.id, stage]));
  const roundMap = new Map(snapshot.stageRounds.map((round) => [round.id, round]));
  const entryMap = new Map(snapshot.entries.map((entry) => [entry.id, entry]));
  const slotsByMatch = snapshot.matchSlots.reduce<
    Map<string, Array<(typeof snapshot.matchSlots)[number]>>
  >((accumulator, slot) => {
    const list = accumulator.get(slot.match_id) ?? [];
    list.push(slot);
    accumulator.set(slot.match_id, list);
    return accumulator;
  }, new Map());
  const scoresByMatch = snapshot.matchScores.reduce<
    Map<string, Array<(typeof snapshot.matchScores)[number]>>
  >((accumulator, score) => {
    const list = accumulator.get(score.match_id) ?? [];
    list.push(score);
    accumulator.set(score.match_id, list);
    return accumulator;
  }, new Map());

  return snapshot.matches
    .map<PublicMatchViewModel>((match) => {
      const stage = stageMap.get(match.stage_id);
      const round = match.stage_round_id ? roundMap.get(match.stage_round_id) : null;
      const slotRows = (slotsByMatch.get(match.id) ?? []).sort((left, right) => left.slot_no - right.slot_no);
      const scoreRows = (scoresByMatch.get(match.id) ?? []).sort((left, right) => left.slot_no - right.slot_no);
      const slot1 = slotRows.find((slot) => slot.slot_no === 1);
      const slot2 = slotRows.find((slot) => slot.slot_no === 2);
      const score1 = scoreRows.find((score) => score.slot_no === 1);
      const score2 = scoreRows.find((score) => score.slot_no === 2);
      const slot1Label = slot1?.entry_id
        ? getEntryLabel(entryMap.get(slot1.entry_id))
        : slot1?.label ?? "Pendiente";
      const slot2Label = slot2?.entry_id
        ? getEntryLabel(entryMap.get(slot2.entry_id))
        : slot2?.label ?? "Pendiente";

      return {
        id: match.id,
        categoryId: snapshot.category.id,
        categoryName: snapshot.category.name ?? "Categoria",
        stageId: match.stage_id,
        stageName: stage?.name ?? "Fase",
        stageType: stage?.stage_type ?? "group",
        roundName: round?.name ?? null,
        roundNo: round?.round_no ?? null,
        status: match.status,
        scheduledAt: match.scheduled_at ?? null,
        venue: match.venue ?? null,
        matchNo: match.match_no ?? null,
        bracketPosition: match.bracket_position ?? null,
        slot1EntryId: slot1?.entry_id ?? null,
        slot1Label,
        slot1Score: score1?.score ?? null,
        slot2EntryId: slot2?.entry_id ?? null,
        slot2Label,
        slot2Score: score2?.score ?? null,
        winningSlotNo: match.winning_slot_no ?? null,
        outcomeForEntry: entryId
          ? getOutcomeForEntry(match.winning_slot_no ?? null, entryId, slot1?.entry_id ?? null, slot2?.entry_id ?? null, match.is_draw ?? false)
          : undefined,
      };
    })
    .sort(compareMatchViewModels);
}

export function buildEntryDirectory(
  snapshot: TournamentLiveSnapshot,
): PublicEntryDirectoryItem[] {
  const slotsByMatch = snapshot.matchSlots.reduce<
    Map<string, Array<(typeof snapshot.matchSlots)[number]>>
  >((accumulator, slot) => {
    const list = accumulator.get(slot.match_id) ?? [];
    list.push(slot);
    accumulator.set(slot.match_id, list);
    return accumulator;
  }, new Map());
  const entryStats = new Map<
    string,
    { matchesPlayed: number; wins: number; losses: number }
  >();

  for (const match of snapshot.matches) {
    const slots = slotsByMatch.get(match.id) ?? [];
    const slot1 = slots.find((slot) => slot.slot_no === 1);
    const slot2 = slots.find((slot) => slot.slot_no === 2);
    const entryIds = [slot1?.entry_id, slot2?.entry_id].filter(
      (value): value is string => Boolean(value),
    );

    for (const currentEntryId of entryIds) {
      const current = entryStats.get(currentEntryId) ?? {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
      };

      if (match.status === "finished") {
        current.matchesPlayed += 1;

        if (match.winning_slot_no === 1 && slot1?.entry_id === currentEntryId) {
          current.wins += 1;
        } else if (match.winning_slot_no === 2 && slot2?.entry_id === currentEntryId) {
          current.wins += 1;
        } else if (match.winning_slot_no != null) {
          current.losses += 1;
        }
      }

      entryStats.set(currentEntryId, current);
    }
  }

  return snapshot.entries
    .map<PublicEntryDirectoryItem>((entry) => {
      const stats = entryStats.get(entry.id) ?? {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
      };

      return {
        id: entry.id,
        name: getEntryLabel(entry),
        seed: entry.seed ?? null,
        status: entry.status ?? "active",
        matchesPlayed: stats.matchesPlayed,
        wins: stats.wins,
        losses: stats.losses,
      };
    })
    .sort((left, right) => {
      const leftSeed = left.seed ?? Number.MAX_SAFE_INTEGER;
      const rightSeed = right.seed ?? Number.MAX_SAFE_INTEGER;

      if (leftSeed !== rightSeed) {
        return leftSeed - rightSeed;
      }

      return left.name.localeCompare(right.name);
    });
}

export function buildEntryHistory(
  snapshot: TournamentLiveSnapshot,
  entryId: string,
): PublicMatchViewModel[] {
  const stageMap = new Map(snapshot.stages.map((stage) => [stage.id, stage]));

  return buildMatchViewModels(snapshot, entryId)
    .filter((match) => match.slot1EntryId === entryId || match.slot2EntryId === entryId)
    .sort((left, right) => {
      const leftStageSequence = stageMap.get(left.stageId)?.sequence_no ?? Number.MAX_SAFE_INTEGER;
      const rightStageSequence = stageMap.get(right.stageId)?.sequence_no ?? Number.MAX_SAFE_INTEGER;

      if (leftStageSequence !== rightStageSequence) {
        return leftStageSequence - rightStageSequence;
      }

      const leftRoundNo = left.roundNo ?? Number.MAX_SAFE_INTEGER;
      const rightRoundNo = right.roundNo ?? Number.MAX_SAFE_INTEGER;

      if (leftRoundNo !== rightRoundNo) {
        return leftRoundNo - rightRoundNo;
      }

      const leftScheduled = left.scheduledAt ? Date.parse(left.scheduledAt) : Number.MAX_SAFE_INTEGER;
      const rightScheduled = right.scheduledAt ? Date.parse(right.scheduledAt) : Number.MAX_SAFE_INTEGER;

      if (leftScheduled !== rightScheduled) {
        return leftScheduled - rightScheduled;
      }

      const leftPosition = left.bracketPosition ?? left.matchNo ?? Number.MAX_SAFE_INTEGER;
      const rightPosition = right.bracketPosition ?? right.matchNo ?? Number.MAX_SAFE_INTEGER;

      if (leftPosition !== rightPosition) {
        return leftPosition - rightPosition;
      }

      return left.id.localeCompare(right.id);
    });
}

export function buildKnockoutPath(
  snapshot: TournamentLiveSnapshot,
  entryId: string,
) {
  const bracket = buildPublicBracket(snapshot);
  if (!bracket || !bracket.participants[entryId]) {
    return null;
  }

  return getParticipantPath(bracket, entryId);
}

export function getPrimaryKnockoutStage(snapshot: TournamentLiveSnapshot) {
  return snapshot.stages
    .filter((stage) => stage.stage_type === "knockout")
    .sort((left, right) => left.sequence_no - right.sequence_no)[0] ?? null;
}

export function getEntryLabel(
  entry:
    | TournamentLiveSnapshot["entries"][number]
    | null
    | undefined,
): string {
  if (!entry) {
    return "Pendiente";
  }

  const participant = unwrapRelation(entry.participant);
  const team = unwrapRelation(entry.team);

  if (entry.entry_type === "team") {
    return team?.short_name ?? team?.name ?? `Equipo ${entry.id}`;
  }

  return participant?.display_name ?? `Participante ${entry.id}`;
}

function getOutcomeForEntry(
  winningSlotNo: 1 | 2 | null,
  entryId: string,
  slot1EntryId: string | null,
  slot2EntryId: string | null,
  isDraw: boolean,
): PublicMatchViewModel["outcomeForEntry"] {
  if (slot1EntryId !== entryId && slot2EntryId !== entryId) {
    return "pending";
  }

  if (winningSlotNo == null) {
    return "pending";
  }

  if (isDraw) {
    return "draw";
  }

  const participantSlotNo = slot1EntryId === entryId ? 1 : 2;
  return participantSlotNo === winningSlotNo ? "win" : "loss";
}

function compareMatchViewModels(left: PublicMatchViewModel, right: PublicMatchViewModel) {
  const statusDifference = getStatusRank(left.status) - getStatusRank(right.status);
  if (statusDifference !== 0) {
    return statusDifference;
  }

  const leftScheduled = left.scheduledAt ? Date.parse(left.scheduledAt) : Number.MAX_SAFE_INTEGER;
  const rightScheduled = right.scheduledAt ? Date.parse(right.scheduledAt) : Number.MAX_SAFE_INTEGER;
  if (leftScheduled !== rightScheduled) {
    return leftScheduled - rightScheduled;
  }

  const leftPosition = left.bracketPosition ?? left.matchNo ?? Number.MAX_SAFE_INTEGER;
  const rightPosition = right.bracketPosition ?? right.matchNo ?? Number.MAX_SAFE_INTEGER;
  if (leftPosition !== rightPosition) {
    return leftPosition - rightPosition;
  }

  return left.id.localeCompare(right.id);
}

function getStatusRank(status: string) {
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

function unwrapRelation<T extends object>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
