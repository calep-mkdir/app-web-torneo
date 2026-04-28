import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, Trophy, Users } from "lucide-react";

import { PublicPageHero } from "@/components/public";
import { getPublicSportsPageData } from "@/features/public/queries";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Circuito de padel",
  description: "Circuito y accesos de padel.",
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

export default async function SportsPage() {
  const data = await getPublicSportsPageData();
  const preview = data.tournaments.slice(0, 4);

  return (
    <div className="space-y-4">
      <PublicPageHero
        eyebrow="Padel"
        title="Circuito"
        sportName="Padel"
        details={[
          { label: "Torneos", value: String(data.stats.tournamentsCount) },
          { label: "Categorias", value: String(data.stats.categoriesCount) },
          { label: "Entradas", value: String(data.stats.participantsCount) },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="app-panel rounded-[2rem] px-5 py-5">
          <p className="app-kicker">Accesos</p>
          <div className="mt-4 grid gap-3">
            {shortcuts.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[1.7rem] border border-white/10 bg-white/[0.04] px-4 py-4 no-underline transition hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="app-icon-chip h-11 w-11">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-[#dfff75] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-4 text-xl font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-300">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="app-panel rounded-[2rem] px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="app-kicker">Proximos</p>
            <Link href={"/tournaments" as Route} className="text-sm font-semibold text-[#dfff75] no-underline">
              Ver todos
            </Link>
          </div>

          {preview.length === 0 ? (
            <div className="mt-4 rounded-[1.7rem] border border-dashed border-white/12 bg-white/[0.03] px-4 py-10 text-center">
              <p className="font-medium text-white">Todavia no hay torneos publicados</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {preview.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.slug}` as Route}
                  className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] px-4 py-4 no-underline transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-white">{tournament.name}</p>
                    <Badge variant={getStatusBadgeVariant(tournament.status)}>
                      {formatStatusLabel(tournament.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{tournament.venue ?? "Sede pendiente"}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
