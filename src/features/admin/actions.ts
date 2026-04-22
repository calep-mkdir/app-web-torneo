"use server";

import { revalidatePath } from "next/cache";

import {
  advanceWinnerFromSnapshot,
  type SupabaseBracketPatch,
} from "@/lib/brackets";
import { normalizeDateTimeInput } from "@/lib/datetime";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTournamentLiveSnapshot } from "@/features/live";

import {
  categorySchema,
  matchSchema,
  participantRegistrationSchema,
  resultSchema,
  stageRoundSchema,
  stageSchema,
  tournamentSchema,
  type TournamentInput,
} from "./schemas";
import type { AdminActionState } from "./types";
import { initialAdminActionState } from "./types";

export async function createTournamentAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = tournamentSchema.safeParse(readTournamentFormData(formData));
  if (!parsed.success) {
    return fromZodError(parsed.error.flatten().fieldErrors, "Revisa los datos del torneo.");
  }

  const supabase = getSupabaseServerClient();
  let payload: TournamentInput;

  try {
    payload = normalizeTournamentInput(parsed.data);
  } catch (error) {
    return failure(`No se pudo preparar el torneo: ${toErrorMessage(error)}`);
  }

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      sport_id: payload.sportId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      venue: payload.venue,
      timezone: payload.timezone,
      status: payload.status,
      is_public: payload.isPublic,
      start_at: payload.startAt,
      end_at: payload.endAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    return failure(`No se pudo crear el torneo: ${error?.message ?? "error desconocido"}`);
  }

  revalidatePath("/admin");

  return success("Torneo creado correctamente.", data.id);
}

export async function updateTournamentAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = tournamentSchema.safeParse(readTournamentFormData(formData));
  if (!parsed.success || !parsed.data.tournamentId) {
    return fromZodError(parsed.success ? {} : parsed.error.flatten().fieldErrors, "Revisa los datos del torneo.");
  }

  const supabase = getSupabaseServerClient();
  let payload: TournamentInput & { tournamentId: string };

  try {
    payload = normalizeTournamentInput(parsed.data) as TournamentInput & { tournamentId: string };
  } catch (error) {
    return failure(`No se pudo preparar el torneo: ${toErrorMessage(error)}`);
  }

  const { error } = await supabase
    .from("tournaments")
    .update({
      sport_id: payload.sportId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      venue: payload.venue,
      timezone: payload.timezone,
      status: payload.status,
      is_public: payload.isPublic,
      start_at: payload.startAt,
      end_at: payload.endAt,
    })
    .eq("id", payload.tournamentId);

  if (error) {
    return failure(`No se pudo actualizar el torneo: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/tournaments/${payload.tournamentId}`);

  return success("Torneo actualizado.");
}

export async function createCategoryAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = categorySchema.safeParse({
    tournamentId: formData.get("tournamentId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    format: formData.get("format"),
    gender: formData.get("gender"),
    ageGroup: formData.get("ageGroup"),
    maxEntries: formData.get("maxEntries"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error.flatten().fieldErrors, "Revisa los datos de la categoria.");
  }

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;

  const { error } = await supabase.from("categories").insert({
    tournament_id: payload.tournamentId,
    name: payload.name,
    slug: payload.slug,
    format: payload.format,
    gender: payload.gender,
    age_group: payload.ageGroup,
    max_entries: payload.maxEntries,
    status: "draft",
  });

  if (error) {
    return failure(`No se pudo crear la categoria: ${error.message}`);
  }

  revalidatePath(`/admin/tournaments/${payload.tournamentId}`);

  return success("Categoria creada correctamente.");
}

export async function registerParticipantAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = participantRegistrationSchema.safeParse({
    categoryId: formData.get("categoryId"),
    displayName: formData.get("displayName"),
    countryCode: formData.get("countryCode"),
    seed: formData.get("seed"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error.flatten().fieldErrors, "Revisa los datos del participante.");
  }

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      display_name: payload.displayName,
      country_code: payload.countryCode,
    })
    .select("id")
    .single();

  if (participantError || !participant) {
    return failure(
      `No se pudo crear el participante: ${participantError?.message ?? "error desconocido"}`,
    );
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("tournament_id")
    .eq("id", payload.categoryId)
    .single();

  if (categoryError || !category) {
    await supabase.from("participants").delete().eq("id", participant.id);
    return failure(`No se pudo localizar la categoria: ${categoryError?.message ?? "no encontrada"}`);
  }

  const { error: entryError } = await supabase.from("entries").insert({
    category_id: payload.categoryId,
    entry_type: "individual",
    participant_id: participant.id,
    seed: payload.seed,
    status: "active",
  });

  if (entryError) {
    await supabase.from("participants").delete().eq("id", participant.id);
    return failure(`No se pudo registrar la entrada: ${entryError.message}`);
  }

  revalidatePath(`/admin/tournaments/${category.tournament_id}`);

  return success("Participante anadido correctamente.");
}

