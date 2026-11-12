// BIR tax collection by area and month, 2020-2024 (BetterGov dataset, CC0): https://huggingface.co/datasets/bettergovph/bir-tax-collection
// Amounts are millions of pesos. Writes src/data/bir.json: yearly totals for every area (for rank and comparison) and monthly values for the MIMAROPA areas.
// Run: node scripts/fetch-bir.mjs   (network needed; output is committed, the site never calls upstream)
import { writeFileSync } from "node:fs";

const BASE = "https://huggingface.co/datasets/bettergovph/bir-tax-collection/resolve/main";
const YEARS = [2020, 2021, 2022, 2023, 2024];
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const num = (s) => { const n = parseFloat(String(s).replace(/[,\s"]/g, "")); return Number.isFinite(n) ? n : null; };
// minimal CSV line split that respects quotes
const split = (l) => { const o = []; let c = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };

const areas = new Map();
for (const y of YEARS) {
  const res = await fetch(`${BASE}/${y}_bir_collection.csv`, { headers: { "User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)" } });
  if (!res.ok) throw new Error(`${y} ${res.status}`);
  const lines = (await res.text()).replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  const head = split(lines[0]).map((h) => h.trim().toUpperCase());
  const idx = MONTHS.map((m) => head.indexOf(m));
  if (idx.some((i) => i < 0)) throw new Error(`${y}: month columns not found`);
  for (const l of lines.slice(1)) {
    const c = split(l); const region = c[0].trim(), area = c[1].trim();
    if (!region || !area) continue;
    const key = `${region}|${area}`;
    const a = areas.get(key) ?? { region, area, years: {} };
    a.years[y] = idx.map((i) => num(c[i]));
    areas.set(key, a);
  }
}
const items = [...areas.values()].map((a) => ({
  region: a.region, area: a.area,
  totals: Object.fromEntries(YEARS.map((y) => [y, a.years[y] && a.years[y].every((v) => v != null) ? Math.round(a.years[y].reduce((s, v) => s + v, 0) * 100) / 100 : null])),
  months: /mimaropa/i.test(a.region) ? a.years : undefined,
}));
writeFileSync(new URL("../src/data/bir.json", import.meta.url), JSON.stringify({ source: "https://huggingface.co/datasets/bettergovph/bir-tax-collection", dashboard: "https://transparency.bettergov.ph/bir", license: "CC0 1.0", unit: "millions of pesos", years: YEARS, fetchedAt: new Date().toISOString().slice(0, 10), items }) + "\n");
const om = items.find((i) => i.area === "Oriental Mindoro");
console.log(items.length, "areas;", "Oriental Mindoro totals:", om.totals);
