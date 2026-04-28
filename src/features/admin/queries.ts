import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import { getPadelSport } from "@/lib/padel";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import type {
  SportOption,
  TournamentAdminDetail,
  TournamentCategoryRecord,
  TournamentEntryRecord,
  TournamentListItem,
  TournamentMatchRecord,
  TournamentStageRecord,
  TournamentStageRoundRecord,
} from "./types";

export async function getAdminOverviewData(): Promise<{
  sport: SportOption | null;
  tournaments: TournamentListItem[];
  stats: {
    tournamentsCount: number;
    entriesCount: number;
    matchesCount: number;
    finishedCount: number;
  };
}> {
  noStore();
  const supabase = getSupabaseServerClient();

  const [sportsResult, tournamentsResult, categoriesResult, entriesResult, matchesResult] =
    await Promise.all([
      supabase.from("sports").select("id, code, name").order("name"),
      supabase
        .from("tournaments")
        .select("id, sport_id, name, slug, status, is_public, timezone, start_at, end_at")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, tournament_id"),
      supabase.from("entries").select("id, category_id, status"),
      supabase.from("matches").select("id, category_id, status"),
    ]);

  if (sportsResult.error) {
    throw new Error(`No se pudieron cargar los deportes: ${sportsResult.error.message}`);
  }

  if (tournamentsResult.error) {
    throw new Error(`No se pudieron cargar los torneos: ${tournamentsResult.error.message}`);
  }

  if (categoriesResult.error) {
    throw new Error(`No se pudieron cargar las categorias: ${categoriesResult.error.message}`);
  }

  if (entriesResult.error) {
    throw new Error(`No se pudieron cargar los participantes: ${entriesResult.error.message}`);
  }

  if (matchesResult.error) {
    throw new Error(`No se pudieron cargar los partidos: ${matchesResult.error.message}`);
  }

  const sports = (sportsResult.data ?? []) as SportOption[];
  const tournaments = tournamentsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const entries = entriesResult.data ?? [];
  const matches = matchesResult.data ?? [];

  const padelSport = getPadelSport(sports);
  const visibleSportIds = new Set(
    padelSport ? [padelSport.id] : sports.map((sport) => sport.id),
  );
  const sportMap = new Map(sports.map((sport) => [sport.id, sport.name]));
  const categoriesByTournament = new Map<string, string[]>();
  for (const category of categories) {
    const list = categoriesByTournament.get(category.tournament_id) ?? [];
    list.push(category.id);
    categoriesByTournament.set(category.tournament_id, list);
  }

  const tournamentItems: TournamentListItem[] = tournaments
    .filter((tournament) => visibleSportIds.has(tournament.sport_id))
    .map((tournament) => {
    const categoryIds = categoriesByTournament.get(tournament.id) ?? [];
    const categoryIdSet = new Set(categoryIds);
    const tournamentEntries = entries.filter((entry) => categoryIdSet.has(entry.category_id));
    const tournamentMatches = matches.filter((match) => categoryIdSet.has(match.category_id));

    return {
      id: tournament.id,
      sportId: tournament.sport_id,
      sportName: sportMap.get(tournament.sport_id) ?? "Sin deporte",
      name: tournament.name,
      slug: tournament.slug,
      status: tournament.status,
      isPublic: tournament.is_public,
      timezone: tournament.timezone,
      startAt: tournament.start_at,
      endAt: tournament.end_at,
      categoriesCount: categoryIds.length,
      entrantsCount: tournamentEntries.length,
      matchesCount: tournamentMatches.length,
      finishedMatchesCount: tournamentMatches.filter((match) => match.status === "finished").length,
    };
    });

  return {
    sport: padelSport,
    tournaments: tournamentItems,
    stats: {
      tournamentsCount: tournamentItems.length,
      entriesCount: entries.length,
      matchesCount: matches.length,
      finishedCount: matches.filter((match) => match.status === "finished").length,
    },
  };
}

