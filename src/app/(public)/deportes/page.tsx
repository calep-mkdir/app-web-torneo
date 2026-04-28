import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarRange, Trophy, Users } from "lucide-react";

import { CtaBanner, PublicPageHero, SectionHeading } from "@/components/public";
import { getPublicSportsPageData } from "@/features/public/queries";

export const metadata: Metadata = {
  title: "Circuito de padel",
  description: "Torneos, actividad y accesos del circuito de padel.",
};

const shortcuts = [
  {
    icon: Trophy,
    title: "Torneos",
    text: "Abrir calendario",
    href: "/tournaments" as Route,
  },
  {
    icon: Users,
    title: "Panel",
    text: "Crear torneo",
    href: "/admin" as Route,
  },
  {
    icon: CalendarRange,
    title: "Organiza",
    text: "Abrir pasos",
    href: "/organiza" as Route,
  },
];

export default async function SportsPage() {
  const data = await getPublicSportsPageData();
  const featuredTournament = data.tournaments[0];

  return (
    <div className="space-y-10 lg:space-y-14">
      <PublicPageHero
        eyebrow="Padel"
        title="Circuito"
        sportName="Padel"
        details={[
          { label: "Torneos", value: String(data.stats.tournamentsCount) },
          { label: "Categorias", value: String(data.stats.categoriesCount) },
          { label: "Inscripciones", value: String(data.stats.participantsCount) },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {shortcuts.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-[1.9rem] border border-white/8 bg-white/[0.03] p-6 no-underline shadow-[0_24px_80px_-44px_rgba(0,0,0,0.4)] transition hover:-translate-y-1 hover:bg-white/[0.05]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-white">{item.title}</h2>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
              {item.text}
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </section>

      {featuredTournament ? (
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionHeading eyebrow="Destacado" title={featuredTournament.name} />
            </div>

            <Link
              href={`/tournaments/${featuredTournament.slug}` as Route}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#67e8f9_0%,#bef264_100%)] px-5 py-3 text-sm font-semibold text-slate-950 no-underline shadow-[0_18px_45px_-18px_rgba(103,232,249,0.5)] transition hover:brightness-105"
            >
              Abrir torneo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      <CtaBanner
        eyebrow="Abrir"
        title="Ver torneos"
        primaryHref={"/tournaments" as Route}
        primaryLabel="Ver torneos"
        secondaryHref={"/admin" as Route}
        secondaryLabel="Crear torneo"
      />
    </div>
  );
}
