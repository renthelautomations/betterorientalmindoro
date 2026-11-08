// Applies supabase/migrations/*.sql (once) and loads src/data/{hotlines,dpwh,lgu-contacts,lgu-directory}.json using SUPABASE_DB_URL from .env.local.
// Safe to re-run: tables are created if missing and rows are upserted by id.
import fs from "node:fs";
import pg from "pg";

const env = {};
for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) {
  if (!l.trim() || l.trim().startsWith("#") || !l.includes("=")) continue;
  const i = l.indexOf("=");
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}
const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const exists = (await c.query("select to_regclass('public.hotlines') r")).rows[0].r;
if (!exists) {
  for (const f of fs.readdirSync("supabase/migrations").sort()) await c.query(fs.readFileSync(`supabase/migrations/${f}`, "utf8"));
  console.log("schema applied");
} else console.log("schema already present");
// 0003 is idempotent, so it is applied separately for databases created before it existed.
if (!(await c.query("select to_regclass('public.lgu_contacts') r")).rows[0].r) {
  await c.query(fs.readFileSync("supabase/migrations/0003_lgu_contacts.sql", "utf8"));
  console.log("lgu tables applied");
}

const load = (f) => JSON.parse(fs.readFileSync(`src/data/${f}.json`, "utf8"));
async function upsert(table, cols, rows) {
  const upd = cols.slice(1).map((k) => `${k}=excluded.${k}`).join(",");
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const vals = [], ph = chunk.map((r, j) => `(${cols.map((k, n) => { vals.push(r[k] ?? null); return `$${j * cols.length + n + 1}`; }).join(",")})`);
    await c.query(`insert into public.${table} (${cols.join(",")}) values ${ph.join(",")} on conflict (id) do update set ${upd}`, vals);
  }
  console.log(table, "rows:", (await c.query(`select count(*) n from public.${table}`)).rows[0].n);
}
await upsert("hotlines", ["id", "scope", "category", "name", "number", "source", "verified_at", "confirmed"],
  load("hotlines").map((h) => ({ ...h, verified_at: h.verifiedAt })));
// Rows removed from the JSON must go from the table too.
const hotIds = load("hotlines").map((h) => h.id);
console.log("hotlines removed:", (await c.query("delete from public.hotlines where id <> all($1::text[])", [hotIds])).rowCount);
await upsert("projects", ["id", "title", "municipality", "uncertain", "cost", "status", "year", "category"],
  load("dpwh").map((p) => ({ ...p, uncertain: !!p.uncertain })));

// LGU contact cards and office directories: replaced wholesale each run.
const J = (v) => JSON.stringify(v ?? []);
await c.query("truncate public.lgu_contacts, public.lgu_offices");
for (const [scope, x] of Object.entries(load("lgu-contacts")))
  await c.query("insert into public.lgu_contacts (scope,email,landline,mobile,website,facebook,source,extra_sources,verified_at) values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8::jsonb,$9)",
    [scope, x.email, x.landline, x.mobile, x.website, J(x.facebook), x.source, J(x.extraSources), x.verifiedAt]);
for (const [scope, d] of Object.entries(load("lgu-directory")))
  for (const [i, o] of d.offices.entries())
    await c.query("insert into public.lgu_offices (id,scope,position,name,category,head,address,phone,email,facebook,source,verified_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
      [`${scope}:${i}`, scope, i, o.name, o.category, o.head ?? null, o.address ?? null, o.phone, o.email, o.facebook ?? null, d.source, d.verifiedAt]);
for (const t of ["lgu_contacts", "lgu_offices"]) console.log(t, "rows:", (await c.query(`select count(*) n from public.${t}`)).rows[0].n);
await c.end();
