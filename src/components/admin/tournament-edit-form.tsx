"use client";

import { useActionState } from "react";

import { updateTournamentAction } from "@/features/admin/actions";
import { initialAdminActionState, type SportOption, type TournamentAdminDetail } from "@/features/admin/types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Input, Label, Select, Textarea } from "@/components/ui";

import { toDateTimeLocalValue } from "./date-utils";
import { FieldErrorText, FormFeedback } from "./form-feedback";

export function TournamentEditForm({
  tournament,
  sports,
}: {
  tournament: TournamentAdminDetail["tournament"];
  sports: SportOption[];
}) {
  const [state, formAction, pending] = useActionState(
    updateTournamentAction,
    initialAdminActionState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion del torneo</CardTitle>
        <CardDescription>Edita la informacion base visible y operativa.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <FormFeedback state={state} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={tournament.name} />
              <FieldErrorText errors={state.fieldErrors} name="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={tournament.slug} />
              <FieldErrorText errors={state.fieldErrors} name="slug" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sportId">Deporte</Label>
              <Select id="sportId" name="sportId" defaultValue={tournament.sportId}>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </Select>
              <FieldErrorText errors={state.fieldErrors} name="sportId" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input id="timezone" name="timezone" defaultValue={tournament.timezone} />
              <FieldErrorText errors={state.fieldErrors} name="timezone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select id="status" name="status" defaultValue={tournament.status}>
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
                <option value="archived">archived</option>
              </Select>
              <FieldErrorText errors={state.fieldErrors} name="status" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="venue">Sede</Label>
              <Input id="venue" name="venue" defaultValue={tournament.venue ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startAt">Inicio</Label>
              <Input
                id="startAt"
                name="startAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(tournament.startAt, tournament.timezone)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="endAt">Fin</Label>
              <Input
                id="endAt"
                name="endAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(tournament.endAt, tournament.timezone)}
              />
              <FieldErrorText errors={state.fieldErrors} name="endAt" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox name="isPublic" defaultChecked={tournament.isPublic} />
                Disponible publicamente
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea id="description" name="description" defaultValue={tournament.description ?? ""} />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
