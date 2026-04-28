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
        eyebrow="Padel"
        title="Torneos"
        sportName="Padel"
        details={[
          { label: "Torneos", value: String(data.stats.tournamentsCount) },
          { label: "Categorias", value: String(data.stats.categoriesCount) },
          { label: "En juego", value: String(data.stats.liveMatchesCount) },
        ]}
      />

      <section className="space-y-6">
        <SectionHeading eyebrow="Ahora" title="En juego" />

        {liveNow.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {liveNow.map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-lg font-semibold text-white">Ahora mismo no hay partidos en directo</p>
            <p className="mt-3 text-sm text-slate-400">Puedes entrar igual a cualquier torneo.</p>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Todos" title="Calendario" />

        {data.tournaments.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">Todavia no hay torneos publicados</p>
            <p className="mt-2 text-sm text-slate-400">Crea el primero desde el panel.</p>
            <Link
              href={"/admin" as Route}
              className="mt-5 inline-flex items-center rounded-full bg-[linear-gradient(135deg,#67e8f9_0%,#bef264_100%)] px-5 py-3 text-sm font-semibold text-slate-950 no-underline shadow-[0_18px_45px_-18px_rgba(103,232,249,0.5)] transition hover:brightness-105"
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
        eyebrow="Panel"
        title="Crear torneo"
        primaryHref={"/admin" as Route}
        primaryLabel="Abrir panel"
        secondaryHref={"/organiza" as Route}
        secondaryLabel="Ver pasos"
      />
    </div>
  );
}
