import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Goal,
  LayoutDashboard,
  Rocket,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";

import { CtaBanner, PublicPageHero, SectionHeading } from "@/components/public";

export const metadata: Metadata = {
  title: "Organiza y publica",
  description:
    "Crea torneos, categorías, participantes, partidos y resultados desde un panel abierto y pensado para moverse rápido.",
};

const workflow = [
  {
    title: "Crea el torneo",
    description:
      "Empieza con nombre, deporte, sede, fechas y estado de publicación desde una vista limpia y directa.",
    icon: Trophy,
  },
  {
    title: "Prepara categorías y cruces",
    description:
      "Configura participantes, cuadros, rondas y próximos partidos sin salir del flujo principal de gestión.",
    icon: Goal,
  },
  {
    title: "Publica y comparte",
    description:
      "Todo lo que actualizas se refleja en la parte pública para que el torneo se viva también fuera del panel.",
    icon: Rocket,
  },
];

const capabilities = [
  {
    title: "Dashboard abierto",
    text: "Acceso directo al panel para crear torneos y operar sin pasos de autenticación intermedios.",
    icon: LayoutDashboard,
  },
  {
    title: "Calendario claro",
    text: "Fechas, sedes y estados visibles para tener contexto antes de programar o publicar partidos.",
    icon: CalendarDays,
  },
  {
    title: "Participantes y equipos",
    text: "Registra entradas, consulta seeds y sigue cada recorrido desde la parte pública.",
    icon: UsersRound,
  },
  {
    title: "Resultados y avance",
    text: "Guarda marcadores y mueve el bracket knockout sin perder la trazabilidad del torneo.",
    icon: Target,
  },
];

export default function OrganizePage() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <PublicPageHero
        eyebrow="Organiza"
        title="Gestiona torneos sin fricción y publícalos con una estética mucho más viva."
        description="El panel queda abierto para operar rápido: crear torneos, mover categorías, registrar participantes, preparar partidos y compartir resultados."
        sportName="Panel abierto"
        venue="Responsive"
        status="listo para editar"
      />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Flujo"
          title="Un recorrido simple para pasar de idea a competición publicada"
          description="La gestión está pensada para que puedas arrancar rápido, ajustar sobre la marcha y compartir el torneo con una presencia visual mucho más atractiva."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {workflow.map((item, index) => (
            <article
              key={item.title}
              className={getWorkflowCardClass(index)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-slate-950 shadow-sm">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Paso {index + 1}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Capacidades"
          title="Todo lo importante ya está conectado"
          description="No solo es más bonito: sigue haciendo lo necesario para operar torneos de verdad y compartirlos en tiempo real."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {capabilities.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.26)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ec4899_55%,#06b6d4_100%)] text-white shadow-lg shadow-fuchsia-200/30">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_40%,#eff6ff_100%)] px-6 py-8 shadow-[0_24px_80px_-40px_rgba(249,115,22,0.26)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-600">
              Acceso directo
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Ya no hace falta iniciar sesión para empezar a mover el torneo.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Si quieres editar, entra en gestión. Si quieres enseñar el torneo, comparte la parte pública.
              Todo navega mejor, se ve mejor y responde mejor en pantalla pequeña.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={"/admin" as Route}
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-slate-800"
            >
              Abrir panel
            </Link>
            <Link
              href={"/tournaments" as Route}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 no-underline transition hover:border-slate-300 hover:text-slate-950"
            >
              Ver parte pública
            </Link>
          </div>
        </div>
      </div>

      <CtaBanner
        eyebrow="Siguiente movimiento"
        title="Entra al panel y crea el primer torneo con este nuevo estilo más abierto."
        description="La estructura ya está preparada para seguir creciendo con nuevas categorías, partidos, resultados y páginas públicas más ricas."
        primaryHref={"/admin" as Route}
        primaryLabel="Ir a gestión"
        secondaryHref={"/tournaments" as Route}
        secondaryLabel="Explorar torneos"
      />
    </div>
  );
}

function getWorkflowCardClass(index: number) {
  const classes = [
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#fff7ed_0%,#ffedd5_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(249,115,22,0.35)]",
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#fff1f2_0%,#fdf2f8_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(236,72,153,0.28)]",
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#ecfeff_0%,#dbeafe_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(14,165,233,0.32)]",
  ];

  return classes[index % classes.length];
}
