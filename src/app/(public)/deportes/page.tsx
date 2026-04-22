import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarRange, Radar, Trophy, Users } from "lucide-react";

import { CtaBanner, PublicPageHero, SectionHeading } from "@/components/public";
import { getPublicSportsPageData } from "@/features/public/queries";

export const metadata: Metadata = {
  title: "Circuito de padel",
  description:
    "Una vista de conjunto del circuito de pádel, los torneos publicados y la actividad que se está moviendo ahora.",
};

const highlights = [
  {
    icon: Radar,
    title: "Seguimiento vivo",
    text: "La página prioriza actividad en directo, próximos cruces y navegación rápida entre torneos.",
  },
  {
    icon: Users,
    title: "Inscripciones a mano",
    text: "Cada torneo mantiene sus participantes visibles para revisar el cuadro desde cualquier pantalla.",
  },
  {
    icon: CalendarRange,
    title: "Calendario claro",
    text: "Sede, fechas y estado siempre a la vista para que el circuito se entienda sin buscar demasiado.",
  },
];

export default async function SportsPage() {
  const data = await getPublicSportsPageData();
  const featuredTournament = data.tournaments[0];

  return (
    <div className="space-y-10 lg:space-y-14">
      <PublicPageHero
        eyebrow="Circuito"
        title="Todo gira alrededor del padel"
        description="Esta vista resume el estado general del circuito y te lleva rápido a los torneos que ya están publicados."
        sportName="Padel"
        venue={`${data.stats.tournamentsCount} torneos`}
        status={`${data.stats.liveMatchesCount} en directo`}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-[1.9rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.4)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Resumen"
          title="La foto rápida del circuito"
          description="Menos ruido visual y más contexto útil: torneos activos, categorías disponibles e inscripciones que ya están dentro."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Torneos publicados" value={String(data.stats.tournamentsCount)} />
          <MetricCard label="Categorias" value={String(data.stats.categoriesCount)} />
          <MetricCard label="Inscripciones" value={String(data.stats.participantsCount)} />
        </div>
      </section>

      {featuredTournament ? (
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Destacado
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {featuredTournament.name}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                Entra al torneo destacado del circuito y sigue cuadro, partidos y participantes con
                la nueva interfaz más limpia.
              </p>
            </div>

            <Link
              href={`/tournaments/${featuredTournament.slug}` as Route}
              className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:bg-lime-200"
            >
              Abrir torneo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      <CtaBanner
        eyebrow="Continuar"
        title="Sigue el circuito en público o crea el siguiente torneo desde gestión."
        description="Toda la experiencia ya está enfocada en pádel, con una lectura más simple y una base visual más sobria."
        primaryHref={"/tournaments" as Route}
        primaryLabel="Ver torneos"
        secondaryHref={"/admin" as Route}
        secondaryLabel="Ir a gestion"
      />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]">
      <Trophy className="h-4 w-4 text-lime-300" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
