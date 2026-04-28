import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with .env.local loaded.",
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const tournamentId = randomUUID();
const categoryId = randomUUID();
const stageId = randomUUID();

const roundIds = {
  octavos: randomUUID(),
  cuartos: randomUUID(),
  semifinales: randomUUID(),
  final: randomUUID(),
};

const pairs = [
  {
    seed: 1,
    label: "L. Garcia / M. Ruiz",
    players: ["Luis Garcia", "Mario Ruiz"],
  },
  {
    seed: 2,
    label: "S. Gonzalez / V. Polo",
    players: ["Sergio Gonzalez", "Victor Polo"],
  },
  {
    seed: 3,
    label: "R. Alonso / G. Blanco",
    players: ["Ruben Alonso", "Gonzalo Blanco"],
  },
  {
    seed: 4,
    label: "A. Ortega / I. Soler",
    players: ["Adrian Ortega", "Ivan Soler"],
  },
  {
    seed: 5,
    label: "J. Morales / F. Romero",
    players: ["Jorge Morales", "Fabio Romero"],
  },
  {
    seed: 6,
    label: "A. Munoz / P. Gonzalez",
    players: ["Alberto Munoz", "Pablo Gonzalez"],
  },
  {
    seed: 7,
    label: "M. Castilla / J. Calvo",
    players: ["Marcos Castilla", "Javier Calvo"],
  },
  {
    seed: 8,
    label: "D. Fernandez / P. Gil",
    players: ["Diego Fernandez", "Pablo Gil"],
  },
  {
    seed: 9,
    label: "J. Perez / A. Sanchez",
    players: ["Julian Perez", "Alvaro Sanchez"],
  },
  {
    seed: 10,
    label: "R. Martin / S. Lopez",
    players: ["Raul Martin", "Samuel Lopez"],
  },
  {
    seed: 11,
    label: "T. Delgado / J. Ramirez",
    players: ["Tomas Delgado", "Javier Ramirez"],
  },
  {
    seed: 12,
    label: "P. Herrera / L. Medina",
    players: ["Pablo Herrera", "Lucas Medina"],
  },
  {
    seed: 13,
    label: "M. Navarro / C. Diaz",
    players: ["Mateo Navarro", "Carlos Diaz"],
  },
  {
    seed: 14,
    label: "B. Iglesias / N. Flores",
    players: ["Bruno Iglesias", "Nicolas Flores"],
  },
  {
    seed: 15,
    label: "A. Torres / D. Vega",
    players: ["Alex Torres", "David Vega"],
  },
  {
    seed: 16,
    label: "E. Jimenez / H. Cruz",
    players: ["Elias Jimenez", "Hector Cruz"],
  },
];

const octavos = [
  { matchNo: 1, bracketPosition: 1, venue: "Pista 1", time: "2026-04-15T10:00:00+02:00", slot1Seed: 1, slot2Seed: 9, winnerSeed: 1, score: [6, 2] },
  { matchNo: 2, bracketPosition: 2, venue: "Pista 2", time: "2026-04-15T10:00:00+02:00", slot1Seed: 8, slot2Seed: 10, winnerSeed: 8, score: [6, 3] },
  { matchNo: 3, bracketPosition: 3, venue: "Pista 3", time: "2026-04-15T12:00:00+02:00", slot1Seed: 4, slot2Seed: 13, winnerSeed: 4, score: [6, 1] },
  { matchNo: 4, bracketPosition: 4, venue: "Pista 4", time: "2026-04-15T12:00:00+02:00", slot1Seed: 5, slot2Seed: 12, winnerSeed: 5, score: [6, 3] },
  { matchNo: 5, bracketPosition: 5, venue: "Pista 1", time: "2026-04-15T16:00:00+02:00", slot1Seed: 2, slot2Seed: 15, winnerSeed: 2, score: [6, 3] },
  { matchNo: 6, bracketPosition: 6, venue: "Pista 2", time: "2026-04-15T16:00:00+02:00", slot1Seed: 7, slot2Seed: 16, winnerSeed: 7, score: [6, 2] },
  { matchNo: 7, bracketPosition: 7, venue: "Pista 3", time: "2026-04-15T18:00:00+02:00", slot1Seed: 3, slot2Seed: 14, winnerSeed: 3, score: [6, 2] },
  { matchNo: 8, bracketPosition: 8, venue: "Pista 4", time: "2026-04-15T18:00:00+02:00", slot1Seed: 6, slot2Seed: 11, winnerSeed: 6, score: [6, 2] },
];

