insert into public.sports (code, name)
values
  ('basketball', 'Basketball'),
  ('football', 'Football'),
  ('padel', 'Padel'),
  ('tennis', 'Tennis'),
  ('volleyball', 'Volleyball')
on conflict (code) do update
set name = excluded.name;
