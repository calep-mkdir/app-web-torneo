"use client";

import { useActionState, useMemo } from "react";

import { submitMatchResultAction } from "@/features/admin/actions";
import { initialAdminActionState, type TournamentMatchRecord } from "@/features/admin/types";
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

export function ResultForm({ matches }: { matches: TournamentMatchRecord[] }) {
  const [state, formAction, pending] = useActionState(
    submitMatchResultAction,
    initialAdminActionState,
  );

  const availableMatches = useMemo(
    () =>
      matches.filter(
        (match) => match.status !== "finished" && match.status !== "cancelled",
      ),
    [matches],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Introducir resultado</CardTitle>
        <CardDescription>
          Guarda el marcador y, en knockout, avanza automaticamente el ganador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormFeedback state={state} />

          {availableMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay partidos pendientes de resultado en este torneo.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="matchId">Partido</Label>
            <Select
              id="matchId"
              name="matchId"
              defaultValue={availableMatches[0]?.id}
              disabled={availableMatches.length === 0}
            >
              <option value="">Selecciona un partido</option>
              {availableMatches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.categoryName} - {match.stageName}
                  {match.roundName ? ` / ${match.roundName}` : ""}
                  {` / ${match.slot1Label} vs ${match.slot2Label}`}
                </option>
              ))}
            </Select>
            <FieldErrorText errors={state.fieldErrors} name="matchId" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slot1Score">Marcador lado 1</Label>
              <Input id="slot1Score" name="slot1Score" type="number" min={0} defaultValue={0} />
              <FieldErrorText errors={state.fieldErrors} name="slot1Score" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot2Score">Marcador lado 2</Label>
              <Input id="slot2Score" name="slot2Score" type="number" min={0} defaultValue={0} />
              <FieldErrorText errors={state.fieldErrors} name="slot2Score" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="winnerSlotNo">Ganador si hay desempate</Label>
            <Select id="winnerSlotNo" name="winnerSlotNo" defaultValue="">
              <option value="">Sin desempate</option>
              <option value="1">Lado 1</option>
              <option value="2">Lado 2</option>
            </Select>
            <FieldErrorText errors={state.fieldErrors} name="winnerSlotNo" />
          </div>

          <Button type="submit" disabled={pending || availableMatches.length === 0}>
            {pending ? "Guardando..." : "Guardar resultado"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