const cuartos = [
  { matchNo: 9, bracketPosition: 1, venue: "Pista Central", time: "2026-04-16T17:00:00+02:00", source1: 1, source2: 2, winnerSeed: 1, score: [6, 3] },
  { matchNo: 10, bracketPosition: 2, venue: "Pista Central", time: "2026-04-16T19:00:00+02:00", source1: 3, source2: 4, winnerSeed: 4, score: [7, 5] },
  { matchNo: 11, bracketPosition: 3, venue: "Pista 2", time: "2026-04-16T17:00:00+02:00", source1: 5, source2: 6, winnerSeed: 2, score: [6, 1] },
  { matchNo: 12, bracketPosition: 4, venue: "Pista 2", time: "2026-04-16T19:00:00+02:00", source1: 7, source2: 8, winnerSeed: 3, score: [6, 4] },
];

const semifinales = [
  { matchNo: 13, bracketPosition: 1, venue: "Pista Central", time: "2026-04-21T18:00:00+02:00", source1: 9, source2: 10, winnerSeed: 1, score: [6, 4] },
  { matchNo: 14, bracketPosition: 2, venue: "Pista Central", time: "2026-04-21T20:00:00+02:00", source1: 11, source2: 12, winnerSeed: 2, score: [7, 5] },
];

const finalRound = [
  { matchNo: 15, bracketPosition: 1, venue: "Pista Central", time: "2026-04-22T20:00:00+02:00", source1: 13, source2: 14, winnerSeed: 1, score: [6, 4] },
];

await main();

async function main() {
  console.log("Resetting tournament data...");

  await run(supabase.from("tournaments").delete().not("id", "is", null), "delete tournaments");
  await run(supabase.from("teams").delete().not("id", "is", null), "delete teams");
  await run(supabase.from("participants").delete().not("id", "is", null), "delete participants");

  const sportId = await ensurePadelSport();
  const seed = buildSeedData(sportId);

  console.log("Seeding demo tournament...");

  await run(supabase.from("tournaments").insert(seed.tournament), "insert tournament");
  await run(supabase.from("categories").insert(seed.category), "insert category");
  await run(supabase.from("participants").insert(seed.participants), "insert participants");
  await run(supabase.from("teams").insert(seed.teams), "insert teams");
  await run(supabase.from("team_members").insert(seed.teamMembers), "insert team members");
  await run(supabase.from("entries").insert(seed.entries), "insert entries");
  await run(supabase.from("entry_members").insert(seed.entryMembers), "insert entry members");
  await run(supabase.from("stages").insert(seed.stage), "insert stage");
  await run(supabase.from("stage_rounds").insert(seed.stageRounds), "insert stage rounds");
  await run(supabase.from("matches").insert(seed.matches), "insert matches");
  await run(supabase.from("match_slots").insert(seed.matchSlots), "insert match slots");
  await run(supabase.from("match_scores").insert(seed.matchScores), "insert match scores");

  const summary = await fetchSummary();

  console.log("Demo seed complete.");
  console.log(JSON.stringify(summary, null, 2));
}

async function ensurePadelSport() {
  const { data } = await run(
    supabase
      .from("sports")
      .upsert(
        {
          code: "padel",
          name: "Padel",
        },
        {
          onConflict: "code",
        },
      )
      .select("id")
      .single(),
    "ensure padel sport",
  );

  return data.id;
}

