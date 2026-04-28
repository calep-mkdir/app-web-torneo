import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { CalendarDays, ChevronRight, Clock3, MapPin, Trophy } from "lucide-react";

import { Badge } from "@/components/ui";
import { BracketView, PadelRacketHero } from "@/components/public";
import { formatDateRange, formatDateTime } from "@/components/public/date-utils";
import { buildEntryDirectory, buildMatchViewModels, buildPublicBracket } from "@/features/public/mappers";
import { getPublicHomePageData, getPublicTournamentPageData } from "@/features/public/queries";
import type { PublicMatchViewModel, PublicTournamentListItem } from "@/features/public/types";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";

export const metadata: Metadata = {
  title: "Padel Tournaments",
  description: "Torneos, cuadros, partidos y resultados de padel.",
};

export default async function PublicHomePage() {
  const data = await getPublicHomePageData();
  const featuredTournament = data.featuredTournaments[0] ?? data.tournaments[0] ?? null;

  let featuredSnapshot = null;
  let featuredCategoryName: string | null = null;

  if (featuredTournament) {
    const featuredTournamentPage = await getPublicTournamentPageData(featuredTournament.slug);
    featuredSnapshot = featuredTournamentPage.initialSnapshot;
    featuredCategoryName = featuredTournamentPage.categories[0]?.name ?? null;
  }

  const bracket = featuredSnapshot ? buildPublicBracket(featuredSnapshot) : null;
  const allMatches = featuredSnapshot ? buildMatchViewModels(featuredSnapshot) : [];
  const upcomingMatches = allMatches
    .filter((match) => match.status !== "finished" && match.status !== "cancelled")
    .slice(0, 4);
  const finishedMatches = allMatches.filter((match) => match.status === "finished");
  const highlightedEntries = featuredSnapshot
    ? buildEntryDirectory(featuredSnapshot)
        .slice()
        .sort((left, right) => {
          if (right.wins !== left.wins) {
            return right.wins - left.wins;
          }

          if (left.losses !== right.losses) {
            return left.losses - right.losses;
          }

          return left.name.localeCompare(right.name, "es");
        })
        .slice(0, 4)
    : [];
  const championMatch = getChampionMatch(finishedMatches);
  const championLabel = championMatch ? getWinnerLabel(championMatch) : null;
  const countdown = featuredTournament?.startAt ? buildCountdown(featuredTournament.startAt) : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="app-panel rounded-[1.7rem] p-4">
          <div className="flex items-center gap-3 px-2 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d6ff72]/20 bg-[#c7ff2f]/10 text-[#c7ff2f]">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c7ff2f]">Torneos</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.tournaments.slice(0, 4).map((tournament, index) => (
              <SidebarTournamentCard
                key={tournament.id}
                tournament={tournament}
                thumbnailTone={index}
              />
            ))}
          </div>

          <Link href={"/tournaments" as Route} className="app-cta-secondary mt-4 w-full">
            Ver todos los torneos
          </Link>
        </section>

        <section className="app-panel app-panel-strong relative overflow-hidden rounded-[1.7rem] p-5">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(199,255,47,0.14),transparent_60%)]" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Vive el mejor</p>
            <h2 className="mt-2 text-5xl font-semibold uppercase leading-none text-[#c7ff2f]">Padel</h2>
            <p className="mt-3 max-w-[14rem] text-sm leading-6 text-slate-300">
              Compite. Disfruta. Superate.
            </p>
          </div>

          <div className="relative mt-4 h-[250px] overflow-hidden rounded-[1.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.2)_0%,rgba(9,14,24,0.75)_80%)]">
            <div className="absolute inset-0 scale-[0.88]">
              <PadelRacketHero />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent_0%,rgba(9,14,24,0.92)_100%)]" />
          </div>

          <Link href={"/organiza" as Route} className="app-cta-secondary mt-4 w-full">
            Sobre el circuito
          </Link>
        </section>
      </aside>

      <div className="space-y-4">
        {featuredTournament ? (
          <section className="app-panel app-panel-strong relative overflow-hidden rounded-[1.8rem]">
            <CourtBackdrop />
            <div className="relative grid gap-6 px-6 py-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c7ff2f]">
                    Torneo destacado
                  </p>
                  <h1 className="mt-4 max-w-xl text-5xl font-semibold uppercase tracking-tight text-white sm:text-6xl">
                    {featuredTournament.name}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-5 text-sm font-semibold uppercase tracking-[0.08em] text-white/85">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#c7ff2f]" />
                    {formatDateRange(
                      featuredTournament.startAt,
                      featuredTournament.endAt,
                      "es-ES",
                      featuredTournament.timezone,
                    )}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#c7ff2f]" />
                    {featuredTournament.venue ?? "Sede pendiente"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a href="#cuadros" className="app-cta-primary">
                    Ver cuadro
                  </a>
                  <a href="#partidos" className="app-cta-secondary">
                    Ver partidos
                  </a>
                  <Link
                    href={`/tournaments/${featuredTournament.slug}` as Route}
                    className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-white no-underline transition hover:text-[#c7ff2f]"
                  >
                    Abrir ficha
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="flex items-end justify-end">
                <div className="w-full max-w-[310px] rounded-[1.5rem] border border-white/10 bg-[#111823]/90 p-5 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    {countdown ? "El torneo comienza en" : "Estado del torneo"}
                  </p>
                  {countdown ? (
                    <div className="mt-5 grid grid-cols-4 gap-3">
                      {countdown.map((item) => (
                        <div key={item.label} className="text-center">
                          <div className="text-4xl font-semibold text-[#c7ff2f]">{item.value}</div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5">
                      <Badge variant={getStatusBadgeVariant(featuredTournament.status)}>
                        {formatStatusLabel(featuredTournament.status)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="app-panel app-panel-strong rounded-[1.8rem] px-6 py-14 text-center">
            <h1 className="text-4xl font-semibold text-white">Todavia no hay torneos publicados</h1>
            <p className="mt-3 text-sm text-slate-300">Crea el primero desde el panel.</p>
            <Link href={"/admin" as Route} className="app-cta-primary mt-6">
              Crear torneo
            </Link>
          </section>
        )}

        <section id="cuadros" className="space-y-4">
          {featuredTournament && bracket ? (
            <BracketView
              slug={featuredTournament.slug}
              bracket={bracket}
              title={featuredCategoryName ? `Cuadro ${featuredCategoryName}` : "Cuadro principal"}
              description="Octavos, cuartos, semifinales y final."
            />
          ) : (
            <section className="app-panel rounded-[1.8rem] px-6 py-8 text-center text-slate-300">
              El torneo destacado todavia no tiene cuadro disponible.
            </section>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr_1fr]">
          <div id="partidos" className="app-panel rounded-[1.8rem] p-5">
            <SectionHeader title="Proximos partidos" href={featuredTournament ? (`/tournaments/${featuredTournament.slug}` as Route) : undefined} />
            <div className="mt-4 space-y-3">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <UpcomingMatchRow
                    key={match.id}
                    match={match}
                    timezone={featuredTournament?.timezone}
                  />
                ))
              ) : (
                <EmptyCopy text="No hay partidos pendientes para mostrar." />
              )}
            </div>
          </div>

          <div id="jugadores" className="app-panel rounded-[1.8rem] p-5">
            <SectionHeader title="Parejas destacadas" href={featuredTournament ? (`/tournaments/${featuredTournament.slug}` as Route) : undefined} />
            <div className="mt-4 space-y-3">
              {highlightedEntries.length > 0 ? (
                highlightedEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0d131d] text-sm font-semibold text-[#c7ff2f]">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{entry.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {entry.wins} victorias · {entry.losses} derrotas
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white/80">
                      {entry.matchesPlayed} pj
                    </div>
                  </div>
                ))
              ) : (
                <EmptyCopy text="No hay parejas destacadas todavia." />
              )}
            </div>

            <Link
              href={featuredTournament ? (`/tournaments/${featuredTournament.slug}` as Route) : ("/tournaments" as Route)}
              className="app-cta-secondary mt-4 w-full"
            >
              Ver ranking completo
            </Link>
          </div>

          <div id="ranking" className="app-panel rounded-[1.8rem] p-5">
            <SectionHeader title="Ultimos ganadores" />
            {championMatch && championLabel ? (
              <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(59,130,246,0.16)_0%,rgba(17,24,39,0.92)_100%)]">
                <div className="relative h-[220px] overflow-hidden border-b border-white/8">
                  <CourtBackdrop compact />
                  <div className="absolute left-4 top-4">
                    <span className="inline-flex rounded-full bg-[#c7ff2f] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0a0f14]">
                      Campeones
                    </span>
                  </div>
                </div>
                <div className="space-y-2 px-5 py-5">
                  <h2 className="text-3xl font-semibold text-white">{championLabel}</h2>
                  <p className="text-sm uppercase tracking-[0.08em] text-slate-400">
                    {featuredTournament?.name ?? "Torneo destacado"}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c7ff2f]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyCopy text="Todavia no hay campeones registrados." />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SidebarTournamentCard({
  tournament,
  thumbnailTone,
}: {
  tournament: PublicTournamentListItem;
  thumbnailTone: number;
}) {
  return (
    <Link
      href={`/tournaments/${tournament.slug}` as Route}
      className="flex items-center gap-3 rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-3 no-underline transition hover:bg-white/[0.06]"
    >
      <CourtThumbnail tone={thumbnailTone} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">{tournament.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
          {formatDateRange(tournament.startAt, tournament.endAt, "es-ES", tournament.timezone)}
        </p>
      </div>
    </Link>
  );
}

function CourtThumbnail({ tone }: { tone: number }) {
  const tones = [
    "from-[#081224] via-[#0f2d61] to-[#0a1526]",
    "from-[#0b1424] via-[#133a66] to-[#0b1018]",
    "from-[#1c1308] via-[#6a3e11] to-[#18100b]",
    "from-[#0a1520] via-[#16445f] to-[#0b1018]",
  ];

  return (
    <div
      className={`relative h-16 w-24 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${tones[tone % tones.length]}`}
    >
      <div className="absolute inset-x-2 bottom-2 top-2 rounded-lg border border-white/14" />
      <div className="absolute inset-x-[22%] bottom-2 top-2 border-x border-white/12" />
      <div className="absolute inset-y-[30%] left-2 right-2 border-y border-white/12" />
      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
    </div>
  );
}

function CourtBackdrop({ compact = false }: { compact?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_54%),linear-gradient(180deg,rgba(9,13,20,0.26)_0%,rgba(6,10,16,0.78)_100%)]" />
      <div className="absolute inset-x-[6%] bottom-[10%] top-[12%] rounded-[1.5rem] border border-white/8" />
      <div className="absolute inset-x-[27%] bottom-[10%] top-[12%] border-x border-white/8" />
      <div className="absolute bottom-[35%] left-[6%] right-[6%] border-t border-white/8" />
      <div className="absolute bottom-[23%] left-[6%] right-[6%] border-t border-white/8" />
      <div className="absolute bottom-[10%] left-[6%] right-[6%] border-t border-white/8" />
      <div className="absolute left-[10%] top-[14%] h-16 w-16 rounded-full bg-white/60 blur-[38px]" />
      <div className="absolute right-[16%] top-[12%] h-16 w-16 rounded-full bg-white/55 blur-[38px]" />
      {!compact ? (
        <div className="absolute inset-y-0 right-0 w-[45%] bg-[linear-gradient(90deg,transparent_0%,rgba(6,10,16,0.22)_20%,rgba(6,10,16,0.72)_100%)]" />
      ) : null}
    </div>
  );
}

