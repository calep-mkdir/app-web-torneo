"use client";

import { useActionState } from "react";

import { updateTournamentAction } from "@/features/admin/actions";
import { initialAdminActionState, type TournamentAdminDetail } from "@/features/admin/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";

import { toDateTimeLocalValue } from "./date-utils";
import { FieldErrorText, FormFeedback } from "./form-feedback";

const statusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
  { value: "in_progress", label: "En juego" },
  { value: "completed", label: "Finalizado" },
  { value: "archived", label: "Archivado" },
];

export function TournamentEditForm({
  tournament,
}: {
  tournament: TournamentAdminDetail["tournament"];
}) {
  const [state, formAction, pending] = useActionState(
    updateTournamentAction,
    initialAdminActionState,
  );

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-[linear-gradient(90deg,#7dd3fc_0%,#d9f99d_52%,#fb7185_100%)]" />
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="bg-white/8 text-white">
            {tournament.sportName}
          </Badge>
          <Badge variant="outline" className="border-white/10 bg-white/4 text-slate-300">
            Configuracion base
          </Badge>
        </div>
        <CardTitle>Datos principales del torneo</CardTitle>
        <CardDescription>
          Ajusta nombre, sede, fechas y visibilidad sin entrar en campos innecesarios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <input type="hidden" name="sportId" value={tournament.sportId} />
          <FormFeedback state={state} />

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del torneo</Label>
            <Input id="name" name="name" defaultValue={tournament.name} />
            <FieldErrorText errors={state.fieldErrors} name="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Club o sede</Label>
            <Input id="venue" name="venue" defaultValue={tournament.venue ?? ""} />
            <FieldErrorText errors={state.fieldErrors} name="venue" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startAt">Empieza</Label>
              <Input
                id="startAt"
                name="startAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(tournament.startAt, tournament.timezone)}
              />
              <FieldErrorText errors={state.fieldErrors} name="startAt" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">Termina</Label>
              <Input
                id="endAt"
                name="endAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(tournament.endAt, tournament.timezone)}
              />
              <FieldErrorText errors={state.fieldErrors} name="endAt" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select id="status" name="status" defaultValue={tournament.status}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FieldErrorText errors={state.fieldErrors} name="status" />
            </div>

            <label className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <Checkbox name="isPublic" defaultChecked={tournament.isPublic} className="mt-0.5" />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-white">Visible en la web</span>
                <span className="block text-sm text-slate-400">
                  Activa o desactiva la publicación pública del torneo.
                </span>
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={tournament.description ?? ""}
              placeholder="Resumen corto del torneo, sede, ambiente o formato."
            />
          </div>

          <details className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              Ajustes avanzados
            </summary>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={tournament.slug} />
                <FieldErrorText errors={state.fieldErrors} name="slug" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona horaria</Label>
                <Input id="timezone" name="timezone" defaultValue={tournament.timezone} />
                <FieldErrorText errors={state.fieldErrors} name="timezone" />
              </div>
            </div>
          </details>

          <Button type="submit" disabled={pending} size="lg" className="w-full">
            {pending ? "Guardando cambios..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
