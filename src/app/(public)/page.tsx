import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Activity, ArrowUpRight, Sparkles, Trophy, Waves } from "lucide-react";

import {
  CtaBanner,
  PadelRacketHero,
  PublicTournamentCard,
  SectionHeading,
} from "@/components/public";
import { getPublicHomePageData } from "@/features/public/queries";

export const metadata: Metadata = {
  title: "Padel en directo, sin ruido",
  description:
    "Una experiencia más simple y visual para seguir torneos de pádel, revisar cuadros y organizar todo desde un panel claro.",
};

const pillars = [
  {
    icon: Trophy,
    title: "Torneos claros",
    description:
      "El calendario, la sede y el estado del torneo se entienden rápido sin forzar scroll ni lectura pesada.",
  },
  {
    icon: Activity,
    title: "Cuadros limpios",
    description:
      "Partidos, rondas y seguimiento en directo con una interfaz oscura, más calmada y mejor para móvil.",
  },
  {
    icon: Waves,
    title: "Gestión corta",
    description:
      "Crear un torneo nuevo ya no obliga a tomar decisiones innecesarias antes de empezar a trabajar.",
  },
];

export default async function PublicHomePage() {
  const data = await getPublicHomePageData();
  const spotlight = data.featuredTournaments.slice(0, 3);

  return (
    <div className="space-y-12 lg:space-y-16">
      <section className="grid gap-10 rounded-[2.4rem] border border-white/8 bg-[linear-gradient(135deg,rgba(15,23,42,0.92)_0%,rgba(9,15,29,0.98)_100%)] px-6 py-8 shadow-[0_34px_110px_-42px_rgba(0,0,0,0.62)] sm:px-8 lg:grid-cols-[1fr_0.94fr] lg:px-10 lg:py-10">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            <Sparkles className="h-4 w-4" />
            Padel oscuro, claro y con personalidad
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Tu torneo de padel debería sentirse fácil antes de empezar a jugarse.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Sigue cuadros, partidos y participantes desde una experiencia más simple. Menos colores,
            menos ruido y un panel mucho más intuitivo para montar el torneo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={"/tournaments" as Route}
              className="inline-flex items-center rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:-translate-y-0.5 hover:bg-lime-200"
            >
              Ver torneos
            </Link>
            <Link
              href={"/admin" as Route}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              Crear torneo
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatPill label="Torneos" value={String(data.stats.tournamentsCount)} />
            <StatPill label="Categorias" value={String(data.stats.categoriesCount)} />
            <StatPill label="Live" value={String(data.stats.liveMatchesCount)} />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <PadelRacketHero />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
              <pillar.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Ahora mismo"
          title="Torneos para entrar sin perder tiempo"
          description="Acceso directo a los torneos más activos del circuito, con un catálogo más limpio y mucho más cómodo de seguir."
        />

        {spotlight.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-xl font-semibold text-white">Todavía no hay torneos publicados</p>
            <p className="mt-3 text-sm text-slate-400">
              En cuanto crees el primero aparecerá aquí con el nuevo diseño de portada.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {spotlight.map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Experiencia
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            La web ya no parece una herramienta genérica.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Ahora se mueve alrededor del pádel: visual más oscuro, acentos brillantes, lectura más
            limpia y una portada con movimiento para que la primera impresión sea memorable.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-lime-300">
            Gestión
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Crear torneo es un paso corto, no una barrera.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            El formulario de alta está más guiado y ahora pide solo nombre, sede, fechas y
            publicación. Lo demás queda recogido para cuando realmente haga falta.
          </p>
          <Link
            href={"/admin" as Route}
            className="mt-6 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-cyan-200 no-underline"
          >
            Abrir panel
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <CtaBanner
        eyebrow="Siguiente paso"
        title="Empieza el circuito con una portada potente y un panel mucho más amable."
        description="Crea el torneo, publica el cuadro y deja que la web haga el resto con una experiencia más simple y más propia."
        primaryHref={"/admin" as Route}
        primaryLabel="Crear torneo"
        secondaryHref={"/tournaments" as Route}
        secondaryLabel="Ver calendario"
      />
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
