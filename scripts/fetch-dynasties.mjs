// Snapshots Oriental Mindoro data from the BetterGov dynasties API into src/data/dynasties/*.json.
// Run: node scripts/fetch-dynasties.mjs   (network needed; output is committed, site never calls upstream)
import { mkdirSync, writeFileSync } from "node:fs";

const API = "https://dynasties.bettergov.ph/api/v1";
const OUT = new URL("../src/data/dynasties/", import.meta.url);
const PROV = "oriental-mindoro";
const LOCAL = new Set(["MAYOR", "VICE MAYOR", "COUNCILOR"]);
// upstream town slug -> our municipality slug
const SLUG = { calapan: "calapan-city", "bulalacao-san-pedro": "bulalacao" };

const get = async (p) => {
  const r = await fetch(API + p);
  if (!r.ok) throw new Error(`${p} ${r.status}`);
  return r.json();
};

const prov = await get(`/places/${PROV}`);
const towns = {};
for (const t of prov.data.towns) {
  const slug = SLUG[t.slug] ?? t.slug;
  const { data } = await get(`/contests?province=${PROV}&town=${t.slug}&limit=500&candidates=1`);
  const contests = data.contests
    .filter((c) => c.city_slug === t.slug && LOCAL.has(c.position))
    .map((c) => ({
      year: c.year,
      position: c.position,
      seats: c.seats,
      candidates: c.candidates.length,
      uncontested: !!c.uncontested,
      margin: c.margin ?? null,
      winners: c.candidates
        .filter((x) => x.won)
        .map((x) => ({ id: x.person_id, name: x.display_name, ballot: x.ballot_name, party: x.party, votes: x.votes })),
    }));
  // Bulalacao appears twice upstream; merge, keep one record per year+position (the one with more candidates)
  const bag = (towns[slug] ??= { slug, upstream: [], contests: [] });
  bag.upstream.push(t.slug);
  for (const c of contests) {
    const i = bag.contests.findIndex((o) => o.year === c.year && o.position === c.position);
    if (i < 0) bag.contests.push(c);
    else if (c.candidates > bag.contests[i].candidates) bag.contests[i] = c;
  }
  console.log(slug, t.slug, contests.length);
}

mkdirSync(OUT, { recursive: true });
for (const t of Object.values(towns)) {
  t.contests.sort((a, b) => b.year - a.year || a.position.localeCompare(b.position));
  writeFileSync(new URL(`${t.slug}.json`, OUT), JSON.stringify(t));
}
writeFileSync(
  new URL("province.json", OUT),
  JSON.stringify({
    name: "Oriental Mindoro",
    poverty: prov.data.poverty,
    elections: prov.data.elections.map(({ year, contests }) => ({ year, contests })),
    towns: Object.keys(towns).sort(),
    vintage: prov.meta.data_vintage,
    source: prov.meta.source,
    license: prov.meta.license,
  }),
);
