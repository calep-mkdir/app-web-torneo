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
            sportName={data.tournament.sportName}
            status={data.entry.status}
            details={[
              { label: "Torneo", value: data.tournament.name },
              { label: "Seed", value: String(data.entry.seed ?? "-") },
              { label: "Club", value: data.tournament.venue ?? "Sede pendiente" },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/tournaments/${slug}` as Route}
          className="app-cta-secondary px-4 py-2"
        >
          Volver al torneo
        </Link>
        <div className="text-sm text-slate-400">Seed {data.entry.seed ?? "-"}</div>
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
