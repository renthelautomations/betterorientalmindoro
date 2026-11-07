// Applies supabase/migrations/0003_gov.sql and loads every src/data/gov/*.json into gov_items (+ gov_meta) using SUPABASE_DB_URL from .env.local.
// Safe to re-run: rows are upserted by (dataset, id). Datasets without an id (facts) use their key.
// Run from a folder that has .env.local:  node scripts/seed-gov.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = [".env.local", "../../web/.env.local"].map((p) => path.resolve(process.cwd(), p)).find((p) => fs.existsSync(p));
if (!envFile) throw new Error(".env.local not found");
const env = {};
for (const l of fs.readFileSync(envFile, "utf8").split("\n")) {
  if (!l.trim() || l.trim().startsWith("#") || !l.includes("=")) continue;
  const i = l.indexOf("=");
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}
const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(fs.readFileSync(path.join(root, "supabase/migrations/0003_gov.sql"), "utf8"));

const dir = path.join(root, "src/data/gov");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const dataset = f.replace(/\.json$/, "");
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const items = d.items ?? [];
  let n = 0;
  for (let i = 0; i < items.length; i += 200) {
    const chunk = items.slice(i, i + 200);
    const vals = [], args = [];
    chunk.forEach((it, k) => { args.push(dataset, String(it.id ?? it.key), JSON.stringify(it)); vals.push(`($${k * 3 + 1}, $${k * 3 + 2}, $${k * 3 + 3}::jsonb)`); });
    await c.query(`insert into gov_items (dataset, id, data) values ${vals.join(",")} on conflict (dataset, id) do update set data = excluded.data`, args);
    n += chunk.length;
  }
  // rows no longer in the snapshot are removed so the table mirrors the file
  await c.query("delete from gov_items where dataset = $1 and id <> all($2::text[])", [dataset, items.map((it) => String(it.id ?? it.key))]);
  await c.query("insert into gov_meta (dataset, source, fetched_at, item_count) values ($1,$2,$3,$4) on conflict (dataset) do update set source = excluded.source, fetched_at = excluded.fetched_at, item_count = excluded.item_count", [dataset, d.source ?? "", d.fetchedAt ?? null, items.length]);
  console.log(`${dataset}: ${n} rows`);
}
const { rows } = await c.query("select dataset, count(*)::int n from gov_items group by 1 order by 1");
console.log(rows.map((r) => `${r.dataset}=${r.n}`).join("  "));
await c.end();
