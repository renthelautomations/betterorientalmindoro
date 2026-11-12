// Current Oriental Mindoro officials = 2025 election winners (terms 2025-2028), from OpenHalalan (BetterGov dataset 25, ODbL v1.0): https://data.bettergov.ph/datasets/25
// Writes src/data/officials/2025.json: winners plus service record (all winners 2004-2025) and 2025 votes (NLE_Vote_Counts, 55 MB). Covers governor to councilor only; the dataset has no barangay officials.
// Run: node scripts/fetch-officials.mjs   (network needed; output is committed, the site never calls upstream)
import { writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { contestFigures, personKey, serviceRecord } from "../src/lib/officials-record.mjs";

const URL = "https://github.com/RobertRLeung/OpenHalalan/releases/download/data-latest/NLE_Winners_2004-2025.csv";
const split = (l) => { const o = []; let c = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const slugify = (n) => (n === "CALAPAN" ? "calapan-city" : /^BULALACAO\b/.test(n) ? "bulalacao" : n.toLowerCase().replace(/\s+/g, "-"));

const res = await fetch(URL, { headers: { "User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)" } });
if (!res.ok) throw new Error(`fetch ${res.status}`);
const lines = (await res.text()).replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
const head = split(lines[0]);
const col = (n) => { const i = head.indexOf(n); if (i < 0) throw new Error(`column ${n} missing`); return i; };
const C = Object.fromEntries(["Last Name", "First Name", "Middle Name", "Title", "Position", "Party", "Year", "Province", "City"].map((n) => [n, col(n)]));

const items = [], wins = new Map(); // wins: personKey -> [{year, position, town}] for the whole province history
for (const l of lines.slice(1)) {
  const c = split(l);
  if (c[C.Province] !== "ORIENTAL MINDORO") continue;
  const k = personKey(c[C["Last Name"]], c[C["First Name"]]);
  (wins.get(k) ?? wins.set(k, []).get(k)).push({ year: Number(c[C.Year]), position: c[C.Position], town: c[C.City] ? slugify(c[C.City]) : null });
  if (c[C.Year] !== "2025") continue;
  items.push({
    position: c[C.Position], town: c[C.City] ? slugify(c[C.City]) : null,
    last: c[C["Last Name"]], first: c[C["First Name"]], middle: c[C["Middle Name"]] || null, title: c[C.Title] || null, party: c[C.Party] || null,
  });
}
const order = ["GOVERNOR", "VICE GOVERNOR", "MEMBER, HOUSE OF REPRESENTATIVES", "PROVINCIAL BOARD MEMBER", "MAYOR", "VICE MAYOR", "COUNCILOR"];
items.sort((a, b) => order.indexOf(a.position) - order.indexOf(b.position) || (a.town ?? "").localeCompare(b.town ?? "") || a.last.localeCompare(b.last) || a.first.localeCompare(b.first));
// ---- 2025 votes (optional: the file is large, so a failed download only drops the vote figures) ----
const VURL = "https://github.com/RobertRLeung/OpenHalalan/releases/download/data-latest/NLE_Vote_Counts_2007-2025.csv.gz";
const vrows = [];
try {
  const vr = await fetch(VURL, { headers: { "User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)" } });
  if (!vr.ok) throw new Error(`votes ${vr.status}`);
  const vl = gunzipSync(Buffer.from(await vr.arrayBuffer())).toString("utf8").replace(/^﻿/, "").split(/\r?\n/);
  const vh = split(vl[0]); const V = (n) => vh.indexOf(n);
  const [iy, ip, ic, id, ipos, il, ifn, inm, ipa, iv] = ["year", "province", "city", "district", "position", "last_name", "first_name", "candidate_name", "party", "votes"].map(V);
  for (const l of vl.slice(1)) {
    if (!l.includes("ORIENTAL MINDORO")) continue;
    const c = split(l);
    if (c[iy] === "2025" && c[ip] === "ORIENTAL MINDORO") vrows.push({ pos: c[ipos], city: c[ic], district: c[id], key: personKey(c[il], c[ifn]), name: c[inm], party: c[ipa], votes: Number(c[iv]) || 0 });
  }
} catch (e) { console.warn("vote figures skipped:", e.message); }

const scopeOf = (pos, city, district) => (["MAYOR", "VICE MAYOR", "COUNCILOR"].includes(pos) ? city : ["MEMBER, HOUSE OF REPRESENTATIVES", "PROVINCIAL BOARD MEMBER"].includes(pos) ? district : "");
const contests = new Map(); // pos|scope -> Map(key -> {key,name,party,votes})
for (const r of vrows) {
  const k = `${r.pos}|${scopeOf(r.pos, r.city, r.district)}`;
  const m = contests.get(k) ?? contests.set(k, new Map()).get(k);
  const cur = m.get(r.key); if (cur) cur.votes += r.votes; else m.set(r.key, { key: r.key, name: r.name, party: r.party, votes: r.votes });
}
const itemKey = (i) => personKey(i.last, i.first);
const figs = new Map(); let matched = 0;
for (const [ck, m] of contests) {
  const [pos, scope] = ck.split("|");
  const winners = items.filter((i) => i.position === pos && m.has(itemKey(i)) && (["MAYOR", "VICE MAYOR", "COUNCILOR"].includes(pos) ? slugify(scope) === i.town : true));
  if (["MEMBER, HOUSE OF REPRESENTATIVES", "PROVINCIAL BOARD MEMBER"].includes(pos)) { // a winner belongs to the district he or she ran in
    const dist = new Set(winners.filter((i) => vrows.some((r) => r.pos === pos && r.district === scope && r.key === itemKey(i))).map(itemKey));
    for (const [k, v] of contestFigures([...m.values()], [...dist])) figs.set(`${pos}|${k}`, v);
  } else for (const [k, v] of contestFigures([...m.values()], winners.map(itemKey))) figs.set(`${pos}|${k}${["MAYOR", "VICE MAYOR", "COUNCILOR"].includes(pos) ? "|" + slugify(scope) : ""}`, v);
}
for (const i of items) {
  const rec = serviceRecord(wins.get(itemKey(i)) ?? [], 2025, i.position);
  i.streak = rec.streak; i.years = rec.years; i.earlier = rec.earlier;
  const f = figs.get(`${i.position}|${itemKey(i)}${["MAYOR", "VICE MAYOR", "COUNCILOR"].includes(i.position) ? "|" + i.town : ""}`);
  if (f) { Object.assign(i, f); matched++; }
}
console.log(`votes matched for ${matched} of ${items.length} officials`);
if (items.length < 100) throw new Error(`only ${items.length} rows, source changed?`);
writeFileSync("src/data/officials/2025.json", JSON.stringify({ source: "OpenHalalan (BetterGov dataset 25), ODbL v1.0", sourceUrl: "https://data.bettergov.ph/datasets/25", term: "2025-2028", items }, null, 1) + "\n");
console.log(items.length, "officials");
