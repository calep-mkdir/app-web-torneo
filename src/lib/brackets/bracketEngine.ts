export type BracketFormat =
  | "single_elimination"
  | "double_elimination"
  | "group_to_knockout";

export type BracketSide = "main" | "winners" | "losers" | "finals";
export type MatchStatus =
  | "pending"
  | "ready"
  | "scheduled"
  | "live"
  | "finished"
  | "cancelled";
export type MatchDecision = "score" | "tiebreaker" | "manual" | "walkover" | "bye";

export interface BracketParticipant {
  id: string;
  name: string;
  seed?: number;
  groupId?: string;
  groupName?: string;
  groupRank?: number;
  metadata?: Record<string, unknown>;
}

export interface GroupQualifier extends BracketParticipant {
  groupId: string;
  groupRank: number;
}

export type SlotSource =
  | { type: "seed"; seed: number }
  | { type: "group_qualifier"; groupId: string; groupRank: number }
  | { type: "winner_of_match"; matchId: string }
  | { type: "loser_of_match"; matchId: string }
  | { type: "manual" }
  | { type: "bye" };

export interface BracketSlot {
  slotIndex: 0 | 1;
  participantId?: string;
  source: SlotSource;
  score: number | null;
  isLocked: boolean;
  label?: string;
}

export interface BracketConnection {
  matchId: string;
  slotIndex: 0 | 1;
}

export interface BracketMatch {
  id: string;
  roundNumber: number;
  roundName: string;
  bracketSide: BracketSide;
  position: number;
  status: MatchStatus;
  slots: [BracketSlot, BracketSlot];
  nextWinner?: BracketConnection;
  nextLoser?: BracketConnection;
  winnerParticipantId?: string;
  loserParticipantId?: string;
  decidedBy?: MatchDecision;
  completedAt?: string;
  notes: string[];
}

export interface BracketRound {
  id: string;
  roundNumber: number;
  bracketSide: BracketSide;
  name: string;
  matchIds: string[];
}

export interface Bracket {
  id: string;
  title?: string;
  format: BracketFormat;
  generatedAt: string;
  autoAdvanceByes: boolean;
  rounds: BracketRound[];
  matches: Record<string, BracketMatch>;
  participants: Record<string, BracketParticipant>;
  championParticipantId?: string;
  warnings: string[];
}

interface BaseGenerateBracketInput {
  title?: string;
  autoAdvanceByes?: boolean;
}

export interface GenerateSingleEliminationInput extends BaseGenerateBracketInput {
  format: "single_elimination";
  participants: BracketParticipant[];
}

export interface GenerateGroupToKnockoutInput extends BaseGenerateBracketInput {
  format: "group_to_knockout";
  qualifiers: GroupQualifier[];
}

export interface GenerateDoubleEliminationInput extends BaseGenerateBracketInput {
  format: "double_elimination";
  participants: BracketParticipant[];
}

export type GenerateBracketInput =
  | GenerateSingleEliminationInput
  | GenerateGroupToKnockoutInput
  | GenerateDoubleEliminationInput;

export interface AdvanceWinnerInput {
  matchId: string;
  scores?: {
    slot1?: number | null;
    slot2?: number | null;
  };
  winnerParticipantId?: string;
  tieBreakerWinnerParticipantId?: string;
  reason?: Exclude<MatchDecision, "bye">;
  completedAt?: string;
  notes?: string[];
  allowOverride?: boolean;
}

export interface ParticipantPathStep {
  matchId: string;
  roundNumber: number;
  roundName: string;
  bracketSide: BracketSide;
  position: number;
  opponentParticipantId?: string;
  opponentName?: string;
  scoreFor: number | null;
  scoreAgainst: number | null;
  outcome: "pending" | "scheduled" | "win" | "loss" | "bye";
  advancedToMatchId?: string;
}

export interface ParticipantPath {
  participantId: string;
  participantName: string;
  champion: boolean;
  eliminated: boolean;
  matches: ParticipantPathStep[];
}

