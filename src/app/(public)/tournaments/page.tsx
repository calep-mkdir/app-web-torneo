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
        eyebrow="Calendario público"
        title="Todos los torneos en un escaparate mucho más claro y vibrante"
        description="Recorre competiciones, descubre qué está en directo y entra en cada torneo con una navegación más rica y totalmente responsive."
        sportName={`${data.stats.sportsCount} deportes`}
        venue={`${data.stats.tournamentsCount} torneos`}
        status={`${data.stats.liveMatchesCount} partidos live`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickStat label="Torneos" value={String(data.stats.tournamentsCount)} />
        <QuickStat label="Participantes" value={String(data.stats.participantsCount)} />
        <QuickStat label="En vivo" value={String(data.stats.liveMatchesCount)} />
        <QuickStat label="Deportes" value={String(data.stats.sportsCount)} />
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Lo más activo"
          title="Competiciones que están ahora mismo moviéndose"
          description="Aquí aparecen primero los torneos con más actividad en directo para que la experiencia pública tenga ritmo desde el primer scroll."
        />

        {liveNow.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {liveNow.map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-950">Ahora mismo no hay partidos en directo</p>
            <p className="mt-3 text-sm text-slate-500">
              Aun así puedes entrar en cada torneo y explorar categorías, participantes y el estado de la competición.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Todos los torneos"
          title="Explora cada competición publicada"
          description="Desde eventos pequeños hasta cuadros con más actividad: el catálogo público ahora tiene más jerarquía visual y mejor lectura en móvil."
        />

      {data.tournaments.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-950">No hay torneos publicos disponibles</p>
          <p className="mt-2 text-sm text-slate-500">
            Cuando un torneo se publique aparecera automaticamente aqui.
          </p>
          <Link
            href={"/admin" as Route}
            className="mt-5 inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-slate-800"
          >
            Crear el primero
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
        eyebrow="Más recorrido"
        title="No es solo un listado: entra en deportes, gestión y detalle de cada torneo."
        description="La experiencia pública ahora reparte mejor la información y te lleva donde toca sin obligarte a empezar siempre desde la misma pantalla."
        primaryHref={"/deportes" as Route}
        primaryLabel="Ver deportes"
        secondaryHref={"/organiza" as Route}
        secondaryLabel="Cómo organizar"
      />
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/70 bg-white/82 px-5 py-5 shadow-[0_22px_70px_-40px_rgba(15,23,42,0.26)]">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
