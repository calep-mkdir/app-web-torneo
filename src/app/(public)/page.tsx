import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui";
import { PadelRacketHero } from "@/components/public";
import { getPublicHomePageData } from "@/features/public/queries";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";
import { formatDateRange } from "@/components/public/date-utils";

export const metadata: Metadata = {
  title: "Padel",
  description: "Torneos, resultados y panel de padel.",
};

const shortcuts = [
  {
    icon: Trophy,
    title: "Torneos",
    href: "/tournaments" as Route,
    label: "Abrir calendario",
  },
  {
    icon: ClipboardList,
    title: "Organiza",
    href: "/organiza" as Route,
    label: "Ver pasos",
  },
  {
    icon: Users,
    title: "Panel",
    href: "/admin" as Route,
    label: "Crear torneo",
  },
];

export default async function PublicHomePage() {
  const data = await getPublicHomePageData();
  const spotlight = data.tournaments.slice(0, 3);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="app-panel app-panel-strong rounded-[2.4rem] px-6 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                Padel
              </div>

              <div>
                <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  Torneos, cuadros y resultados.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                  Entra, elige torneo y sigue el cuadro.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={"/tournaments" as Route} className="app-cta-primary">
                  Ver torneos
                </Link>
                <Link href={"/admin" as Route} className="app-cta-secondary">
                  Crear torneo
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatPill label="Torneos" value={String(data.stats.tournamentsCount)} />
                <StatPill label="Categorias" value={String(data.stats.categoriesCount)} />
                <StatPill label="Entradas" value={String(data.stats.participantsCount)} />
              </div>
            </div>

            <div className="min-h-[320px]">
              <PadelRacketHero />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <section className="app-panel rounded-[2rem] px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Accesos</p>
            <div className="mt-4 grid gap-3">
              {shortcuts.map((shortcut) => (
                <Link
                  key={shortcut.title}
                  href={shortcut.href}
                  className="group rounded-[1.7rem] border border-white/10 bg-white/[0.04] px-4 py-4 no-underline transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
                      <shortcut.icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 text-cyan-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="mt-4 text-xl font-semibold text-white">{shortcut.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{shortcut.label}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="app-panel rounded-[2rem] px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Torneos</p>
              <Link href={"/tournaments" as Route} className="text-sm font-semibold text-cyan-100 no-underline">
                Ver todos
              </Link>
            </div>

            {spotlight.length === 0 ? (
              <div className="mt-4 rounded-[1.7rem] border border-dashed border-white/12 bg-white/[0.03] px-4 py-8 text-center">
                <p className="font-medium text-white">Todavia no hay torneos publicados</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {spotlight.map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/${tournament.slug}` as Route}
                    className="group flex items-center justify-between gap-3 rounded-[1.7rem] border border-white/10 bg-white/[0.04] px-4 py-4 no-underline transition hover:bg-white/[0.08]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{tournament.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {formatDateRange(
                          tournament.startAt,
                          tournament.endAt,
                          "es-ES",
                          tournament.timezone,
                        )}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(tournament.status)}>
                      {formatStatusLabel(tournament.status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
