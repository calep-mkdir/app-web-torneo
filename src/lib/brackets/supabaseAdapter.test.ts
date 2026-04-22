import { describe, expect, it } from "vitest";

import { advanceWinnerFromSnapshot } from "./supabaseAdapter";

describe("advanceWinnerFromSnapshot", () => {
  it("propagates the winner to the next knockout match", () => {
    const result = advanceWinnerFromSnapshot(
      {
        category: {
          id: "category-1",
          format: "knockout_only",
          name: "Senior",
        },
        stage: {
          id: "stage-1",
          category_id: "category-1",
          stage_type: "knockout",
          sequence_no: 1,
          name: "Cuadro final",
          config: {},
        },
        stageRounds: [
          { id: "round-1", stage_id: "stage-1", round_no: 1, name: "Semifinal" },
          { id: "round-2", stage_id: "stage-1", round_no: 2, name: "Final" },
        ],
        groups: [],
        entries: [
          { id: "entry-1", category_id: "category-1", entry_type: "individual", seed: 1, participant: { display_name: "A" } },
          { id: "entry-2", category_id: "category-1", entry_type: "individual", seed: 4, participant: { display_name: "B" } },
          { id: "entry-3", category_id: "category-1", entry_type: "individual", seed: 2, participant: { display_name: "C" } },
          { id: "entry-4", category_id: "category-1", entry_type: "individual", seed: 3, participant: { display_name: "D" } },
        ],
        matches: [
          {
            id: "match-1",
            category_id: "category-1",
            stage_id: "stage-1",
            stage_round_id: "round-1",
            status: "ready",
            bracket_position: 1,
          },
          {
            id: "match-2",
            category_id: "category-1",
            stage_id: "stage-1",
            stage_round_id: "round-1",
            status: "ready",
            bracket_position: 2,
          },
          {
            id: "match-3",
            category_id: "category-1",
            stage_id: "stage-1",
            stage_round_id: "round-2",
            status: "pending",
            bracket_position: 1,
          },
        ],
        matchSlots: [
          { id: "slot-1", match_id: "match-1", slot_no: 1, entry_id: "entry-1", source_type: "entry", label: null },
          { id: "slot-2", match_id: "match-1", slot_no: 2, entry_id: "entry-2", source_type: "entry", label: null },
          { id: "slot-3", match_id: "match-2", slot_no: 1, entry_id: "entry-3", source_type: "entry", label: null },
          { id: "slot-4", match_id: "match-2", slot_no: 2, entry_id: "entry-4", source_type: "entry", label: null },
          { id: "slot-5", match_id: "match-3", slot_no: 1, entry_id: null, source_type: "match_winner", source_match_id: "match-1", label: null },
          { id: "slot-6", match_id: "match-3", slot_no: 2, entry_id: null, source_type: "match_winner", source_match_id: "match-2", label: null },
        ],
        matchScores: [],
      },
      {
        matchId: "match-1",
        scores: {
          slot1: 21,
          slot2: 15,
        },
      },
    );

    expect(result.next.matches["match-1"].winnerParticipantId).toBe("entry-1");
    expect(result.next.matches["match-3"].slots[0].participantId).toBe("entry-1");
    expect(result.patch.matches.some((match) => match.id === "match-1")).toBe(true);
    expect(
      result.patch.slots.some(
        (slot) => slot.match_id === "match-3" && slot.slot_no === 1 && slot.entry_id === "entry-1",
      ),
    ).toBe(true);
  });
});