function buildSeedData(sportId) {
  const participantRows = [];
  const teamRows = [];
  const teamMemberRows = [];
  const entryRows = [];
  const entryMemberRows = [];
  const teamIdBySeed = new Map();
  const entryIdBySeed = new Map();

  for (const pair of pairs) {
    const teamId = randomUUID();
    const entryId = randomUUID();
    const teamSlug = slugify(`${pair.seed}-${pair.label}`);

    teamIdBySeed.set(pair.seed, teamId);
    entryIdBySeed.set(pair.seed, entryId);

    teamRows.push({
      id: teamId,
      name: pair.label,
      slug: teamSlug,
      short_name: pair.label,
      metadata: {
        seed: pair.seed,
      },
    });

    entryRows.push({
      id: entryId,
      category_id: categoryId,
      entry_type: "team",
      team_id: teamId,
      seed: pair.seed,
      status: "completed",
      metadata: {
        seed: pair.seed,
      },
    });

    for (const [index, playerName] of pair.players.entries()) {
      const participantId = randomUUID();

      participantRows.push({
        id: participantId,
        display_name: playerName,
        country_code: "ES",
      });

      teamMemberRows.push({
        id: randomUUID(),
        team_id: teamId,
        participant_id: participantId,
        member_role: index === 0 ? "left" : "right",
      });

      entryMemberRows.push({
        id: randomUUID(),
        entry_id: entryId,
        participant_id: participantId,
        member_role: index === 0 ? "left" : "right",
        is_captain: index === 0,
      });
    }
  }

  const matches = [];
  const matchSlots = [];
  const matchScores = [];
  const matchIdByMatchNo = new Map();

  for (const match of [...octavos, ...cuartos, ...semifinales, ...finalRound]) {
    matchIdByMatchNo.set(match.matchNo, randomUUID());
  }

  for (const match of octavos) {
    const matchId = matchIdByMatchNo.get(match.matchNo);
    const slot1EntryId = entryIdBySeed.get(match.slot1Seed);
    const slot2EntryId = entryIdBySeed.get(match.slot2Seed);
    const winnerSlotNo = match.winnerSeed === match.slot1Seed ? 1 : 2;

    matches.push({
      id: matchId,
      category_id: categoryId,
      stage_id: stageId,
      stage_round_id: roundIds.octavos,
      match_no: match.matchNo,
      bracket_position: match.bracketPosition,
      status: "finished",
      scheduled_at: match.time,
      started_at: match.time,
      finished_at: addMinutes(match.time, 80),
      venue: match.venue,
      winning_slot_no: winnerSlotNo,
      is_draw: false,
      metadata: {},
    });

    matchSlots.push(
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 1,
        entry_id: slot1EntryId,
        source_type: "entry",
        source_match_id: null,
        source_group_id: null,
        source_rank: null,
        label: null,
      },
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 2,
        entry_id: slot2EntryId,
        source_type: "entry",
        source_match_id: null,
        source_group_id: null,
        source_rank: null,
        label: null,
      },
    );

    matchScores.push(
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 1,
        score: match.score[0],
        result: winnerSlotNo === 1 ? "win" : "loss",
      },
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 2,
        score: match.score[1],
        result: winnerSlotNo === 2 ? "win" : "loss",
      },
    );
  }

  for (const match of [...cuartos, ...semifinales, ...finalRound]) {
    const matchId = matchIdByMatchNo.get(match.matchNo);
    const sourceMatch1Id = matchIdByMatchNo.get(match.source1);
    const sourceMatch2Id = matchIdByMatchNo.get(match.source2);
    const sourceMatch1 = findMatchByNo(match.source1);
    const sourceMatch2 = findMatchByNo(match.source2);
    const slot1EntryId = entryIdBySeed.get(sourceMatch1.winnerSeed);
    const slot2EntryId = entryIdBySeed.get(sourceMatch2.winnerSeed);
    const winnerSlotNo = match.winnerSeed === sourceMatch1.winnerSeed ? 1 : 2;
    const stageRoundId =
      match.matchNo <= 12
        ? roundIds.cuartos
        : match.matchNo <= 14
          ? roundIds.semifinales
          : roundIds.final;

    matches.push({
      id: matchId,
      category_id: categoryId,
      stage_id: stageId,
      stage_round_id: stageRoundId,
      match_no: match.matchNo,
      bracket_position: match.bracketPosition,
      status: "finished",
      scheduled_at: match.time,
      started_at: match.time,
      finished_at: addMinutes(match.time, 95),
      venue: match.venue,
      winning_slot_no: winnerSlotNo,
      is_draw: false,
      metadata: {},
    });

    matchSlots.push(
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 1,
        entry_id: slot1EntryId,
        source_type: "match_winner",
        source_match_id: sourceMatch1Id,
        source_group_id: null,
        source_rank: null,
        label: null,
      },
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 2,
        entry_id: slot2EntryId,
        source_type: "match_winner",
        source_match_id: sourceMatch2Id,
        source_group_id: null,
        source_rank: null,
        label: null,
      },
    );

    matchScores.push(
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 1,
        score: match.score[0],
        result: winnerSlotNo === 1 ? "win" : "loss",
      },
      {
        id: randomUUID(),
        match_id: matchId,
        slot_no: 2,
        score: match.score[1],
        result: winnerSlotNo === 2 ? "win" : "loss",
      },
    );
  }

  return {
    tournament: {
      id: tournamentId,
      sport_id: sportId,
      name: "Open Padel Madrid 2026",
      slug: "open-padel-madrid-2026",
      description: "Torneo demo completo con cuadro principal y resultados finales.",
      venue: "Madrid, Espana",
      timezone: "Europe/Madrid",
      status: "completed",
      is_public: true,
      start_at: "2026-04-15T09:00:00+02:00",
      end_at: "2026-04-22T22:30:00+02:00",
      metadata: {
        demo: true,
        surface: "outdoor",
      },
    },
    category: {
      id: categoryId,
      tournament_id: tournamentId,
      name: "Masculino",
      slug: "masculino",
      format: "knockout_only",
      status: "completed",
      gender: "masculino",
      age_group: "absoluto",
      max_entries: 16,
      metadata: {
        demo: true,
      },
    },
    participants: participantRows,
    teams: teamRows,
    teamMembers: teamMemberRows,
    entries: entryRows,
    entryMembers: entryMemberRows,
    stage: {
      id: stageId,
      category_id: categoryId,
      stage_type: "knockout",
      name: "Cuadro principal",
      sequence_no: 1,
      status: "completed",
      config: {
        size: 16,
      },
    },
    stageRounds: [
      { id: roundIds.octavos, stage_id: stageId, round_no: 1, name: "Octavos" },
      { id: roundIds.cuartos, stage_id: stageId, round_no: 2, name: "Cuartos" },
      { id: roundIds.semifinales, stage_id: stageId, round_no: 3, name: "Semifinales" },
      { id: roundIds.final, stage_id: stageId, round_no: 4, name: "Final" },
    ],
    matches,
    matchSlots,
    matchScores,
  };
}

