-- Anonymous visit counter: one number, no personal data. The table is closed to direct access; the site only calls the two functions.
create table if not exists site_stats (id text primary key, n bigint not null default 0);
insert into site_stats (id, n) values ('views', 0) on conflict (id) do nothing;
alter table site_stats enable row level security;

create or replace function bump_views() returns bigint language sql security definer set search_path = public as
$$ update site_stats set n = n + 1 where id = 'views' returning n $$;
create or replace function get_views() returns bigint language sql security definer set search_path = public as
$$ select n from site_stats where id = 'views' $$;
revoke all on function bump_views(), get_views() from public;
grant execute on function bump_views(), get_views() to anon, authenticated;
