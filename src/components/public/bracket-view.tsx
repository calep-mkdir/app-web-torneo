"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { Bracket, BracketMatch, BracketRound, BracketSlot } from "@/lib/brackets";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";
import { cn } from "@/lib/utils";

const DESKTOP_HEADER_HEIGHT = 56;
const DESKTOP_CARD_WIDTH = 192;
const DESKTOP_CARD_HEIGHT = 108;
const DESKTOP_COLUMN_GAP = 24;
const DESKTOP_ROW_GAP = 16;

type BracketRoundView = BracketRound & {
  roundIndex: number;
  matches: BracketMatch[];
};

export function BracketView({
  slug,
  bracket,
  title = "Cuadro",
  description = "Cruces y avance de la eliminatoria.",
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

  const rounds: BracketRoundView[] = bracket.rounds.map((round, roundIndex) => ({
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

  const desktopScale = boardFrameWidth > 0 ? Math.min(1, boardFrameWidth / boardWidth) : 1;
  const visibleBoardHeight = Math.round(boardHeight * desktopScale);
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
            <SummaryChip label="Formato" value="Eliminatoria" accent />
            <SummaryChip label="Rondas" value={`${rounds.length}`} />
            {champion ? <SummaryChip label="Campeones" value={champion.name} /> : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4 lg:hidden">
          {rounds.map((round) => (
            <section key={round.id} className="space-y-3">
              <RoundHeaderMobile round={round} />
              <div className="space-y-3">
                {round.matches.map((match) => (
                  <MobileMatchCard
                    key={match.id}
                    match={match}
                    slug={slug}
                    participants={bracket.participants}
                    isFinal={round.roundIndex === rounds.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="hidden lg:block">
          <div ref={boardFrameRef} className="px-1 pb-2">
            <div
              className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(199,255,47,0.08),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] px-4 py-4"
              style={{ height: (visibleBoardHeight || boardHeight) + 32 }}
            >
              <div
                className="absolute top-4 origin-top-left"
                style={{
                  left: boardLeftOffset + 16,
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
                      stroke={connector.active ? "rgba(199,255,47,0.58)" : "rgba(148,163,184,0.14)"}
                      strokeWidth="2.25"
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
                    <RoundHeaderDesktop round={round} />
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
                      <DesktopMatchCard
                        match={match}
                        slug={slug}
                        participants={bracket.participants}
                        isFinal={round.roundIndex === rounds.length - 1}
                      />
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>

        {champion ? <ChampionBanner championName={champion.name} /> : null}
      </CardContent>
    </Card>
  );
}

function SummaryChip({
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
      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.18em]", accent ? "text-[#e8ffa0]" : "text-[#8393b0]")}>
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function RoundHeaderMobile({ round }: { round: BracketRoundView }) {
  return (
    <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(34,40,49,0.96)_0%,rgba(24,29,37,0.98)_100%)] px-4 py-3 shadow-[0_22px_55px_-40px_rgba(0,0,0,0.6)]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fa2c5]">
          Ronda {round.roundNumber}
        </p>
        <p className="mt-1 text-lg font-semibold text-white">{round.name}</p>
      </div>
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
        {round.matchIds.length} cruces
      </span>
    </div>
  );
}

function RoundHeaderDesktop({ round }: { round: BracketRoundView }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-[#1d232c]/92 px-3 py-2 shadow-[0_16px_40px_-34px_rgba(0,0,0,0.9)]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8ea1c6]">
        Ronda {round.roundNumber}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-white">{round.name}</p>
    </div>
  );
}

function MobileMatchCard({
  match,
  slug,
  participants,
  isFinal = false,
}: {
  match: BracketMatch;
  slug: string;
  participants: Bracket["participants"];
  isFinal?: boolean;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(39,45,55,0.98)_0%,rgba(31,36,45,0.99)_100%)] p-4 shadow-[0_22px_55px_-40px_rgba(0,0,0,0.7)]",
        isFinal ? "border-[#c7ff2f]/18 shadow-[0_26px_80px_-48px_rgba(199,255,47,0.24)]" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8191ad]">
            {match.roundName}
          </p>
          <p className="mt-1 text-base font-semibold text-white">Cruce {match.position}</p>
        </div>
        <Badge variant={getStatusBadgeVariant(match.status)}>{formatStatusLabel(match.status)}</Badge>
      </div>

      <div className="mt-4 space-y-2.5">
        {match.slots.map((slot, slotIndex) => (
          <MobileSlotRow
            key={`${match.id}-${slotIndex}`}
            slug={slug}
            slot={slot}
            slotIndex={slotIndex}
            participants={participants}
            isWinner={match.winnerParticipantId === slot.participantId}
            winnerKnown={Boolean(match.winnerParticipantId)}
          />
        ))}
      </div>
    </article>
  );
}

function DesktopMatchCard({
  match,
  slug,
  participants,
  isFinal = false,
}: {
  match: BracketMatch;
  slug: string;
  participants: Bracket["participants"];
  isFinal?: boolean;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.35rem] border border-white/8 bg-[linear-gradient(180deg,rgba(39,45,55,0.98)_0%,rgba(29,34,42,0.99)_100%)] p-3 shadow-[0_20px_55px_-44px_rgba(0,0,0,0.8)]",
        isFinal ? "border-[#c7ff2f]/18 bg-[linear-gradient(180deg,rgba(48,61,25,0.92)_0%,rgba(29,34,42,0.99)_100%)]" : "",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8091ae]">
            {match.roundName}
          </p>
          <p className="mt-1 text-[12px] font-semibold text-white/90">Cruce {match.position}</p>
        </div>
        <StatusPip status={match.status} />
      </div>

      <div className="mt-3 space-y-2">
        {match.slots.map((slot, slotIndex) => (
          <DesktopSlotRow
            key={`${match.id}-${slotIndex}`}
            slug={slug}
            slot={slot}
            slotIndex={slotIndex}
            participants={participants}
            isWinner={match.winnerParticipantId === slot.participantId}
            winnerKnown={Boolean(match.winnerParticipantId)}
          />
        ))}
      </div>
    </article>
  );
}

function StatusPip({ status }: { status: BracketMatch["status"] }) {
  const tone =
    status === "finished"
      ? "bg-[#d6ff72]"
      : status === "live"
        ? "bg-amber-300"
        : status === "cancelled"
          ? "bg-rose-400"
          : "bg-slate-500";

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2 py-1">
      <span className={cn("h-2 w-2 rounded-full", tone)} />
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-300">
        {formatStatusLabel(status)}
      </span>
    </div>
  );
}

function MobileSlotRow({
  slug,
  slot,
  slotIndex,
  participants,
  isWinner,
  winnerKnown,
}: {
  slug: string;
  slot: BracketSlot;
  slotIndex: number;
  participants: Bracket["participants"];
  isWinner: boolean;
  winnerKnown: boolean;
}) {
  const label = resolveSlotLabel(slot, slotIndex, participants);
  const href = slot.participantId
    ? (`/tournaments/${slug}/participants/${slot.participantId}` as Route)
    : null;

  const content = (
    <div
      className={cn(
        "flex min-h-[5rem] items-center justify-between gap-3 rounded-[1rem] border px-3 py-3",
        isWinner
          ? "border-[#c7ff2f]/18 bg-[#263214] text-white"
          : winnerKnown
            ? "border-white/6 bg-[#313742] text-white/92"
            : "border-white/8 bg-[#2b313b] text-white",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("pr-2 text-[14px] font-semibold leading-[1.08rem]", !slot.participantId && "text-white/78")}>
          {label}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7f90af]">
          {formatSlotMeta(slot, slotIndex)}
        </p>
      </div>
      <div className={cn("min-w-[1.6rem] text-right text-[1.9rem] font-semibold leading-none", isWinner ? "text-[#efffaa]" : "text-white")}>
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

function DesktopSlotRow({
  slug,
  slot,
  slotIndex,
  participants,
  isWinner,
  winnerKnown,
}: {
  slug: string;
  slot: BracketSlot;
  slotIndex: number;
  participants: Bracket["participants"];
  isWinner: boolean;
  winnerKnown: boolean;
}) {
  const label = resolveSlotLabel(slot, slotIndex, participants);
  const href = slot.participantId
    ? (`/tournaments/${slug}/participants/${slot.participantId}` as Route)
    : null;

  const content = (
    <div
      className={cn(
        "flex min-h-[2.75rem] items-center justify-between gap-2 rounded-[0.95rem] border px-2.5 py-2",
        isWinner
          ? "border-[#c7ff2f]/18 bg-[#283617] text-white"
          : winnerKnown
            ? "border-white/6 bg-[#313742] text-white/92"
            : "border-white/8 bg-[#2b313b] text-white",
      )}
    >
      <p
        className={cn("min-w-0 flex-1 truncate pr-2 text-[11px] font-semibold", !slot.participantId && "text-white/78")}
        title={label}
      >
        {label}
      </p>
      <div className={cn("min-w-[1.2rem] text-right text-[1.3rem] font-semibold leading-none", isWinner ? "text-[#efffaa]" : "text-white")}>
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

function ChampionBanner({ championName }: { championName: string }) {
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
