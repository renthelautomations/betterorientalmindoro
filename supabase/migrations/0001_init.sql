-- Not applied yet. Mirrors src/lib/hotlines.ts and src/lib/projects.ts.
create table public.hotlines (
  id text primary key,
  scope text not null,              -- 'province' or municipality slug
  category text not null check (category in ('emergency','medical','government','utility')),
  name text not null,
  number text not null,
  source text not null,
  verified_at date not null,
  confirmed boolean not null default false
);

create table public.projects (
  id text primary key,              -- DPWH contract id
  title text not null,
  municipality text,                -- municipality slug; null = province-level
  cost numeric,
  status text,
  year int,
  category text
);

alter table public.hotlines enable row level security;
alter table public.projects enable row level security;

create policy "public read hotlines" on public.hotlines for select to anon, authenticated using (true);
create policy "public read projects" on public.projects for select to anon, authenticated using (true);
