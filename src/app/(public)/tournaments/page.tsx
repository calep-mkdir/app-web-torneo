import type { Route } from "next";
import Link from "next/link";

import { PublicPageHero, PublicTournamentCard } from "@/components/public";
import { getPublicHomePageData } from "@/features/public/queries";

export default async function PublicTournamentIndexPage() {
  const data = await getPublicHomePageData();

  return (
    <div className="space-y-4">
      <PublicPageHero
        eyebrow="Padel"
        title="Torneos"
        sportName="Padel"
        details={[
          { label: "Torneos", value: String(data.stats.tournamentsCount) },
          { label: "Categorias", value: String(data.stats.categoriesCount) },
          { label: "Entradas", value: String(data.stats.participantsCount) },
        ]}
      />

      {data.tournaments.length === 0 ? (
        <div className="app-panel rounded-[2rem] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-white">Todavia no hay torneos publicados</p>
          <p className="mt-2 text-sm text-slate-300">Crea el primero desde el panel.</p>
          <Link href={"/admin" as Route} className="app-cta-primary mt-5">
            Crear torneo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.tournaments.map((tournament) => (
            <PublicTournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
