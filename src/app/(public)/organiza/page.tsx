import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { CalendarDays, ClipboardList, Radar, Trophy } from "lucide-react";

import { PublicPageHero } from "@/components/public";

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
    text: "Marcadores y cierre.",
  },
];

export default function OrganizePage() {
  return (
    <div className="space-y-4">
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

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {workflow.map((item) => (
            <article key={item.title} className="app-panel rounded-[2rem] p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4">
          <ActionTile
            icon={CalendarDays}
            title="Abrir panel"
            href={"/admin" as Route}
            label="Crear torneo"
            primary
          />
          <ActionTile
            icon={Radar}
            title="Ver torneos"
            href={"/tournaments" as Route}
            label="Abrir calendario"
          />
        </div>
      </section>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  href,
  label,
  primary = false,
}: {
  icon: typeof CalendarDays;
  title: string;
  href: Route;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="app-panel group rounded-[2rem] p-6 no-underline transition hover:-translate-y-1 hover:bg-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <span className={primary ? "app-cta-primary px-4 py-2" : "app-cta-secondary px-4 py-2"}>
          {label}
        </span>
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
    </Link>
  );
}
