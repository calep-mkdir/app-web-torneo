export type AdminActionStatus = "idle" | "success" | "error";

export interface AdminActionState {
  status: AdminActionStatus;
  message: string;
  fieldErrors: Record<string, string[]>;
  entityId?: string;
}

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export interface SportOption {
  id: string;
  code: string;
  name: string;
}

export interface TournamentListItem {
  id: string;
  sportId: string;
  sportName: string;
  name: string;
  slug: string;
  status: string;
  isPublic: boolean;
  timezone: string;
  startAt: string | null;
  endAt: string | null;
  categoriesCount: number;
  entrantsCount: number;
  matchesCount: number;
  finishedMatchesCount: number;
}

export interface TournamentCategoryRecord {
  id: string;
  tournamentId: string;
  name: string;
  slug: string;
  format: string;
  status: string;
  gender: string | null;
  ageGroup: string | null;
  maxEntries: number | null;
}

export interface TournamentStageRecord {
  id: string;
  categoryId: string;
  stageType: string;
  name: string;
  sequenceNo: number;
  status: string;
}

export interface TournamentStageRoundRecord {
  id: string;
  stageId: string;
  roundNo: number;
  name: string;
}

export interface TournamentEntryRecord {
  id: string;
  categoryId: string;
  entryType: string;
  seed: number | null;
  status: string;
  participantId: string | null;
  teamId: string | null;
  participantName: string;
}

export interface TournamentMatchRecord {
  id: string;
  categoryId: string;
  stageId: string;
  stageRoundId: string | null;
  groupId: string | null;
  status: string;
  scheduledAt: string | null;
  venue: string | null;
  matchNo: number | null;
  bracketPosition: number | null;
  winningSlotNo: 1 | 2 | null;
  stageName: string;
  roundName: string | null;
  categoryName: string;
  slot1EntryId: string | null;
  slot1Label: string;
  slot1Score: number | null;
  slot2EntryId: string | null;
  slot2Label: string;
  slot2Score: number | null;
}

export interface TournamentAdminDetail {
  tournament: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    venue: string | null;
    timezone: string;
    status: string;
    isPublic: boolean;
    startAt: string | null;
    endAt: string | null;
    sportId: string;
  };
  sports: SportOption[];
  categories: TournamentCategoryRecord[];
  stages: TournamentStageRecord[];
  stageRounds: TournamentStageRoundRecord[];
  entries: TournamentEntryRecord[];
  matches: TournamentMatchRecord[];
  stats: {
    categoriesCount: number;
    participantsCount: number;
    matchesCount: number;
    pendingMatchesCount: number;
    finishedMatchesCount: number;
  };
}
