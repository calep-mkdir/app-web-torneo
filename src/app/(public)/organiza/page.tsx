import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { CalendarDays, ClipboardList, Radar, Trophy } from "lucide-react";

import { CtaBanner, PublicPageHero, SectionHeading } from "@/components/public";

export const metadata: Metadata = {
  title: "Organiza tu torneo",
  description:
    "Un flujo más corto para crear torneos de pádel, publicar el calendario y seguir cuadro, partidos y resultados.",
};

const workflow = [
  {
    icon: Trophy,
    title: "1. Crea el torneo",
    text: "Nombre, sede, fechas y publicación. El alta queda reducida a lo necesario para empezar.",
  },
  {
    icon: ClipboardList,
    title: "2. Completa el cuadro",
    text: "Añade categorías, inscripciones, fases, rondas y partidos sin perder el hilo del torneo.",
  },
  {
    icon: Radar,
    title: "3. Sigue el directo",
    text: "Guarda resultados y deja que la parte pública muestre el avance en tiempo real.",
  },
];

export default function OrganizePage() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <PublicPageHero
        eyebrow="Organiza"
        title="Un panel de pádel pensado para ir al grano"
        description="La gestión ya no empieza con fricción: primero creas el torneo, luego completas el cuadro y finalmente publicas todo con una lectura mucho más limpia."
        sportName="Padel"
        venue="Panel abierto"
        status="listo para editar"
      />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Flujo corto"
          title="Menos pasos visibles, más sensación de control"
          description="La parte de gestión está más enfocada a lo que realmente haces en un torneo de pádel: crear, completar, publicar y seguir."
        />

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

      <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-lime-300">
              Lo importante
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Crear torneos ya no debería sentirse lioso.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              El alta del torneo se ha comprimido y el panel mantiene lo avanzado fuera del camino.
              Eso deja más foco para lo que importa: categorías, parejas, calendario y resultados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={"/admin" as Route}
              className="inline-flex items-center rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:bg-lime-200"
            >
              Abrir panel
            </Link>
            <Link
              href={"/tournaments" as Route}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/[0.08]"
            >
              Ver torneos
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoTile
          icon={CalendarDays}
          title="Listo para móvil"
          text="La parte pública y la de gestión tienen ahora una jerarquía más limpia y mejor lectura en pantalla pequeña."
        />
        <InfoTile
          icon={Radar}
          title="Hecho para seguir"
          text="La experiencia prioriza partidos, rondas, resultados y recorrido sin tener que pelear con la interfaz."
        />
      </section>

      <CtaBanner
        eyebrow="Siguiente paso"
        title="Entra al panel y crea el siguiente torneo de pádel con un flujo más corto."
        description="La base ya está preparada para seguir afinando categorías, parejas y partidos dentro del mismo estilo visual."
        primaryHref={"/admin" as Route}
        primaryLabel="Ir a gestion"
        secondaryHref={"/tournaments" as Route}
        secondaryLabel="Ver calendario"
      />
    </div>
  );
}

function InfoTile({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CalendarDays;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.38)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </article>
  );
}