function SectionHeader({
  title,
  href,
}: {
  title: string;
  href?: Route;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-[1.9rem] font-semibold uppercase tracking-tight text-white">{title}</h2>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-[#c7ff2f]" />
      </div>
      {href ? (
        <Link href={href} className="text-sm font-semibold uppercase tracking-[0.08em] text-[#c7ff2f] no-underline">
          Ver todos
        </Link>
      ) : null}
    </div>
  );
}

function UpcomingMatchRow({
  match,
  timezone,
}: {
  match: PublicMatchViewModel;
  timezone?: string;
}) {
  return (
    <div className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="border-r border-white/8 pr-3 text-center">
        <div className="text-3xl font-semibold text-white">
          {match.scheduledAt ? new Date(match.scheduledAt).getDate().toString().padStart(2, "0") : "--"}
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {match.scheduledAt
            ? new Date(match.scheduledAt).toLocaleString("es-ES", { month: "short" }).replace(".", "")
            : "TBD"}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          {formatDateTime(match.scheduledAt, "es-ES", timezone).split(", ").at(-1) ?? "--:--"}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {match.roundName ?? match.stageName}
          </p>
          <Badge variant={getStatusBadgeVariant(match.status)}>{formatStatusLabel(match.status)}</Badge>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-white">{match.slot1Label}</p>
          <p className="font-semibold text-white/78">{match.slot2Label}</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
          <Clock3 className="h-3.5 w-3.5 text-[#c7ff2f]" />
          {match.venue ?? "Pista pendiente"}
        </div>
      </div>
    </div>
  );
}

