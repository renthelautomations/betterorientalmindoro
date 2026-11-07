-- Mirrors src/data/lgu-contacts.json and src/data/lgu-directory.json. Idempotent.
create table if not exists public.lgu_contacts (
  scope text primary key,           -- 'province' or municipality slug
  email text[] not null default '{}',
  landline text[] not null default '{}',
  mobile text[] not null default '{}',
  website text,
  facebook jsonb not null default '[]',      -- [{label,url}]
  source text not null,
  extra_sources jsonb not null default '[]', -- [{label,url}]
  verified_at date not null
);

create table if not exists public.lgu_offices (
  id text primary key,              -- '<scope>:<position>'
  scope text not null,
  position int not null,
  name text not null,
  category text not null check (category in ('kaligtasan','kalusugan','opisina')),
  head text,
  address text,
  phone text[] not null default '{}',
  email text[] not null default '{}',
  facebook text,
  source text not null,
  verified_at date not null
);

alter table public.lgu_contacts enable row level security;
alter table public.lgu_offices enable row level security;
drop policy if exists "public read lgu_contacts" on public.lgu_contacts;
drop policy if exists "public read lgu_offices" on public.lgu_offices;
create policy "public read lgu_contacts" on public.lgu_contacts for select to anon, authenticated using (true);
create policy "public read lgu_offices" on public.lgu_offices for select to anon, authenticated using (true);
