import type { Route } from "next";
import Link from "next/link";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import type { TournamentListItem } from "@/features/admin/types";

export function TournamentList({
  tournaments,
}: {
  tournaments: TournamentListItem[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tournaments.map((tournament) => (
        <Card
          key={tournament.id}
          className="overflow-hidden bg-white/85 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.3)]"
        >
          <div
            className={
              tournament.isPublic
                ? "h-2 bg-[linear-gradient(90deg,#10b981_0%,#84cc16_100%)]"
                : "h-2 bg-[linear-gradient(90deg,#f97316_0%,#ec4899_100%)]"
            }
          />
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardDescription className="font-medium text-slate-600">
                  {tournament.sportName} · {tournament.slug}
                </CardDescription>
                <CardTitle className="mt-1 text-2xl text-slate-950">{tournament.name}</CardTitle>
              </div>
              <Badge variant={tournament.isPublic ? "success" : "secondary"}>
                {tournament.isPublic ? "Publico" : "Privado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Categorias" value={String(tournament.categoriesCount)} />
              <Metric label="Participantes" value={String(tournament.entrantsCount)} />
              <Metric label="Partidos" value={String(tournament.matchesCount)} />
              <Metric label="Finalizados" value={String(tournament.finishedMatchesCount)} />
            </dl>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                Estado: {tournament.status.replaceAll("_", " ")}
              </span>
              <Link
                href={`/admin/tournaments/${tournament.id}` as Route}
                className="font-semibold no-underline"
              >
                Abrir torneo
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/70 bg-slate-50/90 p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
