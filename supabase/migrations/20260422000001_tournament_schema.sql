create extension if not exists pgcrypto;

-- =========================================================
-- Tipos de dominio
-- =========================================================

create type tournament_status as enum (
  'draft',
  'published',
  'in_progress',
  'completed',
  'archived'
);

create type category_format as enum (
  'group_only',
  'knockout_only',
  'group_to_knockout'
);

create type entry_type as enum (
  'individual',
  'team'
);

create type entry_status as enum (
  'registered',
  'active',
  'eliminated',
  'withdrawn',
  'disqualified',
  'completed'
);

create type stage_type as enum (
  'group',
  'knockout'
);

create type stage_status as enum (
  'draft',
  'ready',
  'in_progress',
  'completed'
);

create type match_status as enum (
  'pending',
  'ready',
  'scheduled',
  'live',
  'finished',
  'cancelled'
);

create type slot_source_type as enum (
  'manual',
  'entry',
  'group_rank',
  'match_winner',
  'match_loser',
  'bye'
);

create type slot_result as enum (
  'pending',
  'win',
  'loss',
  'draw',
  'walkover',
  'bye'
);

-- =========================================================
-- Utilidades
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Catálogos base
-- =========================================================

create table public.sports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  venue text,
  timezone text not null default 'UTC',
  status tournament_status not null default 'draft',
  is_public boolean not null default false,
  start_at timestamptz,
  end_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at is null or start_at is null or end_at >= start_at)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  slug text not null,
  format category_format not null,
  status tournament_status not null default 'draft',
  gender text,
  age_group text,
  max_entries integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, slug),
  check (max_entries is null or max_entries > 0)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  external_code text unique,
  first_name text,
  last_name text,
  display_name text not null,
  birth_date date,
  country_code char(2),
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  external_code text unique,
  name text not null,
  slug text not null unique,
  short_name text,
  logo_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete restrict,
  member_role text,
  jersey_number text,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  check (left_at is null or left_at >= joined_at),
  unique (team_id, participant_id, joined_at)
);

-- =========================================================
-- Competidores del torneo
-- =========================================================

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  entry_type entry_type not null,
  participant_id uuid references public.participants(id) on delete restrict,
  team_id uuid references public.teams(id) on delete restrict,
  seed integer,
  bib_number text,
  status entry_status not null default 'registered',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (entry_type = 'individual' and participant_id is not null and team_id is null) or
    (entry_type = 'team' and team_id is not null and participant_id is null)
  ),
  check (seed is null or seed > 0)
);

create unique index uq_entries_category_participant
  on public.entries (category_id, participant_id)
  where participant_id is not null;

create unique index uq_entries_category_team
  on public.entries (category_id, team_id)
  where team_id is not null;

-- Congela la composición real de la entry para esa categoría.
-- Para entries individuales puede omitirse o insertar un solo miembro.
create table public.entry_members (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete restrict,
  member_role text,
  jersey_number text,
  is_captain boolean not null default false,
  created_at timestamptz not null default now(),
  unique (entry_id, participant_id)
);

-- =========================================================
-- Estructura competitiva
-- =========================================================

create table public.stages (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  stage_type stage_type not null,
  name text not null,
  sequence_no integer not null,
  status stage_status not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, sequence_no),
  check (sequence_no > 0)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  code text not null,
  name text not null,
  sequence_no integer not null,
  created_at timestamptz not null default now(),
  unique (stage_id, code),
  unique (id, stage_id),
  check (sequence_no > 0)
);

create table public.group_entries (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  group_id uuid not null,
  entry_id uuid not null references public.entries(id) on delete cascade,
  seed_in_group integer,
  created_at timestamptz not null default now(),
  unique (stage_id, entry_id),
  unique (group_id, entry_id),
  foreign key (group_id, stage_id)
    references public.groups(id, stage_id)
    on delete cascade,
  check (seed_in_group is null or seed_in_group > 0)
);

create table public.stage_rounds (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  round_no integer not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (stage_id, round_no),
  unique (id, stage_id),
  check (round_no > 0)
);

-- =========================================================
-- Partidos y resultados
-- =========================================================

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  stage_id uuid not null references public.stages(id) on delete cascade,
  group_id uuid,
  stage_round_id uuid,
  match_no integer,
  bracket_position integer,
  leg_no integer not null default 1,
  status match_status not null default 'pending',
  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  venue text,
  winning_slot_no smallint,
  is_draw boolean not null default false,
  lock_version integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, match_no),
  foreign key (group_id, stage_id)
    references public.groups(id, stage_id)
    on delete restrict,
  foreign key (stage_round_id, stage_id)
    references public.stage_rounds(id, stage_id)
    on delete restrict,
  check (leg_no > 0),
  check (winning_slot_no in (1, 2) or winning_slot_no is null),
  check (finished_at is null or started_at is null or finished_at >= started_at)
);

