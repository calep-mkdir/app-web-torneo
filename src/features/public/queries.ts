import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import { fetchTournamentLiveSnapshot } from "@/features/live";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import { buildEntryHistory, buildKnockoutPath, getEntryLabel } from "./mappers";
import type {
  PublicParticipantPageData,
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
      supabase.from("sports").select("id, name"),
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

  const sportsMap = new Map((sportsResult.data ?? []).map((sport) => [sport.id, sport.name]));
  const categoriesByTournament = new Map<string, string[]>();
  for (const category of categoriesResult.data ?? []) {
    const list = categoriesByTournament.get(category.tournament_id) ?? [];
    list.push(category.id);
    categoriesByTournament.set(category.tournament_id, list);
  }

  const tournaments = (tournamentsResult.data ?? []).map<PublicTournamentListItem>((tournament) => {
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
      sportName: sportsMap.get(tournament.sport_id) ?? "Deporte",
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