function EmptyCopy({ text }: { text: string }) {
  return (
    <div className="rounded-[1.3rem] border border-dashed border-white/12 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function getChampionMatch(matches: PublicMatchViewModel[]) {
  return matches
    .slice()
    .sort((left, right) => {
      const leftRound = left.roundNo ?? 0;
      const rightRound = right.roundNo ?? 0;
      if (rightRound !== leftRound) {
        return rightRound - leftRound;
      }

      const leftDate = left.scheduledAt ? Date.parse(left.scheduledAt) : 0;
      const rightDate = right.scheduledAt ? Date.parse(right.scheduledAt) : 0;
      return rightDate - leftDate;
    })[0] ?? null;
}

function getWinnerLabel(match: PublicMatchViewModel) {
  if (match.winningSlotNo === 1) {
    return match.slot1Label;
  }

  if (match.winningSlotNo === 2) {
    return match.slot2Label;
  }

  return null;
}

function buildCountdown(startAt: string) {
  const target = Date.parse(startAt);
  if (Number.isNaN(target)) {
    return null;
  }

  const diff = Math.max(target - Date.now(), 0);
  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((diff / 1000) % 60);

  return [
    { label: "Dias", value: String(days).padStart(2, "0") },
    { label: "Horas", value: String(hours).padStart(2, "0") },
    { label: "Min", value: String(minutes).padStart(2, "0") },
    { label: "Seg", value: String(seconds).padStart(2, "0") },
  ];
}