async function fetchSummary() {
  const [
    tournamentsResult,
    categoriesResult,
    participantsResult,
    teamsResult,
    entriesResult,
    matchesResult,
  ] = await Promise.all([
    supabase.from("tournaments").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("participants").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("entries").select("id", { count: "exact", head: true }),
    supabase.from("matches").select("id", { count: "exact", head: true }),
  ]);

  if (
    tournamentsResult.error ||
    categoriesResult.error ||
    participantsResult.error ||
    teamsResult.error ||
    entriesResult.error ||
    matchesResult.error
  ) {
    throw new Error("Unable to fetch seed summary.");
  }

  return {
    tournamentId,
    categoryId,
    counts: {
      tournaments: tournamentsResult.count ?? 0,
      categories: categoriesResult.count ?? 0,
      participants: participantsResult.count ?? 0,
      teams: teamsResult.count ?? 0,
      entries: entriesResult.count ?? 0,
      matches: matchesResult.count ?? 0,
    },
  };
}

async function run(query, label) {
  const result = await query;

  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  return result;
}

function findMatchByNo(matchNo) {
  return [...octavos, ...cuartos, ...semifinales, ...finalRound].find((match) => match.matchNo === matchNo);
}

function addMinutes(isoDateTime, minutesToAdd) {
  const date = new Date(isoDateTime);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  return date.toISOString();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
