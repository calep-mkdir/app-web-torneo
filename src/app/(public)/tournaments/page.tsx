import type { Route } from "next";
import Link from "next/link";

import {
  CtaBanner,
  PublicPageHero,
  PublicTournamentCard,
  SectionHeading,
} from "@/components/public";
import { getPublicHomePageData } from "@/features/public/queries";

export default async function PublicTournamentIndexPage() {
  const data = await getPublicHomePageData();
  const liveNow = data.tournaments.filter((tournament) => tournament.liveMatchesCount > 0);

  return (
    <div className="space-y-10 lg:space-y-14">
      <PublicPageHero
        eyebrow="Calendario de padel"
        title="Todos los torneos, en una vista más limpia y fácil de seguir"
        description="Consulta el calendario del circuito, entra al cuadro de cada torneo y localiza rápido dónde se está jugando y qué está en directo."
        sportName="Padel"
        venue={`${data.stats.tournamentsCount} torneos`}
        status={`${data.stats.liveMatchesCount} en directo`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickStat label="Torneos" value={String(data.stats.tournamentsCount)} />
        <QuickStat label="Categorias" value={String(data.stats.categoriesCount)} />
        <QuickStat label="Inscripciones" value={String(data.stats.participantsCount)} />
        <QuickStat label="En juego" value={String(data.stats.liveMatchesCount)} />
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="En directo"
          title="Lo que merece abrirse primero"
          description="Los torneos con actividad viva suben arriba para que el recorrido de usuario empiece donde está pasando algo."
        />

        {liveNow.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {liveNow.map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-lg font-semibold text-white">Ahora mismo no hay partidos en directo</p>
            <p className="mt-3 text-sm text-slate-400">
              Aun así puedes entrar a cada torneo y preparar todo para cuando empiece la competición.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Todo el circuito"
          title="Explora cada torneo publicado"
          description="Una lista más clara, más oscura y mucho más fácil de recorrer desde móvil o escritorio."
        />

        {data.tournaments.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">Todavía no hay torneos publicados</p>
            <p className="mt-2 text-sm text-slate-400">
              Crea el primero desde el panel y aparecerá aquí automáticamente.
            </p>
            <Link
              href={"/admin" as Route}
              className="mt-5 inline-flex items-center rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:bg-lime-200"
            >
              Crear torneo
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.tournaments.map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </section>

      <CtaBanner
        eyebrow="Sigue o organiza"
        title="El circuito ya tiene mejor lectura pública y un panel mucho más fácil de usar."
        description="Puedes entrar a seguir los cuadros o abrir gestión para preparar el siguiente torneo de pádel en pocos pasos."
        primaryHref={"/admin" as Route}
        primaryLabel="Abrir gestion"
        secondaryHref={"/organiza" as Route}
        secondaryLabel="Ver flujo"
      />
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/8 bg-white/[0.03] px-5 py-5 shadow-[0_22px_70px_-40px_rgba(0,0,0,0.4)]">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}
