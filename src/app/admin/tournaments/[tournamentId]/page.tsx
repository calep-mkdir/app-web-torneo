import Link from "next/link";

import {
  CategoryForm,
  MatchForm,
  MatchesTable,
  PageHeader,
  ParticipantRegistrationForm,
  ParticipantsTable,
  ResultForm,
  StageForm,
  StageRoundForm,
  StatCards,
  TournamentEditForm,
} from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getTournamentAdminDetail } from "@/features/admin/queries";

export default async function TournamentAdminPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const data = await getTournamentAdminDetail(tournamentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          eyebrow="Torneo"
          title={data.tournament.name}
          description={`Slug ${data.tournament.slug} - Zona ${data.tournament.timezone}`}
          badge={data.tournament.status}
        />
        <Link href="/admin">Volver al dashboard</Link>
      </div>

      <StatCards
        items={[
          { label: "Categorias", value: String(data.stats.categoriesCount) },
          { label: "Participantes", value: String(data.stats.participantsCount) },
          { label: "Partidos", value: String(data.stats.matchesCount) },
          {
            label: "Pendientes",
            value: String(data.stats.pendingMatchesCount),
            hint: `${data.stats.finishedMatchesCount} finalizados`,
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TournamentEditForm tournament={data.tournament} sports={data.sports} />

        <Card>
          <CardHeader>
            <CardTitle>Resumen operativo</CardTitle>
            <CardDescription>
              Flujo recomendado: crea categorias, despues fases y rondas, registra participantes y finalmente crea partidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Categoria: estructura deportiva que agrupa inscripciones.</p>
            <p>2. Fase: grupos o knockout dentro de una categoria.</p>
            <p>3. Ronda: semifinal, final o numeracion de jornada.</p>
            <p>4. Partido: cruce programado y listo para resultados.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <CategoryForm tournamentId={data.tournament.id} />
        <ParticipantRegistrationForm categories={data.categories} />
        <StageForm categories={data.categories} />
        <StageRoundForm stages={data.stages} />
        <MatchForm
          categories={data.categories}
          stages={data.stages}
          stageRounds={data.stageRounds}
          entries={data.entries}
        />
        <ResultForm matches={data.matches} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ParticipantsTable entries={data.entries} categories={data.categories} />
        <MatchesTable matches={data.matches} />
      </div>
    </div>
  );
}
