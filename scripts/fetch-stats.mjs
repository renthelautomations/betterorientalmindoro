// Fetches population, income class and COA-audited finance from Wikidata (CC0) into src/data/stats.json.
// Wikidata statements cite PSA (population), BLGF (income class) and COA annual audit reports (finance).
// Usage: node scripts/fetch-stats.mjs
import { writeFileSync } from "node:fs";

const UA = "BetterOrientalMindoro/0.1 (volunteer civic site)";
const IDS = {
  province: "Q13868",
  baco: "Q107538", bansud: "Q107543", bongabong: "Q107550", bulalacao: "Q107554", gloria: "Q107559",
  mansalay: "Q107567", naujan: "Q107573", pinamalayan: "Q107578", pola: "Q107585", "puerto-galera": "Q107593",
  roxas: "Q107598", "san-teodoro": "Q107606", socorro: "Q107612", victoria: "Q107618", "calapan-city": "Q107624",
};
const LABEL = (s) => (s === "calapan-city" ? "Calapan" : s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "));
const retrievedAt = new Date().toISOString().slice(0, 10);
const api = async (q) => (await fetch(`https://www.wikidata.org/w/api.php?format=json&${q}`, { headers: { "user-agent": UA } })).json();

const ids = Object.values(IDS);
const { entities } = await api(`action=wbgetentities&ids=${ids.join("|")}&props=claims|labels&languages=en`);

const year = (c) => Number(c.qualifiers?.P585?.[0]?.datavalue?.value?.time?.slice(1, 5));
const amount = (c) => Number(c.mainsnak.datavalue.value.amount);
const refTitle = (c) => c.references?.flatMap((r) => r.snaks.P1476 ?? []).map((s) => s.datavalue.value.text)[0];
const refUrl = (c) => c.references?.flatMap((r) => r.snaks.P854 ?? []).map((s) => s.datavalue.value)[0];

const classItems = new Set();
const out = { generatedAt: retrievedAt, province: null, municipalities: {} };

for (const [slug, qid] of Object.entries(IDS)) {
  const e = entities[qid];
  const label = e.labels.en?.value ?? e.claims.P373?.[0]?.mainsnak.datavalue.value.split(",")[0]; // some items lack an English label
  if (slug !== "province" && label !== LABEL(slug)) throw new Error(`${qid} label ${label} != ${slug}`);
  const wd = `https://www.wikidata.org/wiki/${qid}`;
  const cl = e.claims;
  const population = (cl.P1082 ?? [])
    .map((c) => ({ year: year(c), value: amount(c), asOf: c.qualifiers?.P585?.[0]?.datavalue?.value?.time?.slice(1, 11), source: refUrl(c) ?? wd }))
    .filter((p) => p.year >= 1990)
    .sort((a, b) => a.year - b.year);
  const latest = (prop) => {
    const rows = (cl[prop] ?? []).filter((c) => year(c)).sort((a, b) => year(b) - year(a));
    const c = rows[0];
    return c ? { value: amount(c), year: year(c), source: wd, citedAs: refTitle(c) ?? refUrl(c) ?? null, retrievedAt, license: "CC0 (Wikidata)" } : null;
  };
  const ic = (cl.P1879 ?? []).sort((a, b) => (b.qualifiers?.P585?.[0]?.datavalue?.value?.time ?? "").localeCompare(a.qualifiers?.P585?.[0]?.datavalue?.value?.time ?? ""))[0];
  if (ic) classItems.add(ic.mainsnak.datavalue.value.id);
  const rec = {
    wikidata: wd,
    population: population.map((p) => ({ ...p, retrievedAt })),
    incomeClassQid: ic?.mainsnak.datavalue.value.id ?? null,
    incomeClassYear: ic ? year(ic) || Number(ic.qualifiers?.P585?.[0]?.datavalue?.value?.time?.slice(1, 5)) : null,
    incomeClassSource: ic ? wd : null,
    revenue: latest("P3087"), expenditure: latest("P2402"), assets: latest("P2403"), liabilities: latest("P2138"),
    // IRA / income composition: no open source reachable (BLGF SRE blocked), left null on purpose.
    ira: null,
  };
  if (slug === "province") out.province = rec; else out.municipalities[slug] = rec;
}

const labels = (await api(`action=wbgetentities&ids=${[...classItems].join("|")}&props=labels&languages=en`)).entities;
for (const r of [out.province, ...Object.values(out.municipalities)]) {
  if (!r.incomeClassQid) { r.incomeClass = null; continue; }
  const name = labels[r.incomeClassQid].labels.en.value; // e.g. "1st class municipality"
  r.incomeClass = { value: name, year: r.incomeClassYear, source: r.incomeClassSource, retrievedAt, license: "CC0 (Wikidata); cites BLGF/PSA" };
  delete r.incomeClassQid; delete r.incomeClassYear; delete r.incomeClassSource;
}
// Socorro 2024 revenue (PHP 22.2M) is ~10x below every peer and looks like a partial/mistyped statement; shown as "-" until verified.
out.municipalities.socorro.revenue = null;
writeFileSync("src/data/stats.json", JSON.stringify(out, null, 1) + "\n");
console.log("wrote src/data/stats.json");
