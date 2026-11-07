// DPWH Infrastructure Transparency data (BetterGov dataset 19, CC0) -> src/data/dpwh.json
// Rows are assigned to a municipality by point-in-polygon on latitude/longitude.
// Rows from the "Mindoro Oriental DEO" without a usable point take the town named in their title; if point and title disagree the row is marked uncertain and left unassigned.
import { readFileSync, writeFileSync, createWriteStream, existsSync } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { asyncBufferFromFile, parquetReadObjects } from "hyparquet";
import { titleTown, assignTown } from "../src/lib/dpwh-assign.mjs";

const URL = "https://huggingface.co/datasets/bettergovph/dpwh-transparency-data/resolve/main/dpwh_transparency_data.parquet?download=true";
const TMP = process.env.DPWH_PARQUET ?? "/tmp/dpwh.parquet";
if (!existsSync(TMP)) await pipeline(Readable.fromWeb((await fetch(URL)).body), createWriteStream(TMP));

const load = (f) => JSON.parse(readFileSync(`public/data/${f}.geojson`, "utf8")).features;
const clean = (n) => { const b = n.replace(/\s*\(.*\)/, "").trim(); return b.startsWith("City of ") ? `${b.slice(8)} City` : b; };
const slug = (n) => clean(n).toLowerCase().replace(/\s+/g, "-");
const areas = [...load("municipalities"), ...load("component_cities")].map((f) => ({
  slug: slug(f.properties.ADM3_EN),
  polys: f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates,
}));

const inRing = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; return c; };
const inPoly = (x, y, p) => inRing(x, y, p[0]) && !p.slice(1).some((h) => inRing(x, y, h));
const find = (x, y) => areas.find((a) => a.polys.some((p) => inPoly(x, y, p)))?.slug;

const rows = await parquetReadObjects({ file: await asyncBufferFromFile(TMP), columns: ["contractId", "description", "category", "status", "budget", "location", "latitude", "longitude", "infraYear", "startDate", "completionDate", "contractor"] });
const day = (d) => (d instanceof Date && !isNaN(d) ? d.toISOString().slice(0, 10) : undefined);
const out = [];
for (const r of rows) {
  const hasXY = r.latitude != null && r.longitude != null;
  const xy = hasXY ? find(r.longitude, r.latitude) : undefined;
  const deo = r.location?.province === "Mindoro Oriental DEO";
  if (!xy && !deo) continue; // not ours
  const { municipality, uncertain } = assignTown({ xy, title: titleTown(r.description), deo });
  out.push({ id: String(r.contractId), title: String(r.description).trim(), municipality, uncertain: uncertain || undefined, cost: r.budget ?? undefined, status: r.status ?? undefined, year: r.infraYear ? Number(r.infraYear) : undefined, category: r.category ?? undefined, lat: hasXY ? r.latitude : undefined, lon: hasXY ? r.longitude : undefined, start: day(r.startDate), end: day(r.completionDate), contractor: r.contractor ? String(r.contractor).replace(/\s*\(\d+\)\s*$/, "").trim() : undefined });
}
// ids are not guaranteed unique in the source; keep the first of each
const seen = new Set();
const uniq = out.filter((p) => !seen.has(p.id) && seen.add(p.id));
writeFileSync("src/data/dpwh.json", JSON.stringify(uniq));
console.log("rows", rows.length, "kept", uniq.length, "assigned", uniq.filter((p) => p.municipality).length);
