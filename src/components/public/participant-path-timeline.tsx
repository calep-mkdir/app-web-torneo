import type { Route } from "next";
import Link from "next/link";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { ParticipantPath } from "@/lib/brackets";
import type { PublicMatchViewModel } from "@/features/public/types";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";

import { formatDateTime } from "./date-utils";

export function ParticipantPathTimeline({
  slug,
  entryName,
  history,
  knockoutPath,
  timezone,
}: {
  slug: string;
  entryName: string;
  history: PublicMatchViewModel[];
  knockoutPath: ParticipantPath | null;
  timezone?: string;
}) {
  return (
    <div className="space-y-6">
      <Card className="app-panel bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Trayectoria de {entryName}</CardTitle>
          <CardDescription>
            Resumen de partidos jugados, resultado y avance dentro del torneo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile label="Partidos" value={String(history.length)} />
            <SummaryTile
              label="Victorias"
              value={String(history.filter((match) => match.outcomeForEntry === "win").length)}
            />
            <SummaryTile
              label="Derrotas"
              value={String(history.filter((match) => match.outcomeForEntry === "loss").length)}
            />
          </div>
        </CardContent>
      </Card>

      {knockoutPath ? (
        <Card className="app-panel bg-white/[0.04]">
          <CardHeader>
            <CardTitle>Camino en el bracket</CardTitle>
            <CardDescription>
              Lectura rapida del recorrido dentro del cuadro knockout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {knockoutPath.matches.map((step) => (
                <div
                  key={step.matchId}
                  className="rounded-2xl border border-white/8 bg-[#232830] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{step.roundName}</p>
                      <p className="text-xs text-slate-400">
                        Rival {step.opponentName ?? "Pendiente"}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(step.outcome)}>
                      {formatStatusLabel(step.outcome)}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span>
                      Marcador {step.scoreFor ?? "-"} - {step.scoreAgainst ?? "-"}
                    </span>
                    {step.advancedToMatchId ? <span>Avanzo al siguiente cruce</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="app-panel bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Historial completo</CardTitle>
          <CardDescription>
            Incluye fases de grupo, knockout y marcadores registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-6 text-sm text-slate-400">
              Este participante todavia no tiene partidos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((match) => (
                <article
                  key={match.id}
                  className="rounded-2xl border border-white/8 bg-[#232830] px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {match.stageName}
                        {match.roundName ? ` - ${match.roundName}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDateTime(match.scheduledAt, "es-ES", timezone)}
                        {match.venue ? ` - ${match.venue}` : ""}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(match.outcomeForEntry ?? "pending")}>
                      {formatStatusLabel(match.outcomeForEntry ?? "pending")}
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <EntryLink
                      slug={slug}
                      entryId={match.slot1EntryId}
                      label={match.slot1Label}
                    />
                    <div className="rounded-full bg-white/[0.05] px-3 py-1 text-center text-sm font-semibold text-slate-200">
                      {match.slot1Score ?? "-"} - {match.slot2Score ?? "-"}
                    </div>
                    <EntryLink
                      slug={slug}
                      entryId={match.slot2EntryId}
                      label={match.slot2Label}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function EntryLink({
  slug,
  entryId,
  label,
}: {
  slug: string;
  entryId: string | null;
  label: string;
}) {
  if (!entryId) {
    return <div className="truncate text-sm font-medium text-slate-300">{label}</div>;
  }

  return (
    <Link
      href={`/tournaments/${slug}/participants/${entryId}` as Route}
      className="truncate text-sm font-medium text-white no-underline hover:text-cyan-200"
    >
      {label}
    </Link>
  );
}