export interface ReplaceParticipantInput {
  currentParticipantId: string;
  replacement: BracketParticipant;
  includeFinishedMatches?: boolean;
}

interface MatchResolution {
  winnerParticipantId: string;
  loserParticipantId?: string;
  scores: [number | null, number | null];
  decidedBy: MatchDecision;
  completedAt: string;
  notes: string[];
}

type Placement = BracketParticipant | null;

export function generateBracket(input: GenerateBracketInput): Bracket {
  if (input.format === "double_elimination") {
    throw new Error(
      "double_elimination is reserved in the API but is not implemented in this version yet.",
    );
  }

  const entrants =
    input.format === "group_to_knockout"
      ? normalizeGroupQualifiers(input.qualifiers)
      : normalizeParticipants(input.participants);

  if (entrants.length === 0) {
    throw new Error("At least one participant is required to generate a bracket.");
  }

  const participants = toParticipantMap(entrants);

  if (entrants.length === 1) {
    return {
      id: "bracket-main",
      title: input.title,
      format: input.format,
      generatedAt: new Date().toISOString(),
      autoAdvanceByes: input.autoAdvanceByes ?? true,
      rounds: [],
      matches: {},
      participants,
      championParticipantId: entrants[0].id,
      warnings: ["Only one participant was provided, champion assigned automatically."],
    };
  }

  const bracketSize = nextPowerOfTwo(entrants.length);
  const totalRounds = Math.log2(bracketSize);
  const placements = buildInitialPlacements(
    entrants,
    bracketSize,
    input.format === "group_to_knockout",
  );

  const matches: Record<string, BracketMatch> = {};
  const rounds: BracketRound[] = [];
  const roundsToMatchIds: string[][] = [];

  for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber += 1) {
    const matchCount = bracketSize / 2 ** roundNumber;
    const roundName = getRoundName(matchCount, roundNumber, totalRounds);
    const matchIds: string[] = [];

    for (let position = 1; position <= matchCount; position += 1) {
      const matchId = buildMatchId(roundNumber, position, "main");
      matchIds.push(matchId);

      if (roundNumber === 1) {
        const slotA = buildSeedSlot(0, placements[(position - 1) * 2]);
        const slotB = buildSeedSlot(1, placements[(position - 1) * 2 + 1]);

        matches[matchId] = {
          id: matchId,
          roundNumber,
          roundName,
          bracketSide: "main",
          position,
          status: "pending",
          slots: [slotA, slotB],
          notes: [],
        };
      } else {
        const previousRound = roundsToMatchIds[roundNumber - 2];
        const leftSourceMatchId = previousRound[(position - 1) * 2];
        const rightSourceMatchId = previousRound[(position - 1) * 2 + 1];

        matches[matchId] = {
          id: matchId,
          roundNumber,
          roundName,
          bracketSide: "main",
          position,
          status: "pending",
          slots: [
            {
              slotIndex: 0,
              source: { type: "winner_of_match", matchId: leftSourceMatchId },
              score: null,
              isLocked: false,
            },
            {
              slotIndex: 1,
              source: { type: "winner_of_match", matchId: rightSourceMatchId },
              score: null,
              isLocked: false,
            },
          ],
          notes: [],
        };
      }
    }

    roundsToMatchIds.push(matchIds);
    rounds.push({
      id: `round-main-${roundNumber}`,
      roundNumber,
      bracketSide: "main",
      name: roundName,
      matchIds,
    });
  }

  for (let roundNumber = 1; roundNumber < totalRounds; roundNumber += 1) {
    const currentRound = roundsToMatchIds[roundNumber - 1];
    const nextRound = roundsToMatchIds[roundNumber];

    for (let index = 0; index < currentRound.length; index += 1) {
      const matchId = currentRound[index];
      const nextMatchId = nextRound[Math.floor(index / 2)];
      const slotIndex = (index % 2) as 0 | 1;
      matches[matchId].nextWinner = { matchId: nextMatchId, slotIndex };
    }
  }

  const bracket: Bracket = {
    id: "bracket-main",
    title: input.title,
    format: input.format,
    generatedAt: new Date().toISOString(),
    autoAdvanceByes: input.autoAdvanceByes ?? true,
    rounds,
    matches,
    participants,
    warnings: [],
  };

  refreshMatchStatuses(bracket);

  return bracket.autoAdvanceByes ? resolveAutomaticByes(bracket) : bracket;
}

