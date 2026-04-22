import type { ParticipantPath } from "@/lib/brackets";
import type { TournamentLiveSnapshot } from "@/features/live";

export interface PublicTournamentListItem {
  id: string;
  slug: string;
  name: string;
  sportName: string;
  venue: string | null;
  timezone: string;
  status: string;
  startAt: string | null;
  endAt: string | null;
  categoriesCount: number;
  participantsCount: number;
  liveMatchesCount: number;
}

export interface PublicSiteStats {
  tournamentsCount: number;
  categoriesCount: number;
  participantsCount: number;
  liveMatchesCount: number;
  sportsCount: number;
}

export interface PublicSportSummary {
  name: string;
  tournamentsCount: number;
  participantsCount: number;
  liveMatchesCount: number;
  featuredTournamentSlug: string | null;
  featuredTournamentName: string | null;
}

export interface PublicTournamentCategory {
  id: string;
  name: string;
  slug: string;
  format: string;
  status: string;
}

export interface PublicTournamentPageData {
  tournament: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    venue: string | null;
    timezone: string;
    status: string;
    startAt: string | null;
    endAt: string | null;
    sportName: string;
  };
  categories: PublicTournamentCategory[];
  initialCategoryId: string | null;
  initialSnapshot: TournamentLiveSnapshot | null;
}

export interface PublicMatchViewModel {
  id: string;
  categoryId: string;
  categoryName: string;
  stageId: string;
  stageName: string;
  stageType: string;
  roundName: string | null;
  roundNo: number | null;
  status: string;
  scheduledAt: string | null;
  venue: string | null;
  matchNo: number | null;
  bracketPosition: number | null;
  slot1EntryId: string | null;
  slot1Label: string;
  slot1Score: number | null;
  slot2EntryId: string | null;
  slot2Label: string;
  slot2Score: number | null;
  winningSlotNo: 1 | 2 | null;
  outcomeForEntry?: "win" | "loss" | "draw" | "pending";
}

export interface PublicEntryDirectoryItem {
  id: string;
  name: string;
  seed: number | null;
  status: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
}

export interface PublicParticipantPageData {
  tournament: PublicTournamentPageData["tournament"];
  category: PublicTournamentCategory;
  entry: {
    id: string;
    name: string;
    seed: number | null;
    status: string;
  };
  history: PublicMatchViewModel[];
  knockoutPath: ParticipantPath | null;
}
