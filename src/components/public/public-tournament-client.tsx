"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import { useTournamentRealtime, type TournamentLiveSnapshot } from "@/features/live";
import { buildEntryDirectory, buildMatchViewModels } from "@/features/public/mappers";
import type { PublicTournamentCategory, PublicTournamentPageData } from "@/features/public/types";
import { Card, CardContent } from "@/components/ui";

import { BracketView } from "./bracket-view";
import { CategorySwitcher } from "./category-switcher";
import { LiveMatchList } from "./live-match-list";
import { ParticipantDirectory } from "./participant-directory";
import { PublicStatStrip } from "./public-stat-strip";
import { RealtimePill } from "./realtime-pill";

export function PublicTournamentClient({
  tournament,
  categories,
  initialCategoryId,
  initialSnapshot,
}: {
  tournament: PublicTournamentPageData["tournament"];
  categories: PublicTournamentCategory[];
  initialCategoryId: string;
  initialSnapshot: TournamentLiveSnapshot | null;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [snapshotCache, setSnapshotCache] = useState<Record<string, TournamentLiveSnapshot | null>>(
    () => ({
      [initialCategoryId]: initialSnapshot,
    }),
  );
  const currentCategoryId = useMemo(
    () =>
      categories.some((category) => category.id === selectedCategoryId)
        ? selectedCategoryId
        : initialCategoryId,
    [categories, initialCategoryId, selectedCategoryId],
  );
  const categorySnapshot =
    snapshotCache[currentCategoryId] ??
    (currentCategoryId === initialCategoryId ? initialSnapshot : null);
  const realtime = useTournamentRealtime({
    categoryId: currentCategoryId,
    initialSnapshot: categorySnapshot,
  });

  useEffect(() => {
    if (!realtime.snapshot) {
      return;
    }

    startTransition(() => {
      setSnapshotCache((current) => {
        if (current[currentCategoryId] === realtime.snapshot) {
          return current;
        }

        return {
          ...current,
          [currentCategoryId]: realtime.snapshot,
        };
      });
    });
  }, [currentCategoryId, realtime.snapshot]);

  const snapshot = realtime.snapshot;
  const selectedCategory = categories.find((category) => category.id === currentCategoryId) ?? categories[0];
  const bracket = realtime.bracket;
  const allMatchViews = useMemo(
    () => (snapshot ? buildMatchViewModels(snapshot) : []),
    [snapshot],
  );
  const liveMatchViews = useMemo(
    () => allMatchViews.filter((match) => match.status === "live"),
    [allMatchViews],
  );
  const upcomingMatchViews = useMemo(
    () =>
      allMatchViews.filter(
        (match) => match.status === "ready" || match.status === "scheduled" || match.status === "pending",
      ),
    [allMatchViews],
  );
  const directoryEntries = useMemo(
    () => (snapshot ? buildEntryDirectory(snapshot) : []),
    [snapshot],
  );

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200/80">
          <CardContent className="space-y-4 px-5 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Categoria activa</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {selectedCategory?.name ?? "Sin categoria"}
                </h2>
              </div>
              <RealtimePill status={realtime.status} stale={realtime.stale} />
            </div>

            {categories.length > 1 ? (
              <CategorySwitcher
                categories={categories}
                value={currentCategoryId}
                onChange={setSelectedCategoryId}
              />
            ) : null}

            {realtime.error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {realtime.error}
              </p>
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Sincronizando datos de la categoria seleccionada...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/80">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Categoria activa</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {selectedCategory?.name ?? "Sin categoria"}
              </h2>
            </div>
            <RealtimePill status={realtime.status} stale={realtime.stale} />
          </div>

          {categories.length > 1 ? (
            <CategorySwitcher
              categories={categories}
              value={currentCategoryId}
              onChange={setSelectedCategoryId}
            />
          ) : null}

          {realtime.error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {realtime.error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <PublicStatStrip
        items={[
          { label: "Participantes", value: String(directoryEntries.length) },
          { label: "En directo", value: String(liveMatchViews.length) },
          { label: "Pendientes", value: String(upcomingMatchViews.length) },
          { label: "Rondas", value: String(bracket?.rounds.length ?? 0), hint: selectedCategory?.format ?? "group_only" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <LiveMatchList
            slug={tournament.slug}
            matches={liveMatchViews}
            timezone={tournament.timezone}
          />
          <BracketView slug={tournament.slug} bracket={bracket} />
        </div>

        <div className="space-y-6">
          <LiveMatchList
            slug={tournament.slug}
            matches={upcomingMatchViews.slice(0, 5)}
            timezone={tournament.timezone}
            title="Proximos partidos"
            description="Siguientes cruces previstos para esta categoria."
            emptyTitle="Sin partidos proximos"
            emptyDescription="Cuando haya cruces programados o pendientes los veras aqui."
          />
          <ParticipantDirectory slug={tournament.slug} entries={directoryEntries} />
        </div>
      </div>
    </div>
  );
}