create table public.match_slots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  slot_no smallint not null,
  entry_id uuid references public.entries(id) on delete restrict,
  source_type slot_source_type not null,
  source_match_id uuid references public.matches(id) on delete restrict,
  source_group_id uuid references public.groups(id) on delete restrict,
  source_rank integer,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, slot_no),
  check (slot_no in (1, 2)),
  check (
    (source_type = 'manual' and source_match_id is null and source_group_id is null and source_rank is null) or
    (source_type = 'entry' and entry_id is not null and source_match_id is null and source_group_id is null and source_rank is null) or
    (source_type = 'group_rank' and source_group_id is not null and source_rank is not null and source_match_id is null) or
    (source_type in ('match_winner', 'match_loser') and source_match_id is not null and source_group_id is null and source_rank is null) or
    (source_type = 'bye' and entry_id is null and source_match_id is null and source_group_id is null and source_rank is null)
  ),
  check (source_rank is null or source_rank > 0)
);

create table public.match_scores (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  slot_no smallint not null,
  score integer not null default 0,
  sets_won smallint,
  ranking_points integer,
  result slot_result not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, slot_no),
  foreign key (match_id, slot_no)
    references public.match_slots(match_id, slot_no)
    on delete cascade,
  check (slot_no in (1, 2))
);

create table public.match_events (
  id bigserial primary key,
  match_id uuid not null references public.matches(id) on delete cascade,
  event_seq bigint not null,
  event_type text not null,
  minute integer,
  slot_no smallint,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (match_id, event_seq),
  check (slot_no in (1, 2) or slot_no is null),
  check (minute is null or minute >= 0)
);

-- =========================================================
-- Índices operativos
-- =========================================================

create index idx_categories_tournament_id
  on public.categories (tournament_id);

create index idx_entries_category_id
  on public.entries (category_id);

create index idx_entry_members_participant_id
  on public.entry_members (participant_id);

create index idx_groups_stage_id
  on public.groups (stage_id);

create index idx_group_entries_group_id
  on public.group_entries (group_id);

create index idx_matches_category_stage_round
  on public.matches (category_id, stage_id, stage_round_id, status);

create index idx_matches_group_id
  on public.matches (group_id);

create index idx_matches_scheduled_at
  on public.matches (scheduled_at);

create index idx_match_slots_entry_id
  on public.match_slots (entry_id);

create index idx_match_slots_source_match_id
  on public.match_slots (source_match_id);

create index idx_match_slots_group_rank
  on public.match_slots (source_group_id, source_rank);

create index idx_match_events_match_created
  on public.match_events (match_id, created_at);

-- =========================================================
-- Triggers de updated_at
-- =========================================================

create trigger trg_tournaments_updated_at
before update on public.tournaments
for each row execute function public.set_updated_at();

create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger trg_participants_updated_at
before update on public.participants
for each row execute function public.set_updated_at();

create trigger trg_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger trg_entries_updated_at
before update on public.entries
for each row execute function public.set_updated_at();

create trigger trg_stages_updated_at
before update on public.stages
for each row execute function public.set_updated_at();

create trigger trg_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create trigger trg_match_slots_updated_at
before update on public.match_slots
for each row execute function public.set_updated_at();

create trigger trg_match_scores_updated_at
before update on public.match_scores
for each row execute function public.set_updated_at();

-- =========================================================
-- Vistas útiles
-- =========================================================

create or replace view public.v_entry_participants as
select
  e.id as entry_id,
  e.category_id,
  e.participant_id
from public.entries e
where e.entry_type = 'individual'
  and e.participant_id is not null
union
select
  em.entry_id,
  e.category_id,
  em.participant_id
from public.entry_members em
join public.entries e on e.id = em.entry_id;

create or replace view public.v_participant_match_history as
select
  vep.participant_id,
  e.id as entry_id,
  t.id as tournament_id,
  t.name as tournament_name,
  c.id as category_id,
  c.name as category_name,
  m.id as match_id,
  s.id as stage_id,
  s.name as stage_name,
  sr.round_no,
  sr.name as round_name,
  g.code as group_code,
  m.status as match_status,
  m.scheduled_at,
  m.started_at,
  m.finished_at,
  ms.slot_no as participant_slot_no,
  opp.entry_id as opponent_entry_id,
  p_score.score as participant_score,
  o_score.score as opponent_score,
  case
    when m.status <> 'finished' then 'pending'
    when m.is_draw then 'draw'
    when m.winning_slot_no = ms.slot_no then 'win'
    else 'loss'
  end as outcome
from public.v_entry_participants vep
join public.entries e on e.id = vep.entry_id
join public.matches m on m.category_id = e.category_id
join public.match_slots ms
  on ms.match_id = m.id
 and ms.entry_id = e.id
left join public.match_slots opp
  on opp.match_id = ms.match_id
 and opp.slot_no <> ms.slot_no
left join public.match_scores p_score
  on p_score.match_id = ms.match_id
 and p_score.slot_no = ms.slot_no
left join public.match_scores o_score
  on o_score.match_id = opp.match_id
 and o_score.slot_no = opp.slot_no
join public.categories c on c.id = e.category_id
join public.tournaments t on t.id = c.tournament_id
join public.stages s on s.id = m.stage_id
left join public.stage_rounds sr on sr.id = m.stage_round_id
left join public.groups g on g.id = m.group_id;