export function advanceWinner(bracket: Bracket, input: AdvanceWinnerInput): Bracket {
  const next = cloneBracket(bracket);
  const match = next.matches[input.matchId];

  if (!match) {
    throw new Error(`Match "${input.matchId}" was not found in the bracket.`);
  }

  if (match.status === "finished" && !input.allowOverride) {
    throw new Error(
      `Match "${input.matchId}" is already finished. Pass allowOverride to override it.`,
    );
  }

  const resolution = resolveMatchOutcome(next, match, input);
  applyMatchResolution(next, match.id, resolution, input.allowOverride ?? false);

  return next.autoAdvanceByes ? resolveAutomaticByes(next) : next;
}

export function getParticipantPath(bracket: Bracket, participantId: string): ParticipantPath {
  const participant = bracket.participants[participantId];

  if (!participant) {
    throw new Error(`Participant "${participantId}" was not found in the bracket.`);
  }

  const matches = getMatchesInDisplayOrder(bracket).filter((match) =>
    match.slots.some((slot) => slot.participantId === participantId),
  );

  const steps: ParticipantPathStep[] = matches.map((match) => {
    const ownSlot = match.slots.find((slot) => slot.participantId === participantId);
    const opponentSlot = match.slots.find((slot) => slot.participantId !== participantId);
    const advancedToMatchId =
      match.winnerParticipantId === participantId ? match.nextWinner?.matchId : undefined;

    let outcome: ParticipantPathStep["outcome"] = "scheduled";
    if (match.status === "finished") {
      if (match.decidedBy === "bye" && match.winnerParticipantId === participantId) {
        outcome = "bye";
      } else if (match.winnerParticipantId === participantId) {
        outcome = "win";
      } else {
        outcome = "loss";
      }
    } else if (match.status === "pending") {
      outcome = "pending";
    }

    return {
      matchId: match.id,
      roundNumber: match.roundNumber,
      roundName: match.roundName,
      bracketSide: match.bracketSide,
      position: match.position,
      opponentParticipantId: opponentSlot?.participantId,
      opponentName: opponentSlot?.participantId
        ? bracket.participants[opponentSlot.participantId]?.name
        : opponentSlot?.source.type === "bye"
          ? "BYE"
          : undefined,
      scoreFor: ownSlot?.score ?? null,
      scoreAgainst: opponentSlot?.score ?? null,
      outcome,
      advancedToMatchId,
    };
  });

  const eliminated = steps.some((step) => step.outcome === "loss");

  return {
    participantId,
    participantName: participant.name,
    champion: bracket.championParticipantId === participantId,
    eliminated,
    matches: steps,
  };
}

