"use client";

import type { Route } from "next";
import Link from "next/link";
import { Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import type { Bracket, BracketMatch, BracketRound, BracketSlot } from "@/lib/brackets";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";
import { cn } from "@/lib/utils";

const BOARD_HEADER_HEIGHT = 68;
const BOARD_CARD_WIDTH = 284;
const BOARD_CARD_HEIGHT = 214;
const BOARD_COLUMN_GAP = 52;
const BOARD_ROW_GAP = 58;

type BracketRoundView = BracketRound & {
  roundIndex: number;
  matches: BracketMatch[];
};

type PositionedBracketMatch = BracketMatch & {
  centerY: number;
  top: number;
};

type PositionedBracketRound = Omit<BracketRoundView, "matches"> & {
  x: number;
  matches: PositionedBracketMatch[];
};

type BracketConnector = {
  id: string;
  d: string;
  active: boolean;
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
  const expandedFrameRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedFrameSize, setExpandedFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const element = expandedFrameRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setExpandedFrameSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isExpanded]);

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
      ? firstRoundMatchCount * BOARD_CARD_HEIGHT + Math.max(firstRoundMatchCount - 1, 0) * BOARD_ROW_GAP
      : BOARD_CARD_HEIGHT;
  const boardHeight = BOARD_HEADER_HEIGHT + boardCoreHeight;
  const boardWidth =
    rounds.length * BOARD_CARD_WIDTH + Math.max(rounds.length - 1, 0) * BOARD_COLUMN_GAP;

  const roundIndexByMatchId = new Map<string, number>();
  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      roundIndexByMatchId.set(match.id, round.roundIndex);
    });
  });

  const positionedRounds = rounds.map((round) => ({
    ...round,
    x: round.roundIndex * (BOARD_CARD_WIDTH + BOARD_COLUMN_GAP),
    matches: round.matches.map((match) => {
      const centerY = getMatchCenterY(round.roundIndex, match.position);
      const top = BOARD_HEADER_HEIGHT + centerY - BOARD_CARD_HEIGHT / 2;
      return {
        ...match,
        centerY,
        top,
      };
    }),
  }));

  const connectors: BracketConnector[] = positionedRounds.flatMap((round) =>
    round.matches.flatMap((match) => {
      if (!match.nextWinner) {
        return [];
      }

      const nextRoundIndex = roundIndexByMatchId.get(match.nextWinner.matchId);
      if (nextRoundIndex == null) {
        return [];
      }

      const nextRound = positionedRounds[nextRoundIndex];
      const nextMatch = nextRound?.matches.find((candidate) => candidate.id === match.nextWinner?.matchId);

      if (!nextRound || !nextMatch) {
        return [];
      }

      return [
        {
          id: `${match.id}-${nextMatch.id}`,
          d: buildConnectorPath(
            round.x + BOARD_CARD_WIDTH,
            BOARD_HEADER_HEIGHT + match.centerY,
            nextRound.x,
            BOARD_HEADER_HEIGHT + nextMatch.centerY,
          ),
          active: Boolean(match.winnerParticipantId),
        },
      ];
    }),
  );

  const expandedScale =
    expandedFrameSize.width > 0 && expandedFrameSize.height > 0
      ? Math.min(
          1,
          (expandedFrameSize.width - 32) / boardWidth,
          (expandedFrameSize.height - 32) / boardHeight,
        )
      : 1;

  return (
    <>
      <Card className="app-panel overflow-hidden bg-white/[0.04]">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SummaryChip label="Formato" value="Eliminatoria" accent />
              <SummaryChip label="Rondas" value={`${rounds.length}`} />
              {champion ? <SummaryChip label="Campeones" value={champion.name} /> : null}
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => setIsExpanded(true)}
              >
                <Expand className="h-4 w-4" />
                Ver grande
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(199,255,47,0.08),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] p-4">
            <div className="-mx-1 overflow-x-auto px-1 pb-3 [scrollbar-color:rgba(199,255,47,0.35)_rgba(255,255,255,0.05)] [scrollbar-width:thin]">
              <div className="min-w-max">
                <BracketBoard
                  slug={slug}
                  rounds={positionedRounds}
                  participants={bracket.participants}
                  connectors={connectors}
                  boardWidth={boardWidth}
                  boardHeight={boardHeight}
                />
              </div>
            </div>
          </div>

          {champion ? <ChampionBanner championName={champion.name} /> : null}
        </CardContent>
      </Card>

      {isExpanded ? (
        <div className="fixed inset-0 z-50 bg-[#090d12]/95 p-3 backdrop-blur-md sm:p-5">
          <div className="flex h-full flex-col rounded-[1.8rem] border border-white/10 bg-[#10161f]/98 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fa2c5]">
                  Vista completa
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{title}</p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
                Cerrar
              </Button>
            </div>

            <div ref={expandedFrameRef} className="relative flex-1 overflow-hidden p-4 sm:p-5">
              <div
                className="absolute left-1/2 top-1/2 origin-top-left"
                style={{
                  width: boardWidth,
                  height: boardHeight,
                  transform: `translate(-50%, -50%) scale(${expandedScale})`,
                }}
              >
                <BracketBoard
                  slug={slug}
                  rounds={positionedRounds}
                  participants={bracket.participants}
                  connectors={connectors}
                  boardWidth={boardWidth}
                  boardHeight={boardHeight}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function BracketBoard({
  slug,
  rounds,
  participants,
  connectors,
  boardWidth,
  boardHeight,
}: {
  slug: string;
  rounds: PositionedBracketRound[];
  participants: Bracket["participants"];
  connectors: BracketConnector[];
  boardWidth: number;
  boardHeight: number;
}) {
  return (
    <div className="relative" style={{ width: boardWidth, height: boardHeight }}>
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
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {rounds.map((round) => (
        <div
          key={round.id}
          className="absolute top-0"
          style={{ left: round.x, width: BOARD_CARD_WIDTH }}
        >
          <RoundHeader round={round} />
        </div>
      ))}

      {rounds.map((round) =>
        round.matches.map((match) => (
          <div
            key={match.id}
            className="absolute"
            style={{
              left: round.x,
              top: match.top,
              width: BOARD_CARD_WIDTH,
            }}
          >
            <BracketMatchCard
              match={match}
              slug={slug}
              participants={participants}
              isFinal={round.roundIndex === rounds.length - 1}
            />
          </div>
        )),
      )}
    </div>
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
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.18em]",
          accent ? "text-[#e8ffa0]" : "text-[#8393b0]",
        )}
      >
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function RoundHeader({ round }: { round: BracketRoundView }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-[#1d232c]/92 px-3.5 py-3 shadow-[0_18px_44px_-36px_rgba(0,0,0,0.9)]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8ea1c6]">
        Ronda {round.roundNumber}
      </p>
      <p className="mt-1 text-[15px] font-semibold text-white">{round.name}</p>
    </div>
  );
}

function BracketMatchCard({
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
      style={{ height: BOARD_CARD_HEIGHT }}
      className={cn(
        "overflow-hidden rounded-[1.45rem] border border-white/8 bg-[linear-gradient(180deg,rgba(39,45,55,0.98)_0%,rgba(29,34,42,0.99)_100%)] p-4 shadow-[0_20px_55px_-44px_rgba(0,0,0,0.8)]",
        isFinal ? "border-[#c7ff2f]/18 bg-[linear-gradient(180deg,rgba(48,61,25,0.92)_0%,rgba(29,34,42,0.99)_100%)]" : "",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8091ae]">
            {match.roundName}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-white/90">Cruce {match.position}</p>
        </div>
        <StatusPip status={match.status} />
      </div>

      <div className="mt-3.5 space-y-2.5">
        {match.slots.map((slot, slotIndex) => (
          <BracketSlotRow
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

function BracketSlotRow({
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
        "flex min-h-[4rem] items-center justify-between gap-3 overflow-hidden rounded-[1rem] border px-3 py-2.5",
        isWinner
          ? "border-[#c7ff2f]/18 bg-[#283617] text-white"
          : winnerKnown
            ? "border-white/6 bg-[#313742] text-white/92"
            : "border-white/8 bg-[#2b313b] text-white",
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn("pr-2 text-[12px] font-semibold leading-[1.05rem]", !slot.participantId && "text-white/78")}
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            overflowWrap: "anywhere",
          }}
          title={label}
        >
          {label}
        </p>
        <p className="mt-1 text-[9.5px] font-medium uppercase tracking-[0.14em] text-[#7f90af]">
          {formatSlotMeta(slot, slotIndex)}
        </p>
      </div>
      <div
        className={cn(
          "min-w-[1.35rem] text-right text-[1.55rem] font-semibold leading-none",
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
  const unit = BOARD_CARD_HEIGHT + BOARD_ROW_GAP;
  return BOARD_CARD_HEIGHT / 2 + ((((2 * position) - 1) * 2 ** roundIndex) - 1) * (unit / 2);
}

function buildConnectorPath(x1: number, y1: number, x2: number, y2: number) {
  const midX = x1 + BOARD_COLUMN_GAP / 2;
  return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
}
