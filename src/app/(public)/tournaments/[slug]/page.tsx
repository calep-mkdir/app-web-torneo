import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PublicPageHero, PublicTournamentClient } from "@/components/public";
import { getPublicTournamentPageData } from "@/features/public/queries";
import { formatDateRange } from "@/components/public/date-utils";

export default async function PublicTournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicTournamentPageData(slug);

  return (
    <div className="space-y-6">
      <PublicPageHero
        eyebrow="Torneo"
        title={data.tournament.name}
        description={data.tournament.description}
        sportName={data.tournament.sportName}
        status={data.tournament.status}
        details={[
          {
            label: "Fechas",
            value: formatDateRange(
              data.tournament.startAt,
              data.tournament.endAt,
              "es-ES",
              data.tournament.timezone,
            ),
          },
          { label: "Club", value: data.tournament.venue ?? "Sede pendiente" },
          { label: "Zona", value: data.tournament.timezone },
        ]}
      />

      {data.initialCategoryId ? (
        <PublicTournamentClient
          tournament={data.tournament}
          categories={data.categories}
          initialCategoryId={data.initialCategoryId}
          initialSnapshot={data.initialSnapshot}
        />
      ) : (
        <Card className="app-panel bg-white/[0.04]">
          <CardHeader>
            <CardTitle>Sin categorias publicas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            Este torneo todavia no tiene categorias configuradas para mostrar bracket o partidos.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