export function replaceParticipantInPendingMatches(
  bracket: Bracket,
  input: ReplaceParticipantInput,
): Bracket {
  if (!isParticipantReferenced(bracket, input.currentParticipantId)) {
    throw new Error(
      `Participant "${input.currentParticipantId}" is not currently referenced in the bracket.`,
    );
  }

  if (
    input.replacement.id !== input.currentParticipantId &&
    bracket.participants[input.replacement.id]
  ) {
    throw new Error(
      `Replacement participant "${input.replacement.id}" already exists in the bracket.`,
    );
  }

  const next = cloneBracket(bracket);
  const includeFinishedMatches = input.includeFinishedMatches ?? false;

  next.participants[input.replacement.id] = { ...input.replacement };

  for (const match of Object.values(next.matches)) {
    if (!includeFinishedMatches && match.status === "finished") {
      continue;
    }

    let replacedInMatch = false;

    for (const slot of match.slots) {
      if (slot.participantId === input.currentParticipantId) {
        slot.participantId = input.replacement.id;
        slot.isLocked = true;
        replacedInMatch = true;
      }
    }

    if (includeFinishedMatches) {
      if (match.winnerParticipantId === input.currentParticipantId) {
        match.winnerParticipantId = input.replacement.id;
      }
      if (match.loserParticipantId === input.currentParticipantId) {
        match.loserParticipantId = input.replacement.id;
      }
    }

    if (replacedInMatch && match.status !== "finished") {
      match.slots[0].score = null;
      match.slots[1].score = null;
      match.decidedBy = undefined;
      match.completedAt = undefined;
    }
  }

  if (includeFinishedMatches && next.championParticipantId === input.currentParticipantId) {
    next.championParticipantId = input.replacement.id;
  }

  if (!isParticipantReferenced(next, input.currentParticipantId)) {
    delete next.participants[input.currentParticipantId];
  }

  next.warnings.push(
    `Participant "${input.currentParticipantId}" was replaced by "${input.replacement.id}".`,
  );

  refreshMatchStatuses(next);

  return next.autoAdvanceByes ? resolveAutomaticByes(next) : next;
}

function normalizeParticipants(participants: BracketParticipant[]): BracketParticipant[] {
  if (participants.length === 0) {
    return [];
  }

  const seenIds = new Set<string>();
  const indexed = participants.map((participant, index) => {
    if (!participant.id.trim()) {
      throw new Error("Participant id cannot be empty.");
    }

    if (seenIds.has(participant.id)) {
      throw new Error(`Participant "${participant.id}" is duplicated.`);
    }

    seenIds.add(participant.id);
    return { participant, index };
  });

  indexed.sort((left, right) => {
    const leftSeed = left.participant.seed ?? Number.MAX_SAFE_INTEGER;
    const rightSeed = right.participant.seed ?? Number.MAX_SAFE_INTEGER;

    if (leftSeed !== rightSeed) {
      return leftSeed - rightSeed;
    }

    return left.index - right.index;
  });

  return indexed.map(({ participant }, index) => ({
    ...participant,
    seed: index + 1,
  }));
}

function normalizeGroupQualifiers(qualifiers: GroupQualifier[]): BracketParticipant[] {
  if (qualifiers.length === 0) {
    return [];
  }

  const seenIds = new Set<string>();
  const indexed = qualifiers.map((qualifier, index) => {
    if (!qualifier.id.trim()) {
      throw new Error("Qualifier id cannot be empty.");
    }

    if (seenIds.has(qualifier.id)) {
      throw new Error(`Qualifier "${qualifier.id}" is duplicated.`);
    }

    seenIds.add(qualifier.id);
    return { qualifier, index };
  });

  indexed.sort((left, right) => {
    if (left.qualifier.groupRank !== right.qualifier.groupRank) {
      return left.qualifier.groupRank - right.qualifier.groupRank;
    }

    const groupComparison = left.qualifier.groupId.localeCompare(right.qualifier.groupId);
    if (groupComparison !== 0) {
      return groupComparison;
    }

    return left.index - right.index;
  });

  return indexed.map(({ qualifier }, index) => ({
    ...qualifier,
    seed: index + 1,
  }));
}

function buildInitialPlacements(
  participants: BracketParticipant[],
  bracketSize: number,
  avoidSameGroupRoundOne: boolean,
): Placement[] {
  const orderedSeedNumbers = buildSeedOrder(bracketSize);
  const seededParticipants = new Map<number, BracketParticipant>();

  for (const participant of participants) {
    seededParticipants.set(participant.seed ?? 0, participant);
  }

  const placements = orderedSeedNumbers.map((seedNumber) => seededParticipants.get(seedNumber) ?? null);

  return avoidSameGroupRoundOne ? rebalanceSameGroupConflicts(placements) : placements;
}

