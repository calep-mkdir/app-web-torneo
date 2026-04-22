import type { Route } from "next";
import Link from "next/link";

import { ParticipantPathTimeline, PublicPageHero } from "@/components/public";
import { getPublicParticipantPageData } from "@/features/public/queries";

export default async function PublicParticipantPage({
  params,
}: {
  params: Promise<{ slug: string; entryId: string }>;
}) {
  const { slug, entryId } = await params;
  const data = await getPublicParticipantPageData(slug, entryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <PublicPageHero
            eyebrow={data.category.name}
            title={data.entry.name}
            description={`Trayectoria publica dentro de ${data.tournament.name}.`}
            sportName={data.tournament.sportName}
            venue={data.tournament.venue}
            status={data.entry.status}
            startAt={data.tournament.startAt}
            endAt={data.tournament.endAt}
            timezone={data.tournament.timezone}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href={`/tournaments/${slug}` as Route}>Volver al torneo</Link>
        <div className="text-sm text-slate-500">Seed {data.entry.seed ?? "-"}</div>
      </div>

      <ParticipantPathTimeline
        slug={slug}
        entryName={data.entry.name}
        history={data.history}
        knockoutPath={data.knockoutPath}
        timezone={data.tournament.timezone}
      />
    </div>
  );
}
