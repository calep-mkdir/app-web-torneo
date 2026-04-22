import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import {
  Activity,
  CalendarClock,
  HeartHandshake,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import {
  CtaBanner,
  PublicTournamentCard,
  SectionHeading,
} from "@/components/public";
import { getPublicHomePageData } from "@/features/public/queries";

export const metadata: Metadata = {
  title: "Torneos que se viven con color",
  description:
    "Explora torneos, sigue partidos y gestiona competiciones desde una experiencia más alegre, deportiva y responsive.",
};

const homeHighlights = [
  {
    icon: Activity,
    title: "Marcadores con ritmo",
    description:
      "Sigue cruces, rondas y resultados sin perder el hilo aunque abras la web desde el móvil en mitad de la competición.",
  },
  {
    icon: Users,
    title: "Participantes con historia",
    description:
      "Cada jugador o equipo tiene su recorrido visible para que el torneo se entienda de un vistazo y se comparta mejor.",
  },
  {
    icon: CalendarClock,
    title: "Calendario respirable",
    description:
      "Partidos próximos, torneos activos y categorías organizadas para no convertir la operativa en un caos.",
  },
  {
    icon: HeartHandshake,
    title: "Gestión abierta y simple",
    description:
      "Puedes entrar al panel, crear torneos, categorías, participantes, partidos y publicar todo sin fricciones extra.",
  },
];

export default async function PublicHomePage() {
  const data = await getPublicHomePageData();

  return (
    <div className="space-y-10 lg:space-y-14">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/82 px-6 py-8 shadow-[0_34px_110px_-42px_rgba(15,23,42,0.34)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.22),transparent_58%)] lg:block" />
        <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-fuchsia-300/25 blur-2xl" />
        <div className="absolute bottom-8 right-8 h-28 w-28 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-fuchsia-50 px-4 py-2 text-sm font-semibold text-fuchsia-700">
              <Sparkles className="h-4 w-4" />
              Diseño más vivo para torneos felices
            </div>

            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Una web de torneos que se siente como deporte, energia y celebración.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Descubre competiciones, entra en cada cuadro, comparte participantes y gestiona todo desde
              una experiencia mucho más abierta, colorida y fácil de usar en móvil y escritorio.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={"/tournaments" as Route}
                className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Ver torneos
              </Link>
              <Link
                href={"/admin" as Route}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 no-underline transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
              >
                Abrir gestion
              </Link>
              <Link
                href={"/deportes" as Route}
                className="inline-flex items-center rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-900 no-underline transition hover:-translate-y-0.5 hover:bg-amber-200"
              >
                Explorar deportes
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SpotlightMetric
              label="Torneos publicados"
              value={String(data.stats.tournamentsCount)}
              tone="orange"
            />
            <SpotlightMetric
              label="Participantes"
              value={String(data.stats.participantsCount)}
              tone="sky"
            />
            <SpotlightMetric
              label="Partidos en directo"
              value={String(data.stats.liveMatchesCount)}
              tone="pink"
            />
            <SpotlightMetric
              label="Deportes activos"
              value={String(data.stats.sportsCount)}
              tone="emerald"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {homeHighlights.map((item) => (
          <div
            key={item.title}
            className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(14,165,233,0.35)] backdrop-blur"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ec4899_55%,#06b6d4_100%)] text-white shadow-lg shadow-fuchsia-200/40">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Ahora mismo"
          title="Torneos que merecen foco"
          description="Una selección rápida para entrar de lleno a la competición, seguir partidos y descubrir dónde se mueve la acción."
        />

        {data.featuredTournaments.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
            <p className="text-xl font-semibold text-slate-950">Todavía no hay torneos públicos activos</p>
            <p className="mt-3 text-sm text-slate-500">
              En cuanto publiques el primero aparecerá aquí con todo el protagonismo.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.featuredTournaments.slice(0, 3).map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Deportes"
          title="Cada deporte puede sentirse distinto y seguirse igual de bien"
          description="Agrupa torneos, participantes y actividad en directo en una capa visual más clara y alegre."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.sports.map((sport, index) => (
            <div
              key={sport.name}
              className={getSportCardClass(index)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-950 shadow-sm">
                  <Medal className="h-5 w-5" />
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {sport.tournamentsCount} torneos
                </div>
              </div>

              <h3 className="mt-5 text-2xl font-semibold text-slate-950">{sport.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {sport.participantsCount} participantes totales y {sport.liveMatchesCount} partidos en vivo.
              </p>

              {sport.featuredTournamentSlug && sport.featuredTournamentName ? (
                <Link
                  href={`/tournaments/${sport.featuredTournamentSlug}` as Route}
                  className="mt-5 inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-slate-800"
                >
                  Ver {sport.featuredTournamentName}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <CtaBanner
        eyebrow="Organiza sin fricciones"
        title="Crea el siguiente torneo, publica categorías y mueve el cuadro desde el mismo sitio."
        description="La parte pública y la de gestión ya conviven en una experiencia más abierta, responsive y lista para crecer."
        primaryHref={"/admin" as Route}
        primaryLabel="Entrar al panel"
        secondaryHref={"/organiza" as Route}
        secondaryLabel="Ver flujo de organización"
      />
    </div>
  );
}

function SpotlightMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "orange" | "sky" | "pink" | "emerald";
}) {
  const toneClasses = {
    orange: "bg-[linear-gradient(160deg,#fff7ed_0%,#ffedd5_100%)]",
    sky: "bg-[linear-gradient(160deg,#ecfeff_0%,#dbeafe_100%)]",
    pink: "bg-[linear-gradient(160deg,#fff1f2_0%,#fdf2f8_100%)]",
    emerald: "bg-[linear-gradient(160deg,#ecfdf5_0%,#f0fdf4_100%)]",
  };

  return (
    <div className={`rounded-[1.8rem] border border-white/70 p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function getSportCardClass(index: number) {
  const classes = [
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#fff7ed_0%,#ffedd5_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(249,115,22,0.35)]",
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#ecfeff_0%,#dbeafe_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(14,165,233,0.35)]",
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#fff1f2_0%,#fdf2f8_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(236,72,153,0.3)]",
    "rounded-[2rem] border border-white/70 bg-[linear-gradient(160deg,#f0fdf4_0%,#ecfccb_100%)] p-6 shadow-[0_22px_70px_-40px_rgba(34,197,94,0.28)]",
  ];

  return classes[index % classes.length];
}
