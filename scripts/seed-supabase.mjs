// Applies supabase/migrations/*.sql (once) and loads src/data/{hotlines,dpwh}.json using SUPABASE_DB_URL from .env.local.
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
await upsert("projects", ["id", "title", "municipality", "uncertain", "cost", "status", "year", "category"],
  load("dpwh").map((p) => ({ ...p, uncertain: !!p.uncertain })));
await c.end();
