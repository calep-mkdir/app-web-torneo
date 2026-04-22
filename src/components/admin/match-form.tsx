"use client";

import { useActionState, useMemo, useState } from "react";

import { createMatchAction } from "@/features/admin/actions";
import {
  initialAdminActionState,
  type TournamentCategoryRecord,
  type TournamentEntryRecord,
  type TournamentStageRecord,
  type TournamentStageRoundRecord,
} from "@/features/admin/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@/components/ui";

import { FieldErrorText, FormFeedback } from "./form-feedback";

export function MatchForm({
  categories,
  stages,
  stageRounds,
  entries,
}: {
  categories: TournamentCategoryRecord[];
  stages: TournamentStageRecord[];
  stageRounds: TournamentStageRoundRecord[];
  entries: TournamentEntryRecord[];
}) {
  const [state, formAction, pending] = useActionState(
    createMatchAction,
    initialAdminActionState,
  );

  const hasCategories = categories.length > 0;
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const currentCategoryId = useMemo(() => {
    if (!hasCategories) {
      return "";
    }

    return categories.some((category) => category.id === categoryId)
      ? categoryId
      : (categories[0]?.id ?? "");
  }, [categories, categoryId, hasCategories]);
  const filteredStages = useMemo(
    () => stages.filter((stage) => stage.categoryId === currentCategoryId),
    [currentCategoryId, stages],
  );
  const [stageId, setStageId] = useState("");
  const currentStageId = useMemo(() => {
    if (filteredStages.length === 0) {
      return "";
    }

    return filteredStages.some((stage) => stage.id === stageId)
      ? stageId
      : (filteredStages[0]?.id ?? "");
  }, [filteredStages, stageId]);
  const filteredStageRounds = useMemo(
    () => stageRounds.filter((round) => round.stageId === currentStageId),
    [currentStageId, stageRounds],
  );
  const [stageRoundId, setStageRoundId] = useState("");
  const currentStageRoundId = useMemo(
    () =>
      filteredStageRounds.some((round) => round.id === stageRoundId)
        ? stageRoundId
        : "",
    [filteredStageRounds, stageRoundId],
  );
  const filteredEntries = useMemo(
    () => entries.filter((entry) => entry.categoryId === currentCategoryId),
    [currentCategoryId, entries],
  );
  const [slot1EntryId, setSlot1EntryId] = useState("");
  const [slot2EntryId, setSlot2EntryId] = useState("");
  const filteredEntryIds = useMemo(
    () => new Set(filteredEntries.map((entry) => entry.id)),
    [filteredEntries],
  );
  const currentSlot1EntryId = filteredEntryIds.has(slot1EntryId) ? slot1EntryId : "";
  const currentSlot2EntryId = filteredEntryIds.has(slot2EntryId) ? slot2EntryId : "";

  const isDisabled = !hasCategories || filteredStages.length === 0 || filteredEntries.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear partido</CardTitle>
        <CardDescription>
          Alta manual de partido con participantes y metadatos operativos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormFeedback state={state} />

          {!hasCategories ? (
            <p className="text-sm text-muted-foreground">
              Necesitas al menos una categoria antes de crear partidos.
            </p>
          ) : null}

          {hasCategories && filteredStages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              La categoria seleccionada todavia no tiene fases disponibles.
            </p>
          ) : null}

          {hasCategories && filteredEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              La categoria seleccionada no tiene participantes registrados.
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="match-category">Categoria</Label>
              <Select
                id="match-category"
                name="categoryId"
                value={currentCategoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">Selecciona una categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <FieldErrorText errors={state.fieldErrors} name="categoryId" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageId">Fase</Label>
              <Select
                id="stageId"
                name="stageId"
                value={currentStageId}
                onChange={(event) => setStageId(event.target.value)}
              >
                <option value="">Selecciona una fase</option>
                {filteredStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </Select>
              <FieldErrorText errors={state.fieldErrors} name="stageId" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stageRoundId">Ronda</Label>
              <Select
                id="stageRoundId"
                name="stageRoundId"
                value={currentStageRoundId}
                onChange={(event) => setStageRoundId(event.target.value)}
                disabled={!currentStageId}
              >
                <option value="">Sin ronda</option>
                {filteredStageRounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    {round.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Fecha y hora</Label>
              <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="matchNo">Numero de partido</Label>
              <Input id="matchNo" name="matchNo" type="number" min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bracketPosition">Posicion en bracket</Label>
              <Input id="bracketPosition" name="bracketPosition" type="number" min={1} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Pista o sede</Label>
            <Input id="venue" name="venue" placeholder="Pista 1" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slot1EntryId">Participante 1</Label>
              <Select
                id="slot1EntryId"
                name="slot1EntryId"
                value={currentSlot1EntryId}
                onChange={(event) => setSlot1EntryId(event.target.value)}
                disabled={filteredEntries.length === 0}
              >
                <option value="">Selecciona participante</option>
                {filteredEntries
                  .filter((entry) => entry.id !== currentSlot2EntryId)
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.participantName}
                    </option>
                  ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot2EntryId">Participante 2</Label>
              <Select
                id="slot2EntryId"
                name="slot2EntryId"
                value={currentSlot2EntryId}
                onChange={(event) => setSlot2EntryId(event.target.value)}
                disabled={filteredEntries.length === 0}
              >
                <option value="">Selecciona participante</option>
                {filteredEntries
                  .filter((entry) => entry.id !== currentSlot1EntryId)
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.participantName}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          <FieldErrorText errors={state.fieldErrors} name="slot1EntryId" />

          <Button type="submit" disabled={pending || isDisabled}>
            {pending ? "Creando..." : "Crear partido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
