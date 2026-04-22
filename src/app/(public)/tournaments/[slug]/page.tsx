import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PublicPageHero, PublicTournamentClient } from "@/components/public";
import { getPublicTournamentPageData } from "@/features/public/queries";

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
        venue={data.tournament.venue}
        status={data.tournament.status}
        startAt={data.tournament.startAt}
        endAt={data.tournament.endAt}
        timezone={data.tournament.timezone}
      />

      {data.initialCategoryId ? (
        <PublicTournamentClient
          tournament={data.tournament}
          categories={data.categories}
          initialCategoryId={data.initialCategoryId}
          initialSnapshot={data.initialSnapshot}
        />
      ) : (
        <Card className="border-slate-200/80">
          <CardHeader>
            <CardTitle>Sin categorias publicas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Este torneo todavia no tiene categorias configuradas para mostrar bracket o partidos.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
