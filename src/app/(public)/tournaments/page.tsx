import { PublicPageHero, PublicTournamentCard } from "@/components/public";
import { getPublicTournamentIndexData } from "@/features/public/queries";

export default async function PublicTournamentIndexPage() {
  const data = await getPublicTournamentIndexData();

  return (
    <div className="space-y-6">
      <PublicPageHero
        eyebrow="Visualizacion publica"
        title="Torneos en tiempo real"
        description="Consulta cuadros, participantes y partidos en directo desde una interfaz pensada para seguir competicion en movil y escritorio."
      />

      {data.tournaments.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-950">No hay torneos publicos disponibles</p>
          <p className="mt-2 text-sm text-slate-500">
            Cuando un torneo se publique aparecera automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.tournaments.map((tournament) => (
            <PublicTournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
