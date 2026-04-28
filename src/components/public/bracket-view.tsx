"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Bracket, BracketMatch, BracketRound, BracketSlot } from "@/lib/brackets";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";

const DESKTOP_HEADER_HEIGHT = 78;
const DESKTOP_CARD_WIDTH = 238;
const DESKTOP_CARD_HEIGHT = 208;
const DESKTOP_COLUMN_GAP = 44;
const DESKTOP_ROW_GAP = 18;

export function BracketView({
  slug,
  bracket,
  title = "Cuadro",
  description = "Cruces y estados de cada partido.",
}: {
  slug: string;
  bracket: Bracket | null;
  title?: string;
  description?: string;
}) {
  const boardFrameRef = useRef<HTMLDivElement>(null);
  const [boardFrameWidth, setBoardFrameWidth] = useState(0);

  useEffect(() => {
    const element = boardFrameRef.current;
    if (!element) {
      return;
    }

    const updateWidth = () => {
      setBoardFrameWidth(element.clientWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!bracket) {
    return (
      <Card className="app-panel bg-white/[0.04]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Esta categoria todavia no tiene un cuadro disponible.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rounds = bracket.rounds.map((round, roundIndex) => ({
    ...round,
    roundIndex,
    matches: round.matchIds.map((matchId) => bracket.matches[matchId]).filter(Boolean),
  }));
  const champion =
    bracket.championParticipantId ? bracket.participants[bracket.championParticipantId] : undefined;

  const firstRoundMatchCount = rounds[0]?.matches.length ?? 0;
  const boardCoreHeight =
    firstRoundMatchCount > 0
      ? firstRoundMatchCount * DESKTOP_CARD_HEIGHT + Math.max(firstRoundMatchCount - 1, 0) * DESKTOP_ROW_GAP
      : DESKTOP_CARD_HEIGHT;
  const boardHeight = DESKTOP_HEADER_HEIGHT + boardCoreHeight;
  const boardWidth =
    rounds.length * DESKTOP_CARD_WIDTH + Math.max(rounds.length - 1, 0) * DESKTOP_COLUMN_GAP;

  const roundIndexByMatchId = new Map<string, number>();
  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      roundIndexByMatchId.set(match.id, round.roundIndex);
    });
  });

  const desktopRounds = rounds.map((round) => ({
    ...round,
    x: round.roundIndex * (DESKTOP_CARD_WIDTH + DESKTOP_COLUMN_GAP),
    matches: round.matches.map((match) => {
      const centerY = getMatchCenterY(round.roundIndex, match.position);
      const top = DESKTOP_HEADER_HEIGHT + centerY - DESKTOP_CARD_HEIGHT / 2;
      return {
        ...match,
        centerY,
        top,
      };
    }),
  }));

  const connectors = desktopRounds.flatMap((round) =>
    round.matches.flatMap((match) => {
      if (!match.nextWinner) {
        return [];
      }

      const nextRoundIndex = roundIndexByMatchId.get(match.nextWinner.matchId);
      if (nextRoundIndex == null) {
        return [];
      }

      const nextRound = desktopRounds[nextRoundIndex];
      const nextMatch = nextRound?.matches.find((candidate) => candidate.id === match.nextWinner?.matchId);

      if (!nextRound || !nextMatch) {
        return [];
      }

      return [
        {
          id: `${match.id}-${nextMatch.id}`,
          d: buildConnectorPath(
            round.x + DESKTOP_CARD_WIDTH,
            DESKTOP_HEADER_HEIGHT + match.centerY,
            nextRound.x,
            DESKTOP_HEADER_HEIGHT + nextMatch.centerY,
          ),
          active: Boolean(match.winnerParticipantId),
        },
      ];
    }),
  );
  const desktopScale =
    boardFrameWidth > 0 ? Math.min(1, boardFrameWidth / boardWidth) : 1;
  const scaledBoardHeight = Math.round(boardHeight * desktopScale);
  const boardLeftOffset =
    boardFrameWidth > 0 ? Math.max((boardFrameWidth - boardWidth * desktopScale) / 2, 0) : 0;

  return (
    <Card className="app-panel overflow-hidden bg-white/[0.04]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-[#d6ff72]/18 bg-[#c7ff2f]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#eaff9d]">
              Eliminatoria
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              {rounds.length} rondas
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <BracketOverviewRail
          roundsCount={rounds.length}
          championName={champion?.name}
        />

        <div className="space-y-4 lg:hidden">
          {rounds.map((round) => (
            <section key={round.id} className="space-y-3">
              <RoundHeader round={round} mobile />
              <div className="space-y-3">
                {round.matches.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    slug={slug}
                    participants={bracket.participants}
                    isFinal={round.roundIndex === rounds.length - 1}
                    compact
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="hidden lg:block">
          <div ref={boardFrameRef} className="px-1 pb-2">
            <div
              className="relative overflow-hidden rounded-[1.6rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(199,255,47,0.06),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.01)_100%)]"
              style={{ height: scaledBoardHeight || boardHeight }}
            >
              <div
                className="absolute top-0 origin-top-left"
                style={{
                  left: boardLeftOffset,
                  width: boardWidth,
                  height: boardHeight,
                  transform: `scale(${desktopScale})`,
                }}
              >
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  width={boardWidth}
                  height={boardHeight}
                  viewBox={`0 0 ${boardWidth} ${boardHeight}`}
                >
                  {connectors.map((connector) => (
                    <path
                      key={connector.id}
                      d={connector.d}
                      fill="none"
                      stroke={connector.active ? "rgba(199,255,47,0.45)" : "rgba(148,163,184,0.18)"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>

                {desktopRounds.map((round) => (
                  <div
                    key={round.id}
                    className="absolute top-0"
                    style={{ left: round.x, width: DESKTOP_CARD_WIDTH }}
                  >
                    <RoundHeader round={round} />
                  </div>
                ))}

                {desktopRounds.map((round) =>
                  round.matches.map((match) => (
                    <div
                      key={match.id}
                      className="absolute"
                      style={{
                        left: round.x,
                        top: match.top,
                        width: DESKTOP_CARD_WIDTH,
                      }}
                    >
                      <BracketMatchCard
                        match={match}
                        slug={slug}
                        participants={bracket.participants}
                        isFinal={round.roundIndex === rounds.length - 1}
                        fixedHeight
                      />
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>

        {champion ? <BracketChampionBanner championName={champion.name} /> : null}
      </CardContent>
    </Card>
  );
}

function RoundHeader({
  round,
  mobile = false,
}: {
  round: BracketRound & { roundIndex?: number };
  mobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-white/8 bg-[linear-gradient(180deg,rgba(34,40,49,0.96)_0%,rgba(24,29,37,0.98)_100%)] px-4 py-3 shadow-[0_22px_55px_-40px_rgba(0,0,0,0.6)]",
        mobile ? "flex items-center justify-between" : "",
      )}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fa2c5]">
          {mobile ? `Ronda ${round.roundNumber}` : `Fase ${round.roundNumber}`}
        </p>
        <p className="mt-1 text-lg font-semibold text-white">{round.name}</p>
      </div>
      {mobile ? (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
          {round.matchIds.length} cruces
        </span>
      ) : null}
    </div>
  );
}

function BracketMatchCard({
  match,
  slug,
  participants,
  isFinal = false,
  compact = false,
  fixedHeight = false,
}: {
  match: BracketMatch;
  slug: string;
  participants: Bracket["participants"];
  isFinal?: boolean;
  compact?: boolean;
  fixedHeight?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-[1.55rem] border border-white/8 bg-[linear-gradient(180deg,rgba(39,45,55,0.98)_0%,rgba(31,36,45,0.99)_100%)] p-4 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.65)]",
        isFinal ? "border-[#c7ff2f]/18 shadow-[0_26px_80px_-48px_rgba(199,255,47,0.25)]" : "",
        fixedHeight ? "h-[208px]" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8191ad]">
            {compact ? match.roundName : `Partido ${match.position}`}
          </p>
          <p className="mt-1 text-sm font-semibold text-white/92">
            {compact ? `Cruce ${match.position}` : match.roundName}
          </p>
        </div>
        <Badge variant={getStatusBadgeVariant(match.status)}>{formatStatusLabel(match.status)}</Badge>
      </div>

      <div className="mt-4 space-y-2.5">
        {match.slots.map((slot, slotIndex) => (
          <BracketSlotRow
            key={`${match.id}-${slotIndex}`}
            slug={slug}
            slot={slot}
            slotIndex={slotIndex}
            isWinner={match.winnerParticipantId === slot.participantId}
            winnerKnown={Boolean(match.winnerParticipantId)}
            participants={participants}
            match={match}
          />
        ))}
      </div>
    </article>
  );
}

function BracketSlotRow({
  slug,
  slot,
  slotIndex,
  isWinner,
  winnerKnown,
  participants,
  match,
}: {
  slug: string;
  slot: BracketSlot;
  slotIndex: number;
  isWinner: boolean;
  winnerKnown: boolean;
  participants: Bracket["participants"];
  match: BracketMatch;
}) {
  const label = resolveSlotLabel(slot, slotIndex, participants);
  const href = slot.participantId
    ? (`/tournaments/${slug}/participants/${slot.participantId}` as Route)
    : null;

  const content = (
    <div
      className={cn(
        "flex min-h-[4.7rem] items-center justify-between gap-3 rounded-[1rem] border px-3 py-3 transition",
        isWinner
          ? "border-[#c7ff2f]/18 bg-[#263214] text-white shadow-[inset_0_0_0_1px_rgba(199,255,47,0.06)]"
          : winnerKnown
            ? "border-white/6 bg-[#313742] text-white/92"
            : "border-white/8 bg-[#2b313b] text-white",
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "pr-2 text-[14px] font-semibold leading-[1.15rem] text-pretty",
            !slot.participantId && "text-white/78",
          )}
        >
          {label}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7f90af]">
          {formatSlotMeta(slot, slotIndex)}
        </p>
      </div>
      <div
        className={cn(
          "min-w-[1.75rem] self-center text-right text-[1.9rem] font-semibold leading-none",
          isWinner ? "text-[#efffaa]" : "text-white",
        )}
      >
        {slot.score ?? "-"}
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block no-underline">
      {content}
    </Link>
  );
}

function BracketOverviewRail({
  roundsCount,
  championName,
}: {
  roundsCount: number;
  championName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <BracketOverviewPill label="Recorrido" value="Izquierda a derecha" />
      <BracketOverviewPill label="Cruces" value={`${roundsCount} rondas`} />
      <BracketOverviewPill label="Marcador" value="Resultado a la derecha" />
      {championName ? <BracketOverviewPill label="Campeon" value={championName} accent /> : null}
    </div>
  );
}

function BracketOverviewPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-full border px-3 py-2",
        accent
          ? "border-[#c7ff2f]/20 bg-[#253017] text-white"
          : "border-white/8 bg-white/[0.03] text-white",
      )}
    >
      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.18em]", accent ? "text-[#dfff94]" : "text-[#8092b1]")}>
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function BracketChampionBanner({
  championName,
}: {
  championName: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#c7ff2f]/20 bg-[linear-gradient(180deg,rgba(48,66,18,0.86)_0%,rgba(31,40,18,0.96)_100%)] px-4 py-4 shadow-[0_28px_65px_-38px_rgba(199,255,47,0.18)]">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e7ff9c]">
          Campeones
        </p>
        <p className="text-lg font-semibold leading-tight text-white">{championName}</p>
        <p className="text-sm text-[#d3ddbb]">Pareja ganadora del cuadro.</p>
      </div>
    </div>
  );
}

function resolveSlotLabel(
  slot: BracketSlot,
  slotIndex: number,
  participants: Bracket["participants"],
) {
  if (slot.label) {
    return slot.label;
  }

  if (slot.participantId) {
    return participants[slot.participantId]?.name ?? slot.participantId;
  }

  if (slot.source.type === "bye") {
    return "BYE";
  }

  return slot.source.type === "winner_of_match" || slot.source.type === "loser_of_match"
    ? "Por decidir"
    : `Pendiente ${slotIndex + 1}`;
}

function formatSlotMeta(slot: BracketSlot, slotIndex: number) {
  switch (slot.source.type) {
    case "seed":
      return `Seed ${slot.source.seed}`;
    case "bye":
      return "Libre";
    case "winner_of_match":
      return "Ganador previo";
    case "loser_of_match":
      return "Perdedor previo";
    case "group_qualifier":
      return `${slot.source.groupId} · ${slot.source.groupRank}`;
    default:
      return `Lado ${slotIndex + 1}`;
  }
}

function getMatchCenterY(roundIndex: number, position: number) {
  const unit = DESKTOP_CARD_HEIGHT + DESKTOP_ROW_GAP;
  return DESKTOP_CARD_HEIGHT / 2 + ((((2 * position) - 1) * 2 ** roundIndex) - 1) * (unit / 2);
}

function buildConnectorPath(x1: number, y1: number, x2: number, y2: number) {
  const midX = x1 + DESKTOP_COLUMN_GAP / 2;
  return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
}