function buildSeedSlot(slotIndex: 0 | 1, participant: Placement): BracketSlot {
  if (!participant) {
    return {
      slotIndex,
      source: { type: "bye" },
      score: null,
      isLocked: true,
      label: "BYE",
    };
  }

  const source: SlotSource =
    participant.groupId && participant.groupRank
      ? {
          type: "group_qualifier",
          groupId: participant.groupId,
          groupRank: participant.groupRank,
        }
      : {
          type: "seed",
          seed: participant.seed ?? 0,
        };

  return {
    slotIndex,
    participantId: participant.id,
    source,
    score: null,
    isLocked: true,
  };
}

function resolveMatchOutcome(
  bracket: Bracket,
  match: BracketMatch,
  input: AdvanceWinnerInput,
): MatchResolution {
  const left = match.slots[0];
  const right = match.slots[1];
  const leftParticipantId = left.participantId;
  const rightParticipantId = right.participantId;
  const scores: [number | null, number | null] = [
    input.scores?.slot1 ?? left.score ?? null,
    input.scores?.slot2 ?? right.score ?? null,
  ];
  const notes = input.notes ? [...input.notes] : [];

  if (left.source.type === "bye" && rightParticipantId) {
    return {
      winnerParticipantId: rightParticipantId,
      scores,
      decidedBy: "bye",
      completedAt: input.completedAt ?? new Date().toISOString(),
      notes,
    };
  }

  if (right.source.type === "bye" && leftParticipantId) {
    return {
      winnerParticipantId: leftParticipantId,
      scores,
      decidedBy: "bye",
      completedAt: input.completedAt ?? new Date().toISOString(),
      notes,
    };
  }

  if (!leftParticipantId || !rightParticipantId) {
    throw new Error(
      `Match "${match.id}" is not ready. Both participants must be known unless one side is a BYE.`,
    );
  }

  const slot1Score = scores[0];
  const slot2Score = scores[1];
  const winnerFromInput = input.winnerParticipantId ?? input.tieBreakerWinnerParticipantId;
  const validParticipants = new Set([leftParticipantId, rightParticipantId]);

  if (winnerFromInput && !validParticipants.has(winnerFromInput)) {
    throw new Error(
      `Winner "${winnerFromInput}" does not belong to match "${match.id}".`,
    );
  }

  if (
    input.tieBreakerWinnerParticipantId &&
    slot1Score !== null &&
    slot2Score !== null &&
    slot1Score !== slot2Score &&
    !input.allowOverride
  ) {
    throw new Error(
      `Tie-break winner cannot be used in "${match.id}" because the scores are not tied.`,
    );
  }

  if (
    winnerFromInput &&
    slot1Score !== null &&
    slot2Score !== null &&
    slot1Score !== slot2Score &&
    !input.allowOverride
  ) {
    const winnerByScore = slot1Score > slot2Score ? leftParticipantId : rightParticipantId;
    if (winnerByScore !== winnerFromInput) {
      throw new Error(
        `Provided winner for "${match.id}" conflicts with the submitted score.`,
      );
    }
  }

  if (winnerFromInput) {
    return {
      winnerParticipantId: winnerFromInput,
      loserParticipantId:
        winnerFromInput === leftParticipantId ? rightParticipantId : leftParticipantId,
      scores,
      decidedBy:
        input.reason ??
        (slot1Score !== null && slot2Score !== null && slot1Score === slot2Score
          ? "tiebreaker"
          : "manual"),
      completedAt: input.completedAt ?? new Date().toISOString(),
      notes,
    };
  }

  if (slot1Score === null || slot2Score === null) {
    throw new Error(
      `Scores or explicit winner are required to resolve match "${match.id}".`,
    );
  }

  if (slot1Score > slot2Score) {
    return {
      winnerParticipantId: leftParticipantId,
      loserParticipantId: rightParticipantId,
      scores,
      decidedBy: input.reason ?? "score",
      completedAt: input.completedAt ?? new Date().toISOString(),
      notes,
    };
  }

  if (slot2Score > slot1Score) {
    return {
      winnerParticipantId: rightParticipantId,
      loserParticipantId: leftParticipantId,
      scores,
      decidedBy: input.reason ?? "score",
      completedAt: input.completedAt ?? new Date().toISOString(),
      notes,
    };
  }

  throw new Error(
    `Knockout match "${match.id}" cannot end tied. Provide tieBreakerWinnerParticipantId.`,
  );
}

