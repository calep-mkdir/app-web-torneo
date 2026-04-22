import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import { fetchTournamentLiveSnapshot } from "@/features/live";
import { getPadelSport } from "@/lib/padel";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import { buildEntryHistory, buildKnockoutPath, getEntryLabel } from "./mappers";
import type {
  PublicParticipantPageData,
  PublicSiteStats,
  PublicSportSummary,
  PublicTournamentListItem,
  PublicTournamentPageData,
} from "./types";

export async function getPublicTournamentIndexData(): Promise<{
  tournaments: PublicTournamentListItem[];
}> {
  noStore();
  const supabase = getSupabaseServerClient();

  const [sportsResult, tournamentsResult, categoriesResult, entriesResult, matchesResult] =
    await Promise.all([
      supabase.from("sports").select("id, code, name"),
      supabase
        .from("tournaments")
        .select("id, sport_id, slug, name, venue, timezone, status, start_at, end_at")
        .eq("is_public", true)
        .order("start_at", { ascending: true, nullsFirst: true }),
      supabase.from("categories").select("id, tournament_id"),
      supabase.from("entries").select("id, category_id"),
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
    throw new Error(`No se pudieron cargar las inscripciones: ${entriesResult.error.message}`);
  }

  if (matchesResult.error) {
    throw new Error(`No se pudieron cargar los partidos: ${matchesResult.error.message}`);
  }

  const sports = sportsResult.data ?? [];
  const padelSport = getPadelSport(sports);
  const visibleTournamentRows = (tournamentsResult.data ?? []).filter((tournament) =>
    padelSport ? tournament.sport_id === padelSport.id : true,
  );
  const sportsMap = new Map(sports.map((sport) => [sport.id, sport.name]));
  const categoriesByTournament = new Map<string, string[]>();
  for (const category of categoriesResult.data ?? []) {
    const list = categoriesByTournament.get(category.tournament_id) ?? [];
    list.push(category.id);
    categoriesByTournament.set(category.tournament_id, list);
  }

  const tournaments = visibleTournamentRows.map<PublicTournamentListItem>((tournament) => {
    const categoryIds = categoriesByTournament.get(tournament.id) ?? [];
    const categoryIdSet = new Set(categoryIds);
    const participantsCount = (entriesResult.data ?? []).filter((entry) =>
      categoryIdSet.has(entry.category_id),
    ).length;
    const liveMatchesCount = (matchesResult.data ?? []).filter(
      (match) => categoryIdSet.has(match.category_id) && match.status === "live",
    ).length;

    return {
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      sportName: sportsMap.get(tournament.sport_id) ?? padelSport?.name ?? "Padel",
      venue: tournament.venue,
      timezone: tournament.timezone,
      status: tournament.status,
      startAt: tournament.start_at,
      endAt: tournament.end_at,
      categoriesCount: categoryIds.length,
      participantsCount,
      liveMatchesCount,
    };
  });

  return { tournaments };
}

export async function getPublicHomePageData(): Promise<{
  tournaments: PublicTournamentListItem[];
  featuredTournaments: PublicTournamentListItem[];
  liveTournaments: PublicTournamentListItem[];
  sports: PublicSportSummary[];
  stats: PublicSiteStats;
}> {
  const { tournaments } = await getPublicTournamentIndexData();

  const sportsMap = new Map<string, PublicSportSummary>();
  for (const tournament of tournaments) {
    const current = sportsMap.get(tournament.sportName) ?? {
      name: tournament.sportName,
      tournamentsCount: 0,
      participantsCount: 0,
      liveMatchesCount: 0,
      featuredTournamentSlug: null,
      featuredTournamentName: null,
    };

    current.tournamentsCount += 1;
    current.participantsCount += tournament.participantsCount;
    current.liveMatchesCount += tournament.liveMatchesCount;

    if (!current.featuredTournamentSlug) {
      current.featuredTournamentSlug = tournament.slug;
      current.featuredTournamentName = tournament.name;
    }

    sportsMap.set(tournament.sportName, current);
  }

  const featuredTournaments = tournaments
    .slice()
    .sort((left, right) => {
      if (right.liveMatchesCount !== left.liveMatchesCount) {
        return right.liveMatchesCount - left.liveMatchesCount;
      }

      if (right.participantsCount !== left.participantsCount) {
        return right.participantsCount - left.participantsCount;
      }

      return left.name.localeCompare(right.name, "es");
    })
    .slice(0, 6);

  const liveTournaments = tournaments.filter((tournament) => tournament.liveMatchesCount > 0).slice(0, 3);
  const sports = Array.from(sportsMap.values()).sort((left, right) => {
    if (right.liveMatchesCount !== left.liveMatchesCount) {
      return right.liveMatchesCount - left.liveMatchesCount;
    }

    if (right.tournamentsCount !== left.tournamentsCount) {
      return right.tournamentsCount - left.tournamentsCount;
    }

    return left.name.localeCompare(right.name, "es");
  });

  const stats: PublicSiteStats = {
    tournamentsCount: tournaments.length,
    categoriesCount: tournaments.reduce(
      (total, tournament) => total + tournament.categoriesCount,
      0,
    ),
    participantsCount: tournaments.reduce(
      (total, tournament) => total + tournament.participantsCount,
      0,
    ),
    liveMatchesCount: tournaments.reduce(
      (total, tournament) => total + tournament.liveMatchesCount,
      0,
    ),
    sportsCount: sports.length,
  };

  return {
    tournaments,
    featuredTournaments,
    liveTournaments,
    sports,
    stats,
  };
}

export async function getPublicSportsPageData(): Promise<{
  sports: PublicSportSummary[];
  stats: PublicSiteStats;
  tournaments: PublicTournamentListItem[];
}> {
  const data = await getPublicHomePageData();

  return {
    sports: data.sports,
    stats: data.stats,
    tournaments: data.tournaments,
  };
}

export async function getPublicTournamentPageData(
  slug: string,
): Promise<PublicTournamentPageData> {
  noStore();
  const supabase = getSupabaseServerClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, slug, name, description, venue, timezone, status, start_at, end_at, is_public, sport:sports(name)")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, format, status")
    .eq("tournament_id", tournament.id)
    .order("created_at", { ascending: true });

  if (categoriesError) {
    throw new Error(`No se pudieron cargar las categorias: ${categoriesError.message}`);
  }

  const initialCategoryId = categories?.[0]?.id ?? null;
  const initialSnapshot = initialCategoryId
    ? await fetchTournamentLiveSnapshot(supabase, initialCategoryId)
    : null;

  return {
    tournament: {
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      description: tournament.description,
      venue: tournament.venue,
      timezone: tournament.timezone,
      status: tournament.status,
      startAt: tournament.start_at,
      endAt: tournament.end_at,
      sportName: unwrapRelation(tournament.sport)?.name ?? "Deporte",
    },
    categories: (categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      format: category.format,
      status: category.status,
    })),
    initialCategoryId,
    initialSnapshot,
  };
}

