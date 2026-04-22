"use client";

import { useTournamentRealtime } from "./useTournamentRealtime";
import type { TournamentLiveSnapshot } from "./types";

interface TournamentLiveClientProps {
  categoryId: string;
  initialSnapshot: TournamentLiveSnapshot | null;
}

export function TournamentLiveClient({
  categoryId,
  initialSnapshot,
}: TournamentLiveClientProps) {
  const {
    status,
    stale,
    error,
    liveMatches,
    upcomingMatches,
    finishedMatches,
    bracket,
    refresh,
    reconnectNow,
  } = useTournamentRealtime({
    categoryId,
    initialSnapshot,
  });

  return (
    <section>
      <header
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <strong>Realtime: {status}</strong>
        {stale ? <span>Sync pendiente</span> : <span>Sincronizado</span>}
        <button type="button" onClick={() => void refresh()}>
          Refrescar snapshot
        </button>
        <button type="button" onClick={() => void reconnectNow()}>
          Reconectar
        </button>
      </header>

      {error ? (
        <p style={{ color: "crimson", marginBottom: "16px" }}>{error}</p>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <MetricCard label="En vivo" value={String(liveMatches.length)} />
        <MetricCard label="Pendientes" value={String(upcomingMatches.length)} />
        <MetricCard label="Finalizados" value={String(finishedMatches.length)} />
        <MetricCard
          label="Bracket"
          value={bracket ? `${bracket.rounds.length} rondas` : "No disponible"}
        />
      </div>

      <section>
        <h2>Partidos en vivo</h2>
        <ul>
          {liveMatches.map((match) => (
            <li key={match.id}>
              {match.id} - estado {match.status}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function MetricCard(props: { label: string; value: string }) {
  return (
    <article
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: "12px",
        padding: "12px",
      }}
    >
      <div style={{ fontSize: "12px", opacity: 0.7 }}>{props.label}</div>
      <strong style={{ fontSize: "20px" }}>{props.value}</strong>
    </article>
  );
}
