import type { Route } from "next";
import Link from "next/link";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { PublicMatchViewModel } from "@/features/public/types";

import { formatDateTime } from "./date-utils";

export function LiveMatchList({
  slug,
  matches,
  title = "Partidos en directo",
  description = "Marcadores y cruces actualizados sin recargar la pagina.",
  emptyTitle = "Sin partidos en directo",
  emptyDescription = "Cuando un partido pase a estado live aparecera aqui automaticamente.",
  timezone,
}: {
  slug: string;
  matches: PublicMatchViewModel[];
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  timezone?: string;
}) {
  return (
    <Card className="border-slate-200/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <article
                key={match.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {match.stageName}
                      {match.roundName ? ` - ${match.roundName}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(match.scheduledAt, "es-ES", timezone)}
                      {match.venue ? ` - ${match.venue}` : ""}
                    </p>
                  </div>
                  <Badge variant={match.status === "live" ? "warning" : "secondary"}>
                    {match.status}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <ScoreRow
                    href={
                      match.slot1EntryId
                        ? (`/tournaments/${slug}/participants/${match.slot1EntryId}` as Route)
                        : undefined
                    }
                    label={match.slot1Label}
                    score={match.slot1Score}
                    winner={match.winningSlotNo === 1}
                  />
                  <ScoreRow
                    href={
                      match.slot2EntryId
                        ? (`/tournaments/${slug}/participants/${match.slot2EntryId}` as Route)
                        : undefined
                    }
                    label={match.slot2Label}
                    score={match.slot2Score}
                    winner={match.winningSlotNo === 2}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreRow({
  href,
  label,
  score,
  winner,
}: {
  href?: Route;
  label: string;
  score: number | null;
  winner: boolean;
}) {
  const content = (
    <div
      className={[
        "flex items-center justify-between rounded-xl px-3 py-2 transition",
        winner ? "bg-emerald-50 text-emerald-900" : "bg-white text-slate-700",
      ].join(" ")}
    >
      <span className="truncate font-medium">{label}</span>
      <span className="ml-3 text-lg font-semibold">{score ?? "-"}</span>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block no-underline">
      {content}
    </Link>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
