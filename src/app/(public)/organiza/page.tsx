import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { CalendarDays, ClipboardList, Radar, Trophy } from "lucide-react";

import { CtaBanner, PublicPageHero, SectionHeading } from "@/components/public";

export const metadata: Metadata = {
  title: "Organiza tu torneo",
  description: "Panel y pasos para organizar torneos de padel.",
};

const workflow = [
  {
    icon: Trophy,
    title: "1. Torneo",
    text: "Nombre, club y fechas.",
  },
  {
    icon: ClipboardList,
    title: "2. Cuadros",
    text: "Categorias, parejas y partidos.",
  },
  {
    icon: Radar,
    title: "3. Resultados",
    text: "Marcadores, cierre y publico.",
  },
];

export default function OrganizePage() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <PublicPageHero
        eyebrow="Panel"
        title="Crear torneo"
        sportName="Padel"
        details={[
          { label: "1", value: "Torneo" },
          { label: "2", value: "Cuadros" },
          { label: "3", value: "Resultados" },
        ]}
      />

      <section className="space-y-6">
        <SectionHeading eyebrow="Pasos" title="Paso a paso" />

        <div className="grid gap-5 lg:grid-cols-3">
          {workflow.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ActionTile
          icon={CalendarDays}
          title="Abrir panel"
          href={"/admin" as Route}
          label="Crear torneo"
        />
        <ActionTile
          icon={Radar}
          title="Ver torneos"
          href={"/tournaments" as Route}
          label="Abrir calendario"
        />
      </section>

      <CtaBanner
        eyebrow="Panel"
        title="Crear torneo"
        primaryHref={"/admin" as Route}
        primaryLabel="Abrir panel"
        secondaryHref={"/tournaments" as Route}
        secondaryLabel="Ver torneos"
      />
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  href,
  label,
}: {
  icon: typeof CalendarDays;
  title: string;
  href: Route;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 no-underline shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)] transition hover:-translate-y-1 hover:bg-white/[0.05]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
        {label}
      </div>
    </Link>
  );
}