function applyMatchResolution(
  bracket: Bracket,
  matchId: string,
  resolution: MatchResolution,
  allowOverride: boolean,
): void {
  const match = bracket.matches[matchId];
  if (!match) {
    throw new Error(`Match "${matchId}" not found.`);
  }

  match.slots[0].score = resolution.scores[0];
  match.slots[1].score = resolution.scores[1];
  match.winnerParticipantId = resolution.winnerParticipantId;
  match.loserParticipantId = resolution.loserParticipantId;
  match.decidedBy = resolution.decidedBy;
  match.completedAt = resolution.completedAt;
  match.status = "finished";
  match.notes = [...match.notes, ...resolution.notes];

  if (match.nextWinner) {
    propagateParticipantToNextMatch(
      bracket,
      match.id,
      match.nextWinner,
      resolution.winnerParticipantId,
      "winner_of_match",
      allowOverride,
    );
  } else {
    bracket.championParticipantId = resolution.winnerParticipantId;
  }

  if (match.nextLoser && resolution.loserParticipantId) {
    propagateParticipantToNextMatch(
      bracket,
      match.id,
      match.nextLoser,
      resolution.loserParticipantId,
      "loser_of_match",
      allowOverride,
    );
  }

  refreshMatchStatuses(bracket);
}

function propagateParticipantToNextMatch(
  bracket: Bracket,
  sourceMatchId: string,
  connection: BracketConnection,
  participantId: string,
  sourceKind: "winner_of_match" | "loser_of_match",
  allowOverride: boolean,
): void {
  const targetMatch = bracket.matches[connection.matchId];
  if (!targetMatch) {
    throw new Error(`Target match "${connection.matchId}" not found.`);
  }

  if (targetMatch.status === "finished" && !allowOverride) {
    throw new Error(
      `Cannot rewrite downstream match "${targetMatch.id}" because it is already finished.`,
    );
  }

  const targetSlot = targetMatch.slots[connection.slotIndex];
  const previousParticipantId = targetSlot.participantId;

  if (
    targetSlot.participantId &&
    targetSlot.participantId !== participantId &&
    !allowOverride
  ) {
    throw new Error(
      `Target slot ${connection.slotIndex + 1} of "${targetMatch.id}" is already occupied by another participant.`,
    );
  }

  if (previousParticipantId && previousParticipantId !== participantId) {
    invalidateMatchBranch(bracket, targetMatch.id);
  }

  targetSlot.participantId = participantId;
  targetSlot.source =
    sourceKind === "winner_of_match"
      ? { type: "winner_of_match", matchId: sourceMatchId }
      : { type: "loser_of_match", matchId: sourceMatchId };
  targetSlot.isLocked = true;

  if (targetMatch.status !== "finished") {
    targetMatch.status = deriveMatchStatus(targetMatch);
  }
}

function invalidateMatchBranch(bracket: Bracket, matchId: string): void {
  const match = bracket.matches[matchId];
  if (!match) {
    throw new Error(`Match "${matchId}" not found.`);
  }

  if (match.nextWinner) {
    clearConnectedSlot(bracket, match.id, match.nextWinner);
  }

  if (match.nextLoser) {
    clearConnectedSlot(bracket, match.id, match.nextLoser);
  }

  resetMatchOutcome(bracket, match);
}

