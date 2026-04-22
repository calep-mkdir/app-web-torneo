"use client";

import { useActionState } from "react";

import { createTournamentAction } from "@/features/admin/actions";
import { initialAdminActionState, type SportOption } from "@/features/admin/types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Input, Label, Select, Textarea } from "@/components/ui";

import { FieldErrorText, FormFeedback } from "./form-feedback";

export function TournamentCreateForm({ sports }: { sports: SportOption[] }) {
  const [state, formAction, pending] = useActionState(
    createTournamentAction,
    initialAdminActionState,
  );
  const hasSports = sports.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear torneo</CardTitle>
        <CardDescription>
          Alta rapida del torneo. Las categorias, fases y partidos se gestionan dentro del detalle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <FormFeedback state={state} />

          {!hasSports ? (
            <p className="text-sm text-muted-foreground">
              No hay deportes cargados todavia. Aplica la migracion de semillas para usar el formulario.
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sportId">Deporte</Label>
              <Select id="sportId" name="sportId" defaultValue={sports[0]?.id} disabled={!hasSports}>
                <option value="">Selecciona un deporte</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </Select>
              <FieldErrorText errors={state.fieldErrors} name="sportId" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select id="status" name="status" defaultValue="draft">
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
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Liga Primavera 2026" />
              <FieldErrorText errors={state.fieldErrors} name="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="liga-primavera-2026" />
              <FieldErrorText errors={state.fieldErrors} name="slug" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input id="timezone" name="timezone" defaultValue="Europe/Madrid" />
              <FieldErrorText errors={state.fieldErrors} name="timezone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Sede</Label>
              <Input id="venue" name="venue" placeholder="Pabellon Municipal" />
              <FieldErrorText errors={state.fieldErrors} name="venue" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startAt">Inicio</Label>
              <Input id="startAt" name="startAt" type="datetime-local" />
              <FieldErrorText errors={state.fieldErrors} name="startAt" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">Fin</Label>
              <Input id="endAt" name="endAt" type="datetime-local" />
              <FieldErrorText errors={state.fieldErrors} name="endAt" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea id="description" name="description" placeholder="Resumen operativo del torneo" />
            <FieldErrorText errors={state.fieldErrors} name="description" />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox name="isPublic" />
            Publicar torneo en la web
          </label>

          <Button type="submit" disabled={pending || !hasSports}>
            {pending ? "Guardando..." : "Crear torneo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
