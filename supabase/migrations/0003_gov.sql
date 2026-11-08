-- Public records of the provincial government (from ormindoro.gov.ph): one row per record, grouped by dataset. Read-only for everyone.
create table if not exists gov_items (
  dataset text not null,
  id text not null,
  data jsonb not null,
  primary key (dataset, id)
);
create index if not exists gov_items_dataset_idx on gov_items (dataset);
create table if not exists gov_meta (
  dataset text primary key,
  source text not null,
  fetched_at text,
  item_count integer not null
);
alter table gov_items enable row level security;
alter table gov_meta enable row level security;
drop policy if exists "public read gov_items" on gov_items;
drop policy if exists "public read gov_meta" on gov_meta;
create policy "public read gov_items" on gov_items for select using (true);
create policy "public read gov_meta" on gov_meta for select using (true);