export async function createStageAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = stageSchema.safeParse({
    categoryId: formData.get("categoryId"),
    stageType: formData.get("stageType"),
    name: formData.get("name"),
    sequenceNo: formData.get("sequenceNo"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error.flatten().fieldErrors, "Revisa los datos de la fase.");
  }

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("tournament_id")
    .eq("id", payload.categoryId)
    .single();

  if (categoryError || !category) {
    return failure(`No se pudo localizar la categoria: ${categoryError?.message ?? "no encontrada"}`);
  }

  const { error } = await supabase.from("stages").insert({
    category_id: payload.categoryId,
    stage_type: payload.stageType,
    name: payload.name,
    sequence_no: payload.sequenceNo,
    status: "draft",
  });

  if (error) {
    return failure(`No se pudo crear la fase: ${error.message}`);
  }

  revalidatePath(`/admin/tournaments/${category.tournament_id}`);

  return success("Fase creada correctamente.");
}

export async function createStageRoundAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = stageRoundSchema.safeParse({
    stageId: formData.get("stageId"),
    roundNo: formData.get("roundNo"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error.flatten().fieldErrors, "Revisa los datos de la ronda.");
  }

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;

  const { data: stage, error: stageError } = await supabase
    .from("stages")
    .select("category_id")
    .eq("id", payload.stageId)
    .single();

  if (stageError || !stage) {
    return failure(`No se pudo localizar la fase: ${stageError?.message ?? "no encontrada"}`);
  }

  const tournamentId = await getTournamentIdByCategoryId(supabase, stage.category_id);
  if (!tournamentId) {
    return failure("No se pudo localizar el torneo asociado a la fase.");
  }

  const { error } = await supabase.from("stage_rounds").insert({
    stage_id: payload.stageId,
    round_no: payload.roundNo,
    name: payload.name,
  });

  if (error) {
    return failure(`No se pudo crear la ronda: ${error.message}`);
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);

  return success("Ronda creada correctamente.");
}

