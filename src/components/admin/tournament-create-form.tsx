"use client";

import { useActionState, useState } from "react";
import { Waves } from "lucide-react";

import { createTournamentAction } from "@/features/admin/actions";
import { initialAdminActionState, type SportOption } from "@/features/admin/types";
import { slugifyTournamentName } from "@/lib/padel";
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
  Textarea,
} from "@/components/ui";

import { FieldErrorText, FormFeedback } from "./form-feedback";

export function TournamentCreateForm({
  sport,
}: {
  sport: SportOption | null;
}) {
  const [state, formAction, pending] = useActionState(
    createTournamentAction,
    initialAdminActionState,
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [publishNow, setPublishNow] = useState(true);
  const hasSport = Boolean(sport);

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-[linear-gradient(90deg,#7dd3fc_0%,#d9f99d_52%,#fb7185_100%)]" />
      <CardHeader>
        <Badge variant="secondary" className="w-fit bg-white/8 text-white">
          {sport?.name ?? "Padel"}
        </Badge>
        <CardTitle>Nuevo torneo</CardTitle>
        <CardDescription>Nombre, club y fechas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="sportId" value={sport?.id ?? ""} />
          <input type="hidden" name="timezone" value="Europe/Madrid" />
          <input type="hidden" name="status" value={publishNow ? "published" : "draft"} />
          <FormFeedback state={state} />

          {!hasSport ? (
            <p className="rounded-3xl border border-amber-400/25 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
              No encuentro el deporte Pádel en la base. Revisa la semilla `sports` antes de crear
              torneos.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del torneo</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);

                if (!hasEditedSlug) {
                  setSlug(slugifyTournamentName(nextName));
                }
              }}
              placeholder="Open Primavera Club Norte"
            />
            <FieldErrorText errors={state.fieldErrors} name="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Club o sede</Label>
            <Input id="venue" name="venue" placeholder="Club Norte · Pistas 1 a 4" />
            <FieldErrorText errors={state.fieldErrors} name="venue" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startAt">Empieza</Label>
              <Input id="startAt" name="startAt" type="datetime-local" />
              <FieldErrorText errors={state.fieldErrors} name="startAt" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">Termina</Label>
              <Input id="endAt" name="endAt" type="datetime-local" />
              <FieldErrorText errors={state.fieldErrors} name="endAt" />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <Checkbox
              name="isPublic"
              checked={publishNow}
              onChange={(event) => setPublishNow(event.target.checked)}
              className="mt-0.5"
            />
            <span className="space-y-1">
              <span className="block text-sm font-semibold text-white">Publicar ahora</span>
              <span className="block text-sm text-slate-400">
                Si no, se guarda como borrador.
              </span>
            </span>
          </label>

          <details className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              Ajustes
            </summary>

            <div className="mt-4 grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setHasEditedSlug(true);
                    setSlug(slugifyTournamentName(event.target.value));
                  }}
                  placeholder="open-primavera-club-norte"
                />
                <FieldErrorText errors={state.fieldErrors} name="slug" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Nota corta</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Cuadro principal, fase de grupos o nota breve."
                />
                <FieldErrorText errors={state.fieldErrors} name="description" />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Waves className="h-4 w-4 text-cyan-300" />
                Zona horaria fija por defecto: Europe/Madrid
              </div>
            </div>
          </details>

          <Button type="submit" disabled={pending || !hasSport} size="lg" className="w-full">
            {pending ? "Creando torneo..." : "Crear torneo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
