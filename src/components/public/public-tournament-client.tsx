"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import { useTournamentRealtime, type TournamentLiveSnapshot } from "@/features/live";
import { buildEntryDirectory, buildMatchViewModels } from "@/features/public/mappers";
import type { PublicTournamentCategory, PublicTournamentPageData } from "@/features/public/types";
import { Badge, Card, CardContent } from "@/components/ui";
import {
  formatCategoryFormatLabel,
  formatStatusLabel,
  getStatusBadgeVariant,
} from "@/lib/padel";

import { BracketView } from "./bracket-view";
import { CategorySwitcher } from "./category-switcher";
import { LiveMatchList } from "./live-match-list";
import { ParticipantDirectory } from "./participant-directory";
import { PublicStatStrip } from "./public-stat-strip";

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
  const pendingMatchViews = useMemo(
    () =>
      allMatchViews.filter(
        (match) => match.status !== "finished" && match.status !== "cancelled",
      ),
    [allMatchViews],
  );
  const finishedMatchViews = useMemo(
    () => allMatchViews.filter((match) => match.status === "finished"),
    [allMatchViews],
  );
  const directoryEntries = useMemo(
    () => (snapshot ? buildEntryDirectory(snapshot) : []),
    [snapshot],
  );

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <Card className="app-panel bg-white/[0.04]">
          <CardContent className="space-y-4 px-5 py-5">
            <div>
              <div>
                <p className="text-sm font-medium text-slate-500">Categoria activa</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {selectedCategory?.name ?? "Sin categoria"}
                </h2>
              </div>
            </div>

            {categories.length > 1 ? (
              <CategorySwitcher
                categories={categories}
                value={currentCategoryId}
                onChange={setSelectedCategoryId}
              />
            ) : null}

            {realtime.error ? (
              <p className="rounded-2xl border border-rose-400/18 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {realtime.error}
              </p>
            ) : (
              <p className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-6 text-sm text-slate-400">
                Cargando categoria...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="app-panel bg-white/[0.04]">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Categoria activa</p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {selectedCategory?.name ?? "Sin categoria"}
              </h2>
            </div>
            <div className="self-start">
              <Badge variant={getStatusBadgeVariant(selectedCategory?.status ?? "active")}>
                {formatStatusLabel(selectedCategory?.status ?? "active")}
              </Badge>
            </div>
          </div>

          {categories.length > 1 ? (
            <CategorySwitcher
              categories={categories}
              value={currentCategoryId}
              onChange={setSelectedCategoryId}
            />
          ) : null}

          {realtime.error ? (
            <p className="rounded-2xl border border-rose-400/18 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {realtime.error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <PublicStatStrip
        items={[
          { label: "Participantes", value: String(directoryEntries.length) },
          { label: "Pendientes", value: String(pendingMatchViews.length) },
          { label: "Finalizados", value: String(finishedMatchViews.length) },
          {
            label: "Rondas",
            value: String(bracket?.rounds.length ?? 0),
            hint: formatCategoryFormatLabel(selectedCategory?.format ?? "group_only"),
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <BracketView slug={tournament.slug} bracket={bracket} />
        </div>

        <div className="space-y-6">
          <LiveMatchList
            slug={tournament.slug}
            matches={pendingMatchViews.slice(0, 6)}
            timezone={tournament.timezone}
            title="Pendientes"
            description="Partidos por jugar o cerrar."
            emptyTitle="Sin partidos pendientes"
            emptyDescription="Todos los partidos de esta categoria estan cerrados."
          />
          <LiveMatchList
            slug={tournament.slug}
            matches={finishedMatchViews.slice(0, 6)}
            timezone={tournament.timezone}
            title="Resultados"
            description="Ultimos partidos cerrados."
            emptyTitle="Sin resultados"
            emptyDescription="Todavia no hay partidos finalizados."
          />
          <ParticipantDirectory slug={tournament.slug} entries={directoryEntries} />
        </div>
      </div>
    </div>
  );
}