function clearConnectedSlot(
  bracket: Bracket,
  sourceMatchId: string,
  connection: BracketConnection,
): void {
  const targetMatch = bracket.matches[connection.matchId];
  if (!targetMatch) {
    throw new Error(`Target match "${connection.matchId}" not found.`);
  }

  const targetSlot = targetMatch.slots[connection.slotIndex];
  const source = targetSlot.source;
  const isExpectedSource =
    (source.type === "winner_of_match" || source.type === "loser_of_match") &&
    source.matchId === sourceMatchId;

  if (!isExpectedSource) {
    return;
  }

  const hadParticipant = Boolean(targetSlot.participantId);
  const hadOutcome =
    Boolean(targetMatch.winnerParticipantId) ||
    Boolean(targetMatch.loserParticipantId) ||
    Boolean(targetMatch.completedAt) ||
    targetMatch.slots.some((slot) => slot.score !== null);

  targetSlot.participantId = undefined;
  targetSlot.score = null;
  targetSlot.isLocked = false;

  if (hadParticipant || hadOutcome) {
    invalidateMatchBranch(bracket, targetMatch.id);
  } else {
    targetMatch.status = deriveMatchStatus(targetMatch);
  }
}

function resetMatchOutcome(bracket: Bracket, match: BracketMatch): void {
  if (
    bracket.championParticipantId &&
    match.winnerParticipantId &&
    bracket.championParticipantId === match.winnerParticipantId
  ) {
    bracket.championParticipantId = undefined;
  }

  match.winnerParticipantId = undefined;
  match.loserParticipantId = undefined;
  match.decidedBy = undefined;
  match.completedAt = undefined;
  match.slots[0].score = null;
  match.slots[1].score = null;
  match.status = deriveMatchStatus(match);
}

function refreshMatchStatuses(bracket: Bracket): void {
  for (const match of Object.values(bracket.matches)) {
    if (match.status === "finished") {
      continue;
    }

    match.status = deriveMatchStatus(match);
  }
}

function deriveMatchStatus(match: BracketMatch): MatchStatus {
  if (match.winnerParticipantId) {
    return "finished";
  }

  const knownParticipants = match.slots.filter((slot) => Boolean(slot.participantId)).length;
  const byes = match.slots.filter((slot) => slot.source.type === "bye").length;

  if (knownParticipants === 2) {
    return "ready";
  }

  if (knownParticipants === 1 && byes === 1) {
    return "ready";
  }

  return "pending";
}

function resolveAutomaticByes(bracket: Bracket): Bracket {
  const next = cloneBracket(bracket);

  let changed = true;
  while (changed) {
    changed = false;

    for (const match of getMatchesInDisplayOrder(next)) {
      if (match.status !== "ready" || match.winnerParticipantId) {
        continue;
      }

      const winnerId = getByeWinner(match);
      if (!winnerId) {
        continue;
      }

      const resolution = resolveMatchOutcome(next, match, {
        matchId: match.id,
        winnerParticipantId: winnerId,
        reason: "manual",
        notes: ["Resolved automatically because the opposing slot is a BYE."],
        allowOverride: true,
      });

      resolution.decidedBy = "bye";
      applyMatchResolution(next, match.id, resolution, true);
      changed = true;
    }
  }

  return next;
}

function getByeWinner(match: BracketMatch): string | undefined {
  const left = match.slots[0];
  const right = match.slots[1];

  if (left.source.type === "bye" && right.participantId) {
    return right.participantId;
  }

  if (right.source.type === "bye" && left.participantId) {
    return left.participantId;
  }

  return undefined;
}

function rebalanceSameGroupConflicts(placements: Placement[]): Placement[] {
  const next = [...placements];

  for (let leftIndex = 0; leftIndex < next.length; leftIndex += 2) {
    const rightIndex = leftIndex + 1;
    const left = next[leftIndex];
    const right = next[rightIndex];

    if (!left || !right || !left.groupId || !right.groupId || left.groupId !== right.groupId) {
      continue;
    }

    const swapIndex = findNonConflictingSwapIndex(next, leftIndex, rightIndex);
    if (swapIndex >= 0) {
      const current = next[rightIndex];
      next[rightIndex] = next[swapIndex];
      next[swapIndex] = current;
    }
  }

  return next;
}

