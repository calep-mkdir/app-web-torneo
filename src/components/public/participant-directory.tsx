"use client";

import type { Route } from "next";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import type { PublicEntryDirectoryItem } from "@/features/public/types";
import { formatStatusLabel } from "@/lib/padel";

export function ParticipantDirectory({
  slug,
  entries,
}: {
  slug: string;
  entries: PublicEntryDirectoryItem[];
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return entries;
    }

    return entries.filter((entry) => entry.name.toLowerCase().includes(normalizedQuery));
  }, [deferredQuery, entries]);

  return (
    <Card className="app-panel bg-white/[0.04]">
      <CardHeader>
        <CardTitle>Participantes</CardTitle>
        <CardDescription>Busca una pareja o jugador.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar participante"
        />

        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-6 text-sm text-slate-400">
              No hay participantes que coincidan con la busqueda.
            </p>
          ) : (
            filteredEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/tournaments/${slug}/participants/${entry.id}` as Route}
                className="block rounded-2xl border border-white/8 bg-[#232830] px-4 py-4 no-underline transition hover:border-[#d6ff72]/18 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{entry.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Seed {entry.seed ?? "-"} · {formatStatusLabel(entry.status)}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-300">
                    {entry.matchesPlayed} partidos
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span>{entry.wins} victorias</span>
                  <span>{entry.losses} derrotas</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
