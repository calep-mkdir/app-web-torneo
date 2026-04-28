import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Activity, ArrowUpRight, Trophy, Users } from "lucide-react";

import {
  CtaBanner,
  PadelRacketHero,
  PublicTournamentCard,
  SectionHeading,
} from "@/components/public";
import { getPublicHomePageData } from "@/features/public/queries";

export const metadata: Metadata = {
  title: "Padel en directo",
  description: "Cuadros, partidos y panel de torneos de padel.",
};

const shortcuts = [
  {
    icon: Trophy,
    title: "Torneos",
    label: "Abrir calendario",
    href: "/tournaments" as Route,
  },
  {
    icon: Activity,
    title: "En juego",
    label: "Ver directos",
    href: "/tournaments" as Route,
  },
  {
    icon: Users,
    title: "Panel",
    label: "Crear torneo",
    href: "/admin" as Route,
  },
];

export default async function PublicHomePage() {
  const data = await getPublicHomePageData();
  const liveNow = data.tournaments.filter((tournament) => tournament.liveMatchesCount > 0).slice(0, 3);
  const spotlight = liveNow.length > 0 ? liveNow : data.featuredTournaments.slice(0, 3);

  return (
    <div className="space-y-12 lg:space-y-16">
      <section className="grid gap-10 rounded-[2.4rem] border border-white/8 bg-[linear-gradient(135deg,rgba(15,23,42,0.92)_0%,rgba(9,15,29,0.98)_100%)] px-6 py-8 shadow-[0_34px_110px_-42px_rgba(0,0,0,0.62)] sm:px-8 lg:grid-cols-[1fr_0.94fr] lg:px-10 lg:py-10">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            Padel
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Abre el cuadro. Sigue el punto. Crea el siguiente.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Torneos arriba. Panel a un clic.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={"/tournaments" as Route}
              className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#67e8f9_0%,#bef264_100%)] px-5 py-3 text-sm font-semibold text-slate-950 no-underline shadow-[0_18px_45px_-18px_rgba(103,232,249,0.5)] transition hover:-translate-y-0.5 hover:brightness-105"
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
        {shortcuts.map((shortcut, index) => (
          <Link
            key={shortcut.title}
            href={shortcut.href}
            className="group rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6 no-underline shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)] transition hover:-translate-y-1 hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
                <shortcut.icon className="h-5 w-5" />
              </div>
              <span className="text-3xl font-semibold text-white">
                {index === 0 ? data.stats.tournamentsCount : index === 1 ? data.stats.liveMatchesCount : "Nuevo"}
              </span>
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-white">{shortcut.title}</h2>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
              {shortcut.label}
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Ahora" title={liveNow.length > 0 ? "En juego" : "Destacados"} />

        {spotlight.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-xl font-semibold text-white">Todavia no hay torneos publicados</p>
            <p className="mt-3 text-sm text-slate-400">Crea el primero.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {spotlight.map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </section>

      <CtaBanner
        eyebrow="Siguiente"
        title="Crea el siguiente torneo"
        primaryHref={"/admin" as Route}
        primaryLabel="Abrir panel"
        secondaryHref={"/tournaments" as Route}
        secondaryLabel="Ver torneos"
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
