-- Volunteer sign-ups. The table is closed to direct access (RLS on, no policies); the site only calls add_volunteer().
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  municipality text not null check (char_length(municipality) between 2 and 60),
  contribution text not null check (char_length(contribution) between 3 and 1000)
);
create unique index if not exists volunteers_email_key on volunteers (lower(email));
alter table volunteers enable row level security;

-- The same email signing up again updates the earlier row instead of adding a duplicate.
create or replace function add_volunteer(p_name text, p_email text, p_municipality text, p_contribution text) returns void
language sql security definer set search_path = public as
$$ insert into volunteers (name, email, municipality, contribution)
   values (btrim(p_name), btrim(p_email), btrim(p_municipality), btrim(p_contribution))
   on conflict (lower(email)) do update set name = excluded.name, municipality = excluded.municipality, contribution = excluded.contribution $$;
revoke all on function add_volunteer(text, text, text, text) from public;
grant execute on function add_volunteer(text, text, text, text) to anon, authenticated;
