import { PageHeader, StatCards, TournamentCreateForm, TournamentList } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getAdminOverviewData } from "@/features/admin/queries";

export default async function AdminDashboardPage() {
  const data = await getAdminOverviewData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel de padel"
        title="Gestion simple para torneos que salen rapido"
        description="Empieza creando el torneo y después entra a completar categorías, parejas, cruces y resultados desde un flujo más corto y claro."
        badge={`${data.tournaments.length} torneos`}
      />

      <StatCards
        items={[
          { label: "Torneos", value: String(data.stats.tournamentsCount) },
          { label: "Inscripciones", value: String(data.stats.entriesCount) },
          { label: "Partidos", value: String(data.stats.matchesCount) },
          { label: "En vivo", value: String(data.stats.liveCount) },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <TournamentCreateForm sport={data.sport} />

        <Card>
          <CardHeader>
            <CardTitle>Torneos creados</CardTitle>
            <CardDescription>
              Entra en cada torneo para seguir con la configuración, cuadros, partidos y resultados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.tournaments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aun no hay torneos. Crea el primero desde el formulario de la izquierda.
              </p>
            ) : (
              <TournamentList tournaments={data.tournaments} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
