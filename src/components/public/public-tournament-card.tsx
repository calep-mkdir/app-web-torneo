import type { Route } from "next";
import Link from "next/link";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { PublicTournamentListItem } from "@/features/public/types";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";

import { formatDateRange } from "./date-utils";

export function PublicTournamentCard({
  tournament,
}: {
  tournament: PublicTournamentListItem;
}) {
  return (
    <Card className="group app-panel h-full overflow-hidden bg-[linear-gradient(180deg,rgba(31,37,46,0.95)_0%,rgba(21,26,33,0.98)_100%)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_-42px_rgba(199,255,47,0.14)]">
      <div className="h-1.5 bg-[#c7ff2f]" />
      <CardHeader className="gap-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_100%)]">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription className="font-medium text-white/62">{tournament.sportName}</CardDescription>
            <CardTitle className="text-2xl text-white">{tournament.name}</CardTitle>
          </div>
          <Badge variant={getStatusBadgeVariant(tournament.status)}>
            {formatStatusLabel(tournament.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Categorias" value={String(tournament.categoriesCount)} />
          <Metric label="Entradas" value={String(tournament.participantsCount)} />
        </dl>

        <div className="space-y-2 text-sm text-slate-400">
          <p>{tournament.venue ?? "Sede pendiente"}</p>
          <p>{formatDateRange(tournament.startAt, tournament.endAt, "es-ES", tournament.timezone)}</p>
        </div>

        <Link href={`/tournaments/${tournament.slug}` as Route} className="app-cta-primary px-4 py-2">
          Abrir torneo
        </Link>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.04] px-3 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-white">{value}</dd>
    </div>
  );
}