export async function getPublicParticipantPageData(
  slug: string,
  entryId: string,
): Promise<PublicParticipantPageData> {
  noStore();
  const supabase = getSupabaseServerClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, slug, name, description, venue, timezone, status, start_at, end_at, is_public, sport:sports(name)")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .select(
      "id, category_id, seed, status, entry_type, participant:participants(display_name), team:teams(name,short_name), category:categories(id,tournament_id,name,slug,format,status)",
    )
    .eq("id", entryId)
    .single();

  if (entryError || !entry) {
    notFound();
  }

  const category = unwrapRelation(entry.category);
  if (!category || category.tournament_id !== tournament.id) {
    notFound();
  }

  const snapshot = await fetchTournamentLiveSnapshot(supabase, entry.category_id);

  return {
    tournament: {
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      description: tournament.description,
      venue: tournament.venue,
      timezone: tournament.timezone,
      status: tournament.status,
      startAt: tournament.start_at,
      endAt: tournament.end_at,
      sportName: unwrapRelation(tournament.sport)?.name ?? "Deporte",
    },
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      format: category.format,
      status: category.status,
    },
    entry: {
      id: entry.id,
      name: getEntryLabel({
        ...entry,
        participant: unwrapRelation(entry.participant),
        team: unwrapRelation(entry.team),
      }),
      seed: entry.seed ?? null,
      status: entry.status,
    },
    history: buildEntryHistory(snapshot, entry.id),
    knockoutPath: buildKnockoutPath(snapshot, entry.id),
  };
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