export async function createMatchAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = matchSchema.safeParse({
    categoryId: formData.get("categoryId"),
    stageId: formData.get("stageId"),
    stageRoundId: formData.get("stageRoundId"),
    matchNo: formData.get("matchNo"),
    bracketPosition: formData.get("bracketPosition"),
    scheduledAt: formData.get("scheduledAt"),
    venue: formData.get("venue"),
    slot1EntryId: formData.get("slot1EntryId"),
    slot2EntryId: formData.get("slot2EntryId"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error.flatten().fieldErrors, "Revisa los datos del partido.");
  }

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("tournament_id")
    .eq("id", payload.categoryId)
    .single();

  if (categoryError || !category) {
    return failure(`No se pudo localizar la categoria: ${categoryError?.message ?? "no encontrada"}`);
  }

  const { data: stage, error: stageError } = await supabase
    .from("stages")
    .select("id, category_id")
    .eq("id", payload.stageId)
    .single();

  if (stageError || !stage) {
    return failure(`No se pudo localizar la fase: ${stageError?.message ?? "no encontrada"}`);
  }

  if (stage.category_id !== payload.categoryId) {
    return failure("La fase seleccionada no pertenece a la categoria elegida.");
  }

  if (payload.stageRoundId) {
    const { data: stageRound, error: stageRoundError } = await supabase
      .from("stage_rounds")
      .select("stage_id")
      .eq("id", payload.stageRoundId)
      .single();

    if (stageRoundError || !stageRound) {
      return failure(
        `No se pudo localizar la ronda: ${stageRoundError?.message ?? "no encontrada"}`,
      );
    }

    if (stageRound.stage_id !== payload.stageId) {
      return failure("La ronda seleccionada no pertenece a la fase indicada.");
    }
  }

  const selectedEntryIds = [payload.slot1EntryId, payload.slot2EntryId].filter(
    (value): value is string => Boolean(value),
  );

  if (selectedEntryIds.length !== new Set(selectedEntryIds).size) {
    return failure("No puedes asignar el mismo participante a ambos lados del partido.");
  }

  if (selectedEntryIds.length > 0) {
    const { data: validEntries, error: entriesError } = await supabase
      .from("entries")
      .select("id")
      .eq("category_id", payload.categoryId)
      .in("id", selectedEntryIds);

    if (entriesError) {
      return failure(`No se pudieron validar los participantes: ${entriesError.message}`);
    }

    if ((validEntries?.length ?? 0) !== selectedEntryIds.length) {
      return failure("Uno o varios participantes no pertenecen a la categoria seleccionada.");
    }
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      category_id: payload.categoryId,
      stage_id: payload.stageId,
      stage_round_id: payload.stageRoundId,
      match_no: payload.matchNo,
      bracket_position: payload.bracketPosition,
      scheduled_at: payload.scheduledAt,
      venue: payload.venue,
      status: selectedEntryIds.length > 0 ? "ready" : "pending",
    })
    .select("id")
    .single();

  if (matchError || !match) {
    return failure(`No se pudo crear el partido: ${matchError?.message ?? "error desconocido"}`);
  }

  const slotRows = [
    {
      match_id: match.id,
      slot_no: 1,
      entry_id: payload.slot1EntryId,
      source_type: payload.slot1EntryId ? "entry" : "bye",
      label: null,
    },
    {
      match_id: match.id,
      slot_no: 2,
      entry_id: payload.slot2EntryId,
      source_type: payload.slot2EntryId ? "entry" : "bye",
      label: null,
    },
  ];

  const { error: slotError } = await supabase.from("match_slots").insert(slotRows);
  if (slotError) {
    await supabase.from("matches").delete().eq("id", match.id);
    return failure(`No se pudieron crear los slots del partido: ${slotError.message}`);
  }

  revalidatePath(`/admin/tournaments/${category.tournament_id}`);

  return success("Partido creado correctamente.");
}