function findNonConflictingSwapIndex(
  placements: Placement[],
  leftIndex: number,
  rightIndex: number,
): number {
  const left = placements[leftIndex];
  const right = placements[rightIndex];

  if (!left || !right) {
    return -1;
  }

  for (let candidateIndex = 0; candidateIndex < placements.length; candidateIndex += 1) {
    if (candidateIndex === leftIndex || candidateIndex === rightIndex) {
      continue;
    }

    const candidate = placements[candidateIndex];
    if (!candidate) {
      continue;
    }

    if (candidate.groupRank !== right.groupRank) {
      continue;
    }

    if (candidate.groupId === left.groupId) {
      continue;
    }

    const candidateMateIndex = candidateIndex % 2 === 0 ? candidateIndex + 1 : candidateIndex - 1;
    const candidateMate = placements[candidateMateIndex];

    if (candidateMate && candidateMate.groupId && candidateMate.groupId === right.groupId) {
      continue;
    }

    return candidateIndex;
  }

  return -1;
}

function getMatchesInDisplayOrder(bracket: Bracket): BracketMatch[] {
  return Object.values(bracket.matches).sort((left, right) => {
    if (left.roundNumber !== right.roundNumber) {
      return left.roundNumber - right.roundNumber;
    }

    if (left.bracketSide !== right.bracketSide) {
      return left.bracketSide.localeCompare(right.bracketSide);
    }

    return left.position - right.position;
  });
}

function toParticipantMap(participants: BracketParticipant[]): Record<string, BracketParticipant> {
  return participants.reduce<Record<string, BracketParticipant>>((accumulator, participant) => {
    accumulator[participant.id] = { ...participant };
    return accumulator;
  }, {});
}

function buildSeedOrder(size: number): number[] {
  if (size <= 0 || (size & (size - 1)) !== 0) {
    throw new Error(`Bracket size must be a power of two. Received "${size}".`);
  }

  if (size === 1) {
    return [1];
  }

  const previous = buildSeedOrder(size / 2);
  const result: number[] = [];

  for (const seed of previous) {
    result.push(seed, size + 1 - seed);
  }

  return result;
}

function nextPowerOfTwo(value: number): number {
  let current = 1;
  while (current < value) {
    current *= 2;
  }
  return current;
}

function getRoundName(matchCount: number, roundNumber: number, totalRounds: number): string {
  if (matchCount === 1) {
    return "Final";
  }

  if (matchCount === 2) {
    return "Semifinal";
  }

  if (matchCount === 4) {
    return "Quarterfinal";
  }

  return `Round ${roundNumber} of ${totalRounds}`;
}

function buildMatchId(
  roundNumber: number,
  position: number,
  side: BracketSide,
): string {
  return `${side}-r${roundNumber}-m${position}`;
}

function cloneBracket(bracket: Bracket): Bracket {
  const participants = Object.fromEntries(
    Object.entries(bracket.participants).map(([id, participant]) => [id, { ...participant }]),
  );

  const matches = Object.fromEntries(
    Object.entries(bracket.matches).map(([id, match]) => [
      id,
      {
        ...match,
        slots: match.slots.map((slot) => ({
          ...slot,
          source: { ...slot.source },
        })) as [BracketSlot, BracketSlot],
        nextWinner: match.nextWinner ? { ...match.nextWinner } : undefined,
        nextLoser: match.nextLoser ? { ...match.nextLoser } : undefined,
        notes: [...match.notes],
      },
    ]),
  ) as Record<string, BracketMatch>;

  return {
    ...bracket,
    participants,
    matches,
    rounds: bracket.rounds.map((round) => ({
      ...round,
      matchIds: [...round.matchIds],
    })),
    warnings: [...bracket.warnings],
  };
}

function isParticipantReferenced(bracket: Bracket, participantId: string): boolean {
  if (bracket.championParticipantId === participantId) {
    return true;
  }

  return Object.values(bracket.matches).some((match) => {
    if (match.winnerParticipantId === participantId || match.loserParticipantId === participantId) {
      return true;
    }

    return match.slots.some((slot) => slot.participantId === participantId);
  });
}
