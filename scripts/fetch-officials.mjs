// Current Oriental Mindoro officials = 2025 election winners (terms 2025-2028), from OpenHalalan (BetterGov dataset 25, ODbL v1.0): https://data.bettergov.ph/datasets/25
// Writes src/data/officials/2025.json. Covers governor to councilor only; the dataset has no barangay officials.
// Run: node scripts/fetch-officials.mjs   (network needed; output is committed, the site never calls upstream)
import { writeFileSync } from "node:fs";

const URL = "https://github.com/RobertRLeung/OpenHalalan/releases/download/data-latest/NLE_Winners_2004-2025.csv";
const split = (l) => { const o = []; let c = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const slugify = (n) => (n === "CALAPAN" ? "calapan-city" : n.toLowerCase().replace(/\s+/g, "-"));

const res = await fetch(URL, { headers: { "User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)" } });
if (!res.ok) throw new Error(`fetch ${res.status}`);
const lines = (await res.text()).replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
const head = split(lines[0]);
const col = (n) => { const i = head.indexOf(n); if (i < 0) throw new Error(`column ${n} missing`); return i; };
const C = Object.fromEntries(["Last Name", "First Name", "Middle Name", "Title", "Position", "Party", "Year", "Province", "City"].map((n) => [n, col(n)]));

const items = [];
for (const l of lines.slice(1)) {
  const c = split(l);
  if (c[C.Year] !== "2025" || c[C.Province] !== "ORIENTAL MINDORO") continue;
  items.push({
    position: c[C.Position], town: c[C.City] ? slugify(c[C.City]) : null,
    last: c[C["Last Name"]], first: c[C["First Name"]], middle: c[C["Middle Name"]] || null, title: c[C.Title] || null, party: c[C.Party] || null,
  });
}
const order = ["GOVERNOR", "VICE GOVERNOR", "MEMBER, HOUSE OF REPRESENTATIVES", "PROVINCIAL BOARD MEMBER", "MAYOR", "VICE MAYOR", "COUNCILOR"];
items.sort((a, b) => order.indexOf(a.position) - order.indexOf(b.position) || (a.town ?? "").localeCompare(b.town ?? "") || a.last.localeCompare(b.last) || a.first.localeCompare(b.first));
if (items.length < 100) throw new Error(`only ${items.length} rows, source changed?`);
writeFileSync("src/data/officials/2025.json", JSON.stringify({ source: "OpenHalalan (BetterGov dataset 25), ODbL v1.0", sourceUrl: "https://data.bettergov.ph/datasets/25", term: "2025-2028", items }, null, 1) + "\n");
console.log(items.length, "officials");