export async function submitMatchResultAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = resultSchema.safeParse({
    matchId: formData.get("matchId"),
    slot1Score: formData.get("slot1Score"),
    slot2Score: formData.get("slot2Score"),
    winnerSlotNo: formData.get("winnerSlotNo"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error.flatten().fieldErrors, "Revisa los datos del resultado.");
  }

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, category_id, stage_id")
    .eq("id", payload.matchId)
    .single();

  if (matchError || !match) {
    return failure(`No se pudo localizar el partido: ${matchError?.message ?? "no encontrado"}`);
  }

  const [stageResult, categoryResult] = await Promise.all([
    supabase.from("stages").select("id, stage_type").eq("id", match.stage_id).single(),
    supabase
      .from("categories")
      .select("tournament_id")
      .eq("id", match.category_id)
      .single(),
  ]);

  if (stageResult.error || !stageResult.data) {
    return failure(
      `No se pudo localizar la fase del partido: ${stageResult.error?.message ?? "no encontrada"}`,
    );
  }

  if (categoryResult.error || !categoryResult.data) {
    return failure(
      `No se pudo localizar el torneo del partido: ${categoryResult.error?.message ?? "no encontrado"}`,
    );
  }

  if (stageResult.data.stage_type === "knockout") {
    try {
      const snapshot = await fetchTournamentLiveSnapshot(supabase, match.category_id);
      const knockoutStage = snapshot.stages.find((stage) => stage.id === match.stage_id);

      if (!knockoutStage || knockoutStage.stage_type !== "knockout") {
        return failure("La fase del partido no esta configurada como knockout.");
      }

      const knockoutMatches = snapshot.matches.filter(
        (snapshotMatch) => snapshotMatch.stage_id === knockoutStage.id,
      );
      const knockoutMatchIds = new Set(knockoutMatches.map((snapshotMatch) => snapshotMatch.id));
      const tieBreakerWinnerEntryId =
        payload.winnerSlotNo == null
          ? undefined
          : snapshot.matchSlots.find(
              (slot) =>
                slot.match_id === payload.matchId && slot.slot_no === payload.winnerSlotNo,
            )?.entry_id ?? undefined;

      const result = advanceWinnerFromSnapshot(
        {
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
        },
        {
          matchId: payload.matchId,
          scores: {
            slot1: payload.slot1Score,
            slot2: payload.slot2Score,
          },
          tieBreakerWinnerParticipantId: tieBreakerWinnerEntryId,
        },
      );

      const patchError = await persistBracketPatch(supabase, result.patch);
      if (patchError) {
        return failure(`No se pudo guardar el avance del bracket: ${patchError}`);
      }
    } catch (error) {
      return failure(`No se pudo procesar el bracket: ${toErrorMessage(error)}`);
    }
  } else {
    const winnerSlotNo =
      payload.slot1Score > payload.slot2Score
        ? 1
        : payload.slot2Score > payload.slot1Score
          ? 2
          : payload.winnerSlotNo;

    if (!winnerSlotNo) {
      return failure("En partidos de grupo tambien debes indicar el ganador si hay empate resuelto.");
    }

    const { error: scoresError } = await supabase.from("match_scores").upsert(
      [
        {
          match_id: payload.matchId,
          slot_no: 1,
          score: payload.slot1Score,
          result: winnerSlotNo === 1 ? "win" : "loss",
        },
        {
          match_id: payload.matchId,
          slot_no: 2,
          score: payload.slot2Score,
          result: winnerSlotNo === 2 ? "win" : "loss",
        },
      ],
      {
        onConflict: "match_id,slot_no",
      },
    );

    if (scoresError) {
      return failure(`No se pudieron guardar los marcadores: ${scoresError.message}`);
    }

    const { error: updateError } = await supabase
      .from("matches")
      .update({
        status: "finished",
        winning_slot_no: winnerSlotNo,
        is_draw: payload.slot1Score === payload.slot2Score,
        finished_at: new Date().toISOString(),
      })
      .eq("id", payload.matchId);

    if (updateError) {
      return failure(`No se pudo actualizar el partido: ${updateError.message}`);
    }
  }

  revalidatePath(`/admin/tournaments/${categoryResult.data.tournament_id}`);

  return success("Resultado guardado correctamente.");
}

function readTournamentFormData(formData: FormData) {
  return {
    tournamentId: formData.get("tournamentId") || undefined,
    sportId: formData.get("sportId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    venue: formData.get("venue"),
    timezone: formData.get("timezone"),
    status: formData.get("status"),
    isPublic: formData.get("isPublic") === "on",
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  };
}

async function persistBracketPatch(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  patch: SupabaseBracketPatch,
): Promise<string | null> {
  if (patch.scores.length > 0) {
    const { error } = await supabase.from("match_scores").upsert(patch.scores, {
      onConflict: "match_id,slot_no",
    });

    if (error) {
      return error.message;
    }
  }

  for (const match of patch.matches) {
    const { error } = await supabase
      .from("matches")
      .update({
        status: match.status,
        winning_slot_no: match.winning_slot_no,
        is_draw: match.is_draw,
        finished_at: match.finished_at,
      })
      .eq("id", match.id);

    if (error) {
      return error.message;
    }
  }

  return null;
}

function normalizeTournamentInput(input: TournamentInput): TournamentInput {
  const startAt = normalizeDateTimeInput(input.startAt, input.timezone);
  const endAt = normalizeDateTimeInput(input.endAt, input.timezone);

  if (startAt && endAt && endAt < startAt) {
    throw new Error("La fecha de fin no puede ser anterior a la de inicio.");
  }

  return {
    ...input,
    startAt,
    endAt,
  };
}

async function getTournamentIdByCategoryId(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  categoryId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("tournament_id")
    .eq("id", categoryId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.tournament_id;
}

function success(message: string, entityId?: string): AdminActionState {
  return {
    ...initialAdminActionState,
    status: "success",
    message,
    entityId,
  };
}

function failure(message: string): AdminActionState {
  return {
    ...initialAdminActionState,
    status: "error",
    message,
  };
}

function fromZodError(
  fieldErrors: Record<string, string[] | undefined>,
  message: string,
): AdminActionState {
  return {
    ...initialAdminActionState,
    status: "error",
    message,
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).filter(([, value]) => value && value.length > 0),
    ) as Record<string, string[]>,
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "error desconocido";
}