export async function getTournamentAdminDetail(
  tournamentId: string,
): Promise<TournamentAdminDetail> {
  noStore();
  const supabase = getSupabaseServerClient();

  const [sportsResult, tournamentResult, categoriesResult] = await Promise.all([
    supabase.from("sports").select("id, code, name").order("name"),
    supabase
      .from("tournaments")
      .select("id, sport_id, name, slug, description, venue, timezone, status, is_public, start_at, end_at")
      .eq("id", tournamentId)
      .single(),
    supabase
      .from("categories")
      .select("id, tournament_id, name, slug, format, status, gender, age_group, max_entries")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true }),
  ]);

  if (sportsResult.error) {
    throw new Error(`No se pudieron cargar los deportes: ${sportsResult.error.message}`);
  }

  if (tournamentResult.error || !tournamentResult.data) {
    notFound();
  }

  if (categoriesResult.error) {
    throw new Error(`No se pudieron cargar las categorias: ${categoriesResult.error.message}`);
  }

  const tournament = tournamentResult.data;
  const sports = (sportsResult.data ?? []) as SportOption[];
  const sportMap = new Map(sports.map((sport) => [sport.id, sport.name]));
  const categories = (categoriesResult.data ?? []).map<TournamentCategoryRecord>((category) => ({
    id: category.id,
    tournamentId: category.tournament_id,
    name: category.name,
    slug: category.slug,
    format: category.format,
    status: category.status,
    gender: category.gender,
    ageGroup: category.age_group,
    maxEntries: category.max_entries,
  }));

  const categoryIds = categories.map((category) => category.id);

  const [stagesResult, entriesResult, matchesResult] = await Promise.all([
    categoryIds.length > 0
      ? supabase
          .from("stages")
          .select("id, category_id, stage_type, name, sequence_no, status")
          .in("category_id", categoryIds)
          .order("sequence_no", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    categoryIds.length > 0
      ? supabase
          .from("entries")
          .select(
            "id, category_id, entry_type, seed, status, participant_id, team_id, participant:participants(display_name), team:teams(name)",
          )
          .in("category_id", categoryIds)
          .order("seed", { ascending: true, nullsFirst: false })
      : Promise.resolve({ data: [], error: null }),
    categoryIds.length > 0
      ? supabase
          .from("matches")
          .select(
            "id, category_id, stage_id, stage_round_id, group_id, status, scheduled_at, venue, match_no, bracket_position, winning_slot_no",
          )
          .in("category_id", categoryIds)
          .order("scheduled_at", { ascending: true, nullsFirst: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (stagesResult.error) {
    throw new Error(`No se pudieron cargar las fases: ${stagesResult.error.message}`);
  }

  if (entriesResult.error) {
    throw new Error(`No se pudieron cargar los participantes: ${entriesResult.error.message}`);
  }

  if (matchesResult.error) {
    throw new Error(`No se pudieron cargar los partidos: ${matchesResult.error.message}`);
  }

  const stages = (stagesResult.data ?? []).map<TournamentStageRecord>((stage) => ({
    id: stage.id,
    categoryId: stage.category_id,
    stageType: stage.stage_type,
    name: stage.name,
    sequenceNo: stage.sequence_no,
    status: stage.status,
  }));

  const entries = (entriesResult.data ?? []).map<TournamentEntryRecord>((entry) => {
    const participant = unwrapRelation(entry.participant);
    const team = unwrapRelation(entry.team);

    return {
      id: entry.id,
      categoryId: entry.category_id,
      entryType: entry.entry_type,
      seed: entry.seed,
      status: entry.status,
      participantId: entry.participant_id,
      teamId: entry.team_id,
      participantName:
        entry.entry_type === "team"
          ? team?.name ?? `Equipo ${entry.id}`
          : participant?.display_name ?? `Participante ${entry.id}`,
    };
  });

  const matches = matchesResult.data ?? [];
  const stageIds = stages.map((stage) => stage.id);
  const matchIds = matches.map((match) => match.id);

  const [stageRoundsResult, matchSlotsResult, matchScoresResult] = await Promise.all([
    stageIds.length > 0
      ? supabase
          .from("stage_rounds")
          .select("id, stage_id, round_no, name")
          .in("stage_id", stageIds)
          .order("round_no", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    matchIds.length > 0
      ? supabase
          .from("match_slots")
          .select("id, match_id, slot_no, entry_id, label")
          .in("match_id", matchIds)
          .order("slot_no", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    matchIds.length > 0
      ? supabase
          .from("match_scores")
          .select("id, match_id, slot_no, score")
          .in("match_id", matchIds)
          .order("slot_no", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (stageRoundsResult.error) {
    throw new Error(`No se pudieron cargar las rondas: ${stageRoundsResult.error.message}`);
  }

  if (matchSlotsResult.error) {
    throw new Error(`No se pudieron cargar los slots de partido: ${matchSlotsResult.error.message}`);
  }

  if (matchScoresResult.error) {
    throw new Error(`No se pudieron cargar los marcadores: ${matchScoresResult.error.message}`);
  }

  const stageRounds = (stageRoundsResult.data ?? []).map<TournamentStageRoundRecord>((round) => ({
    id: round.id,
    stageId: round.stage_id,
    roundNo: round.round_no,
    name: round.name,
  }));

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const stageMap = new Map(stages.map((stage) => [stage.id, stage]));
  const roundMap = new Map(stageRounds.map((round) => [round.id, round]));
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));

  const slotsByMatch = new Map<string, { slot_no: number; entry_id: string | null; label: string | null }[]>();
  for (const slot of matchSlotsResult.data ?? []) {
    const list = slotsByMatch.get(slot.match_id) ?? [];
    list.push(slot);
    slotsByMatch.set(slot.match_id, list);
  }

  const scoresByMatch = new Map<string, { slot_no: number; score: number }[]>();
  for (const score of matchScoresResult.data ?? []) {
    const list = scoresByMatch.get(score.match_id) ?? [];
    list.push(score);
    scoresByMatch.set(score.match_id, list);
  }

  const matchRecords = matches.map<TournamentMatchRecord>((match) => {
    const slots = (slotsByMatch.get(match.id) ?? []).sort((a, b) => a.slot_no - b.slot_no);
    const scores = (scoresByMatch.get(match.id) ?? []).sort((a, b) => a.slot_no - b.slot_no);
    const slot1 = slots.find((slot) => slot.slot_no === 1);
    const slot2 = slots.find((slot) => slot.slot_no === 2);
    const score1 = scores.find((score) => score.slot_no === 1);
    const score2 = scores.find((score) => score.slot_no === 2);
    const category = categoryMap.get(match.category_id);
    const stage = stageMap.get(match.stage_id);
    const round = match.stage_round_id ? roundMap.get(match.stage_round_id) : null;

    return {
      id: match.id,
      categoryId: match.category_id,
      stageId: match.stage_id,
      stageRoundId: match.stage_round_id,
      groupId: match.group_id,
      status: match.status,
      scheduledAt: match.scheduled_at,
      venue: match.venue,
      matchNo: match.match_no,
      bracketPosition: match.bracket_position,
      winningSlotNo: match.winning_slot_no,
      stageName: stage?.name ?? "Sin fase",
      roundName: round?.name ?? null,
      categoryName: category?.name ?? "Sin categoria",
      slot1EntryId: slot1?.entry_id ?? null,
      slot1Label: slot1?.entry_id
        ? entryMap.get(slot1.entry_id)?.participantName ?? slot1.label ?? "Pendiente"
        : slot1?.label ?? "Pendiente",
      slot1Score: score1?.score ?? null,
      slot2EntryId: slot2?.entry_id ?? null,
      slot2Label: slot2?.entry_id
        ? entryMap.get(slot2.entry_id)?.participantName ?? slot2.label ?? "Pendiente"
        : slot2?.label ?? "Pendiente",
      slot2Score: score2?.score ?? null,
    };
  });

  return {
    tournament: {
      id: tournament.id,
      name: tournament.name,
      slug: tournament.slug,
      description: tournament.description,
      venue: tournament.venue,
      timezone: tournament.timezone,
      status: tournament.status,
      isPublic: tournament.is_public,
      startAt: tournament.start_at,
      endAt: tournament.end_at,
      sportId: tournament.sport_id,
      sportName: sportMap.get(tournament.sport_id) ?? "Padel",
    },
    categories,
    stages,
    stageRounds,
    entries,
    matches: matchRecords,
    stats: {
      categoriesCount: categories.length,
      participantsCount: entries.length,
      matchesCount: matchRecords.length,
      pendingMatchesCount: matchRecords.filter((match) => match.status !== "finished").length,
      finishedMatchesCount: matchRecords.filter((match) => match.status === "finished").length,
    },
  };
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
