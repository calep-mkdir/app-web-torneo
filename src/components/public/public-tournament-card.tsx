import type { Route } from "next";
import Link from "next/link";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { PublicTournamentListItem } from "@/features/public/types";

import { formatDateRange } from "./date-utils";

export function PublicTournamentCard({
  tournament,
}: {
  tournament: PublicTournamentListItem;
}) {
  return (
    <Card className="h-full overflow-hidden border-slate-200/80">
      <CardHeader className="gap-4 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription>{tournament.sportName}</CardDescription>
            <CardTitle className="text-xl">{tournament.name}</CardTitle>
          </div>
          <Badge variant={tournament.liveMatchesCount > 0 ? "warning" : "secondary"}>
            {tournament.liveMatchesCount > 0 ? `${tournament.liveMatchesCount} en directo` : tournament.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <Metric label="Categorias" value={String(tournament.categoriesCount)} />
          <Metric label="Entradas" value={String(tournament.participantsCount)} />
          <Metric label="Live" value={String(tournament.liveMatchesCount)} />
        </dl>

        <div className="space-y-2 text-sm text-slate-600">
          <p>{formatDateRange(tournament.startAt, tournament.endAt, "es-ES", tournament.timezone)}</p>
          <p>{tournament.venue ?? "Sede pendiente"}</p>
        </div>

        <Link
          href={`/tournaments/${tournament.slug}` as Route}
          className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-slate-800"
        >
          Ver torneo
        </Link>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 px-3 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
