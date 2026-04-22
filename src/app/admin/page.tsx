import { PageHeader, StatCards, TournamentCreateForm, TournamentList } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getAdminOverviewData } from "@/features/admin/queries";

export default async function AdminDashboardPage() {
  const data = await getAdminOverviewData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel de administracion"
        title="Dashboard de torneos"
        description="Gestiona torneos, inscripciones, cuadros y resultados desde una sola vista."
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
        <TournamentCreateForm sports={data.sports} />

        <Card>
          <CardHeader>
            <CardTitle>Torneos creados</CardTitle>
            <CardDescription>
              Entra en cada torneo para editar su configuracion, categorias, participantes y partidos.
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
