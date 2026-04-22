import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Activity, ArrowUpRight, Trophy, Users } from "lucide-react";

import { CtaBanner, PublicPageHero, SectionHeading } from "@/components/public";
import { getPublicSportsPageData } from "@/features/public/queries";

export const metadata: Metadata = {
  title: "Deportes y actividad",
  description:
    "Explora qué deportes están activos, cuántos torneos hay en marcha y dónde se concentra la competición.",
};

export default async function SportsPage() {
  const data = await getPublicSportsPageData();

  return (
    <div className="space-y-10 lg:space-y-14">
      <PublicPageHero
        eyebrow="Mapa deportivo"
        title="Deportes listos para moverse con más color"
        description="Agrupa competiciones por deporte y entra en cada torneo con una experiencia pensada para seguir ritmo, participación y actividad."
        sportName={`${data.stats.sportsCount} deportes`}
        venue={`${data.stats.tournamentsCount} torneos`}
        status={`${data.stats.liveMatchesCount} en vivo`}
      />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Resumen"
          title="Qué está pasando en cada disciplina"
          description="Una vista más clara de la actividad para que puedas navegar desde el deporte al torneo sin perder contexto."
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.sports.map((sport, index) => (
            <article key={sport.name} className={getSportPanelClass(index)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-slate-950 shadow-sm">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {sport.name}
                </div>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                <Metric icon={Trophy} label="Torneos" value={String(sport.tournamentsCount)} />
                <Metric icon={Users} label="Participantes" value={String(sport.participantsCount)} />
                <Metric icon={Activity} label="En vivo" value={String(sport.liveMatchesCount)} />
              </dl>

              {sport.featuredTournamentSlug && sport.featuredTournamentName ? (
                <Link
                  href={`/tournaments/${sport.featuredTournamentSlug}` as Route}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-slate-800"
                >
                  Abrir {sport.featuredTournamentName}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <CtaBanner
        eyebrow="Mucho más que una landing"
        title="Cada deporte tiene ahora su propio espacio dentro de la experiencia."
        description="Puedes seguir torneos publicados o entrar a gestión para crear nuevas competiciones sin tener que pasar por un muro de acceso."
        primaryHref={"/tournaments" as Route}
        primaryLabel="Ver todos los torneos"
        secondaryHref={"/admin" as Route}
        secondaryLabel="Ir a gestión"
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-white/75 p-4">
      <Icon className="h-4 w-4 text-slate-700" />
      <dt className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function getSportPanelClass(index: number) {
  const classes = [
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#fff7ed_0%,#ffedd5_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(249,115,22,0.35)]",
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#ecfeff_0%,#dbeafe_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(14,165,233,0.35)]",
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#fff1f2_0%,#fdf2f8_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(236,72,153,0.3)]",
  ];

  return classes[index % classes.length];
}
