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
  const accent = getTournamentAccent(tournament.sportName);

  return (
    <Card className="group h-full overflow-hidden border-white/70 bg-white/85 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_30px_90px_-42px_rgba(14,165,233,0.4)]">
      <div className={accent.ribbonClass} />
      <CardHeader className={`gap-4 ${accent.headerClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription className="font-medium text-slate-600">{tournament.sportName}</CardDescription>
            <CardTitle className="text-2xl text-slate-950">{tournament.name}</CardTitle>
          </div>
          <Badge variant={tournament.liveMatchesCount > 0 ? "warning" : "secondary"}>
            {tournament.liveMatchesCount > 0
              ? `${tournament.liveMatchesCount} en directo`
              : tournament.status.replaceAll("_", " ")}
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
          className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-slate-800"
        >
          Ver torneo
        </Link>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/70 bg-slate-50/90 px-3 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function getTournamentAccent(sportName: string) {
  const palette = [
    {
      ribbonClass: "h-2 bg-[linear-gradient(90deg,#f97316_0%,#fb7185_55%,#fdba74_100%)]",
      headerClass: "bg-[linear-gradient(180deg,rgba(255,247,237,0.95)_0%,rgba(255,255,255,0.96)_100%)]",
    },
    {
      ribbonClass: "h-2 bg-[linear-gradient(90deg,#06b6d4_0%,#38bdf8_50%,#0ea5e9_100%)]",
      headerClass: "bg-[linear-gradient(180deg,rgba(236,254,255,0.95)_0%,rgba(255,255,255,0.96)_100%)]",
    },
    {
      ribbonClass: "h-2 bg-[linear-gradient(90deg,#10b981_0%,#84cc16_45%,#facc15_100%)]",
      headerClass: "bg-[linear-gradient(180deg,rgba(240,253,244,0.95)_0%,rgba(255,255,255,0.96)_100%)]",
    },
  ];
  const seed = sportName
    .split("")
    .reduce((total, letter) => total + letter.charCodeAt(0), 0);

  return palette[seed % palette.length];
}
