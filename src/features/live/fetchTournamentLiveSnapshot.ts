import type { SupabaseClient } from "@supabase/supabase-js";

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
import type { TournamentLiveSnapshot } from "./types";

export async function fetchTournamentLiveSnapshot(
  supabase: SupabaseClient<any>,
  categoryId: string,
): Promise<TournamentLiveSnapshot> {
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, format, name")
    .eq("id", categoryId)
    .single();

  if (categoryError || !category) {
    throw new Error(
      `Unable to load category "${categoryId}": ${categoryError?.message ?? "not found"}.`,
    );
  }

  const [stagesResult, entriesResult, matchesResult] = await Promise.all([
    supabase
      .from("stages")
      .select("id, category_id, stage_type, sequence_no, name, config")
      .eq("category_id", categoryId)
      .order("sequence_no", { ascending: true }),
    supabase
      .from("entries")
      .select(
        "id, category_id, entry_type, seed, status, participant_id, team_id, metadata, participant:participants(display_name), team:teams(name,short_name)",
      )
      .eq("category_id", categoryId)
      .order("seed", { ascending: true, nullsFirst: false }),
    supabase
      .from("matches")
      .select(
        "id, category_id, stage_id, group_id, stage_round_id, match_no, bracket_position, leg_no, status, scheduled_at, started_at, finished_at, venue, winning_slot_no, is_draw, lock_version, metadata",
      )
      .eq("category_id", categoryId)
      .order("stage_round_id", { ascending: true, nullsFirst: true })
      .order("bracket_position", { ascending: true, nullsFirst: true })
      .order("match_no", { ascending: true, nullsFirst: true }),
  ]);

  if (stagesResult.error) {
    throw new Error(`Unable to load stages: ${stagesResult.error.message}.`);
  }

  if (entriesResult.error) {
    throw new Error(`Unable to load entries: ${entriesResult.error.message}.`);
  }

  if (matchesResult.error) {
    throw new Error(`Unable to load matches: ${matchesResult.error.message}.`);
  }

  const stages = (stagesResult.data ?? []) as SupabaseStageRow[];
  const entries = (entriesResult.data ?? []) as SupabaseEntryRow[];
  const matches = (matchesResult.data ?? []) as SupabaseMatchRow[];

  const stageIds = stages.map((stage) => stage.id);
  const matchIds = matches.map((match) => match.id);

  const [stageRoundsResult, groupsResult, matchSlotsResult, matchScoresResult] =
    await Promise.all([
      stageIds.length > 0
        ? supabase
            .from("stage_rounds")
            .select("id, stage_id, round_no, name")
            .in("stage_id", stageIds)
            .order("round_no", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      stageIds.length > 0
        ? supabase
            .from("groups")
            .select("id, stage_id, code, name, sequence_no")
            .in("stage_id", stageIds)
            .order("sequence_no", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      matchIds.length > 0
        ? supabase
            .from("match_slots")
            .select(
              "id, match_id, slot_no, entry_id, source_type, source_match_id, source_group_id, source_rank, label",
            )
            .in("match_id", matchIds)
            .order("slot_no", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      matchIds.length > 0
        ? supabase
            .from("match_scores")
            .select(
              "id, match_id, slot_no, score, sets_won, ranking_points, result",
            )
            .in("match_id", matchIds)
            .order("slot_no", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (stageRoundsResult.error) {
    throw new Error(`Unable to load stage rounds: ${stageRoundsResult.error.message}.`);
  }

  if (groupsResult.error) {
    throw new Error(`Unable to load groups: ${groupsResult.error.message}.`);
  }

  if (matchSlotsResult.error) {
    throw new Error(`Unable to load match slots: ${matchSlotsResult.error.message}.`);
  }

  if (matchScoresResult.error) {
    throw new Error(`Unable to load match scores: ${matchScoresResult.error.message}.`);
  }

  return {
    category: category as SupabaseCategoryRow,
    stages,
    stageRounds: (stageRoundsResult.data ?? []) as SupabaseStageRoundRow[],
    groups: (groupsResult.data ?? []) as SupabaseGroupRow[],
    entries,
    matches,
    matchSlots: (matchSlotsResult.data ?? []) as SupabaseMatchSlotRow[],
    matchScores: (matchScoresResult.data ?? []) as SupabaseMatchScoreRow[],
  };
}
