import type { Route } from "next";
import Link from "next/link";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Bracket } from "@/lib/brackets";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";

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
    matches: round.matchIds
      .map((matchId) => bracket.matches[matchId])
      .filter(Boolean),
    roundIndex,
  }));

  return (
    <Card className="app-panel bg-white/[0.04]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="-mx-2 overflow-x-auto px-2 pb-2">
          <div className="flex min-w-max gap-4">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="w-[284px] shrink-0"
                style={{
                  paddingTop: `${round.roundIndex === 0 ? 0 : round.roundIndex * 22}px`,
                }}
              >
                <div className="mb-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ronda {round.roundNumber}
                  </p>
                  <p className="mt-1 font-semibold text-white">{round.name}</p>
                </div>

                <div
                  className="flex flex-col"
                  style={{
                    gap: `${20 + round.roundIndex * 28}px`,
                  }}
                >
                  {round.matches.map((match) => (
                    <article
                      key={match.id}
                      className="rounded-2xl border border-white/8 bg-[#232830] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Partido {match.position}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">{match.roundName}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(match.status)}>
                          {formatStatusLabel(match.status)}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-2">
                        {match.slots.map((slot, slotIndex) => {
                          const participant =
                            slot.participantId ? bracket.participants[slot.participantId] : null;
                          const isWinner = match.winnerParticipantId === slot.participantId;
                          const label =
                            participant?.name ??
                            slot.label ??
                            (slot.source.type === "bye" ? "BYE" : "Pendiente");
                          const href = slot.participantId
                            ? (`/tournaments/${slug}/participants/${slot.participantId}` as Route)
                            : null;

                          const slotContent = (
                            <div
                              className={cn(
                                "flex items-center justify-between rounded-xl border px-3 py-3",
                                isWinner
                                  ? "border-[#d3ff69]/18 bg-[#202813] text-white"
                                  : "border-transparent bg-white/[0.05] text-white",
                              )}
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">{label}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {slot.source.type === "seed" ? `Seed ${slot.source.seed}` : slot.source.type === "bye" ? "BYE" : `Lado ${slotIndex + 1}`}
                                </div>
                              </div>
                              <div className="ml-4 text-lg font-semibold">
                                {slot.score ?? "-"}
                              </div>
                            </div>
                          );

                          return href ? (
                            <Link key={`${match.id}-${slotIndex}`} href={href} className="block no-underline">
                              {slotContent}
                            </Link>
                          ) : (
                            <div key={`${match.id}-${slotIndex}`}>{slotContent}</div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
