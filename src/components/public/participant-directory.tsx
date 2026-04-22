"use client";

import type { Route } from "next";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import type { PublicEntryDirectoryItem } from "@/features/public/types";

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
    <Card className="border-slate-200/80">
      <CardHeader>
        <CardTitle>Participantes</CardTitle>
        <CardDescription>
          Busca un jugador o equipo y entra en su trayectoria completa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar participante"
        />

        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No hay participantes que coincidan con la busqueda.
            </p>
          ) : (
            filteredEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/tournaments/${slug}/participants/${entry.id}` as Route}
                className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 no-underline transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">{entry.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Seed {entry.seed ?? "-"} · Estado {entry.status}
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {entry.matchesPlayed} partidos
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
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
