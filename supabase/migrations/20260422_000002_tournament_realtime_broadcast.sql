-- =========================================================
-- Realtime broadcast por categoria
-- =========================================================
--
-- Se usa Broadcast en lugar de Postgres Changes como canal principal
-- para la web publica porque escala mejor y nos permite emitir un topic
-- por categoria: category:<category_id>.

drop policy if exists "Public tournament broadcasts can be received"
  on realtime.messages;

create policy "Public tournament broadcasts can be received"
on realtime.messages
for select
to anon, authenticated
using (
  realtime.messages.extension in ('broadcast')
  and realtime.topic() like 'category:%'
);

create or replace function public.broadcast_tournament_change()
returns trigger
security definer
language plpgsql
set search_path = public, realtime
as $$
declare
  record_data jsonb;
  category_id uuid;
  stage_id uuid;
  match_id uuid;
begin
  record_data := case
    when TG_OP = 'DELETE' then to_jsonb(OLD)
    else to_jsonb(NEW)
  end;

  case TG_TABLE_NAME
    when 'entries' then
      category_id := (record_data ->> 'category_id')::uuid;

    when 'stages' then
      category_id := (record_data ->> 'category_id')::uuid;

    when 'stage_rounds' then
      stage_id := (record_data ->> 'stage_id')::uuid;

      select s.category_id
      into category_id
      from public.stages s
      where s.id = stage_id;

    when 'groups' then
      stage_id := (record_data ->> 'stage_id')::uuid;

      select s.category_id
      into category_id
      from public.stages s
      where s.id = stage_id;

    when 'matches' then
      category_id := (record_data ->> 'category_id')::uuid;

    when 'match_slots' then
      match_id := (record_data ->> 'match_id')::uuid;

      select m.category_id
      into category_id
      from public.matches m
      where m.id = match_id;

    when 'match_scores' then
      match_id := (record_data ->> 'match_id')::uuid;

      select m.category_id
      into category_id
      from public.matches m
      where m.id = match_id;

    else
      return null;
  end case;

  if category_id is null then
    return null;
  end if;

  perform realtime.broadcast_changes(
    'category:' || category_id::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );

  return null;
end;
$$;

drop trigger if exists trg_broadcast_entries on public.entries;
create trigger trg_broadcast_entries
after insert or update or delete
on public.entries
for each row
execute function public.broadcast_tournament_change();

drop trigger if exists trg_broadcast_stages on public.stages;
create trigger trg_broadcast_stages
after insert or update or delete
on public.stages
for each row
execute function public.broadcast_tournament_change();

drop trigger if exists trg_broadcast_stage_rounds on public.stage_rounds;
create trigger trg_broadcast_stage_rounds
after insert or update or delete
on public.stage_rounds
for each row
execute function public.broadcast_tournament_change();

drop trigger if exists trg_broadcast_groups on public.groups;
create trigger trg_broadcast_groups
after insert or update or delete
on public.groups
for each row
execute function public.broadcast_tournament_change();

drop trigger if exists trg_broadcast_matches on public.matches;
create trigger trg_broadcast_matches
after insert or update or delete
on public.matches
for each row
execute function public.broadcast_tournament_change();

drop trigger if exists trg_broadcast_match_slots on public.match_slots;
create trigger trg_broadcast_match_slots
after insert or update or delete
on public.match_slots
for each row
execute function public.broadcast_tournament_change();

drop trigger if exists trg_broadcast_match_scores on public.match_scores;
create trigger trg_broadcast_match_scores
after insert or update or delete
on public.match_scores
for each row
execute function public.broadcast_tournament_change();
