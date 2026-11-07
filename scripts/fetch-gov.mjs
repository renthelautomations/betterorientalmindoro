// Snapshots PUBLIC data of the provincial government site (https://ormindoro.gov.ph, content is public domain unless stated)
// into src/data/gov/*.json as { source, fetchedAt, items }. PDFs are never downloaded: only titles, dates and link URLs are kept.
// Run: node scripts/fetch-gov.mjs [YYYY-MM-DD]   (network needed; output is committed, the site never calls upstream)
// Dev: GOV_HTML_DIR=<dir> reads previously saved pages (<dir>/<name>) instead of fetching.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { titleTown } from "../src/lib/dpwh-assign.mjs";
import { parseEo, workClass } from "../src/lib/gov-pure.mjs";

const BASE = "https://ormindoro.gov.ph";
const UA = "BetterOrientalMindoro-data-fetch (volunteer civic project)";
const OUT = new URL("../src/data/gov/", import.meta.url);
const fetchedAt = process.argv[2] ?? new Date().toISOString().slice(0, 10);
mkdirSync(OUT, { recursive: true });

// ---------- fetching (each page once, 1s apart) ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let first = true;
async function get(name, path) {
  if (process.env.GOV_HTML_DIR) return readFileSync(`${process.env.GOV_HTML_DIR}/${name}`, "utf8");
  if (!first) await sleep(1000);
  first = false;
  const r = await fetch(BASE + path, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.text();
}

// ---------- tiny HTML helpers (no parser dependency) ----------
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—" };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENT[e.toLowerCase()] ?? m),
  );
const text = (h) => decode(h.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const lines = (h) => decode(h.replace(/<(script|style|svg)[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/<\/(p|div|h\d|li|tr|figcaption)>|<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
const tables = (h) => [...h.matchAll(/<table[\s\S]*?<\/table>/g)].map((m) => m[0]);
const rows = (t) =>
  [...t.matchAll(/<tr[ >][\s\S]*?<\/tr>/g)]
    .map((m) => [...m[0].matchAll(/<t([dh])[^>]*>([\s\S]*?)<\/t\1>/g)].map((c) => ({ txt: text(c[2]), href: c[2].match(/href="([^"]+)"/)?.[1] ?? null })))
    .filter((r) => r.length && r[0].txt !== "Title" && r[0].txt !== "Date" && r[0].txt !== "Position Title" && r[0].txt !== "DEPARTMENT/OFFICE");
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function isoDate(s) {
  const m = String(s ?? "").match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  const mo = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  return mo < 0 ? null : `${m[3]}-${String(mo + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nul = (s) => (s && s.trim() ? s.trim() : null);
function uniqueIds(items) {
  const seen = new Map();
  for (const it of items) {
    const n = (seen.get(it.id) ?? 0) + 1;
    seen.set(it.id, n);
    if (n > 1) it.id = `${it.id}-${n}`;
  }
  return items;
}
const write = (name, source, items) => {
  writeFileSync(new URL(name, OUT), JSON.stringify({ source, fetchedAt, items }, null, 1) + "\n");
  console.log(name.padEnd(18), items.length);
};

// ---------- 1. procurement ----------
// One Elementor tab per document type; each tab holds one table, in this order.
const PROC_TYPES = ["itb", "rfq", "reso", "po", "noa", "coa", "ntp", "ppp"];
const TOWN_NAME = (slugName) => (slugName === "calapan-city" ? "CALAPAN" : slugName.replace(/-/g, " ").toUpperCase());
/** Town only when exactly one municipality is named in the title; several = null. */
function oneTown(title) {
  const t = titleTown(title);
  if (!t) return null;
  const rest = title.replace(new RegExp(`\\b${TOWN_NAME(t)}\\b`, "gi"), " ");
  return titleTown(rest) ? null : t;
}
{
  const html = await get("invitation-to-bid.html", "/invitation-to-bid/");
  const tbs = tables(html);
  if (tbs.length < PROC_TYPES.length) throw new Error(`procurement: expected ${PROC_TYPES.length} tables, got ${tbs.length}`);
  const items = [];
  PROC_TYPES.forEach((type, i) => {
    for (const r of rows(tbs[i])) {
      if (r.length < 3 || /^No .* documents found/i.test(r[0].txt)) continue;
      const title = r[0].txt;
      const ref = title.match(/\bIB\s*NO\.?\s*(CW)\s*(\d{4})\s+([0O]\d{1,3}|\d{1,4})(?:\s+([A-Z])\b(?!\s*ITB\b)|\b)/i);
      const refNo = ref ? `${ref[1].toUpperCase()}${ref[2]} ${ref[3].toUpperCase()}${ref[4] && !/^ITB|RESO|NOA|NTP|CA$/i.test(ref[4]) ? ` ${ref[4].toUpperCase()}` : ""}` : null;
      const url = r[2].href;
      items.push({
        id: `${type}-${slug(refNo ?? decodeURIComponent((url ?? title).split("/").pop()).replace(/\.pdf$/i, "")).slice(0, 60)}`,
        refNo, type, title, date: isoDate(r[1].txt), url, town: oneTown(title), work: workClass(title),
      });
    }
  });
  // RESO/NOA/COA/NTP titles often carry only the IB number: borrow work class and town from the ITB with the same refNo.
  const itb = new Map(items.filter((x) => x.type === "itb" && x.refNo).map((x) => [x.refNo, x]));
  for (const x of items) {
    const src = x.type !== "itb" && x.refNo ? itb.get(x.refNo) : null;
    if (src && x.work === "other") x.work = src.work;
    if (src && !x.town) x.town = src.town;
  }
  write("procurement.json", `${BASE}/invitation-to-bid/`, uniqueIds(items));
}

// ---------- 2. executive orders ----------
{
  const html = await get("eo.html", "/eo/");
  const items = rows(tables(html)[0]).filter((r) => r.length >= 3).map((r) => {
    const { number, suffix, year } = parseEo(r[0].txt);
    return { id: `eo-${year ?? "x"}-${number ?? slug(r[0].txt)}${suffix ? `-${suffix.toLowerCase()}` : ""}`, number, suffix, year, label: r[0].txt, title: nul(r[1].txt), date: null, url: r[2].href };
  });
  write("eo.json", `${BASE}/eo/`, uniqueIds(items));
}

// ---------- 3. financial reports + assistance ----------
{
  const items = [];
  for (const [name, path, forced] of [["financial-report.html", "/financial-report/", null], ["financial-assistance.html", "/financial-assistance/", "assistance"]]) {
    const html = await get(name, path);
    for (const r of rows(tables(html)[0])) {
      if (r.length < 4) continue;
      const title = r[1].txt;
      const kind = forced ?? (/SUPPLEMENTAL BUDGET/i.test(title) ? "supplemental-budget" : /LGSF/i.test(title) ? "lgsf" : "other");
      const url = r[3].href;
      items.push({ id: `${kind}-${slug(decodeURIComponent((url ?? title).split("/").pop()).replace(/\.pdf$/i, "")).slice(0, 60)}`, date: isoDate(r[0].txt), title, kind, url });
    }
  }
  write("reports.json", `${BASE}/financial-report/ , ${BASE}/financial-assistance/`, uniqueIds(items));
}

// ---------- 4. careers (a real table: tablepress-1) ----------
{
  const html = await get("careers.html", "/careers/");
  const t = tables(html).find((x) => /tablepress-1\b/.test(x));
  if (!t) throw new Error("careers table missing");
  const items = rows(t).filter((r) => r.length >= 11 && r[0].txt).map((r, i) => {
    const sal = r[3].txt.replace(/[^\d.]/g, "");
    const deadline = isoDate(r[10].txt);
    return {
      id: `career-${i + 1}-${slug(r[0].txt).slice(0, 40)}`,
      position: r[0].txt, itemNo: nul(r[1].txt), salaryGrade: nul(r[2].txt), monthlySalary: sal ? Number(sal) : null,
      education: nul(r[4].txt), training: nul(r[5].txt), experience: nul(r[6].txt), eligibility: nul(r[7].txt), competency: nul(r[8].txt),
      office: nul(r[9].txt), deadline,
      url: r[11]?.href ?? null, // the page has no per-vacancy links; applications go by email to hrrecruitment@ormindoro.gov.ph
    };
  });
  write("careers.json", `${BASE}/careers/`, uniqueIds(items));
}

// ---------- 5. news (RSS; summary only, never article bodies) ----------
{
  const parse = (xml, lang) =>
    [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
      const g = (tag) => m[1].match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1] ?? "";
      const d = new Date(g("pubDate"));
      const summary = text(g("description")).replace(/\s*\[…\]$/, "").replace(/^[A-Za-z]+ \d{1,2}, \d{4} \| /, "").replace(/^\S+ by [A-Z]{2,}\s+/, "");
      return {
        title: text(g("title")), link: text(g("link")), date: isNaN(d) ? null : d.toISOString(), language: lang,
        summary: summary.length > 200 ? summary.slice(0, 199).trimEnd() + "…" : summary || null,
      };
    });
  const items = [
    ...parse(await get("feed.xml", "/feed/"), "fil"),
    ...parse(await get("feed-p2.xml", "/feed/?paged=2"), "fil"),
    ...parse(await get("feed-eng.xml", "/category/new_eng/feed/"), "en"),
  ];
  const seen = new Set();
  const uniq = items.filter((x) => x.link && !seen.has(x.link) && seen.add(x.link)).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 30);
  write("news.json", `${BASE}/feed/ , ${BASE}/category/new_eng/feed/`, uniq.map((x, i) => ({ id: `news-${slug(x.link.replace(BASE, "")).slice(0, 70)}`, ...x })));
}

// ---------- 6. officials ----------
{
  const items = [];
  const person = (kind, name, position, extra = {}) => items.push({ kind, name, position, office: null, phone: null, location: null, email: null, ...extra });

  const gov = lines(await get("governor.html", "/governor/")).find((l) => /PROVINCIAL GOVERNOR$/.test(l) && l.length > 20);
  if (gov) person("governor", gov.replace(/\s*PROVINCIAL GOVERNOR$/, ""), "PROVINCIAL GOVERNOR");

  const sp = lines(await get("sp.html", "/sp/"));
  const i0 = sp.findIndex((l) => /12th SANGGUNIANG PANLALAWIGAN/i.test(l));
  const end = sp.findIndex((l) => l === "Republic of the Philippines");
  const body = sp.slice(i0 + 1, end < 0 ? undefined : end);
  const vg = body[0].match(/^(.*?)\s*(VICE GOVERNOR)$/);
  if (vg) person("vice-governor", vg[1], vg[2]);
  for (let i = vg ? 1 : 0; i + 1 < body.length; i += 2) {
    const position = body[i + 1];
    person(/^BOARD MEMBER$/i.test(position) ? "board-member" : /SECRETARY/i.test(position) ? "sp-secretary" : "sectoral", body[i], position);
  }

  const dh = lines(await get("department-heads.html", "/department-heads/"));
  const d0 = dh.findIndex((l) => l === "DEPARTMENT HEADS");
  const dEnd = dh.findIndex((l) => l === "Republic of the Philippines");
  const dbody = dh.slice(d0 + 1, dEnd < 0 ? undefined : dEnd);
  for (let i = 0; i + 1 < dbody.length; i += 2) person("department-head", dbody[i], dbody[i + 1]);

  const contact = await get("contact-us.html", "/contact-us/");
  for (const r of rows(tables(contact).find((x) => /tablepress-2\b/.test(x)))) {
    if (r.length < 5) continue;
    person("office", nul(r[1].txt), null, { office: r[0].txt, phone: nul(r[2].txt), location: nul(r[3].txt), email: nul(r[4].txt) });
  }
  write("officials.json", `${BASE}/governor/ , ${BASE}/sp/ , ${BASE}/department-heads/ , ${BASE}/contact-us/`, items.map((x, i) => ({ id: `${x.kind}-${i + 1}-${slug(x.office ?? x.name ?? "").slice(0, 40)}`, ...x })));
}

// ---------- 7. investment ----------
{
  const html = await get("investment.html", "/investment/");
  const items = [];
  for (const m of html.matchAll(/<p><strong>(\d+)\.\s*([\s\S]*?)<\/strong>([\s\S]*?)<\/p>\s*<p><strong>Opportunities:<\/strong>([\s\S]*?)<\/p>\s*<p><strong>Why:<\/strong>([\s\S]*?)<\/p>/g)) {
    const sub = m[3].match(/\(([^)]*)\)/);
    items.push({ id: `sector-${m[1]}`, n: Number(m[1]), sector: text(`${m[2]} ${m[3].replace(/\([^)]*\)/, "")}`), note: sub ? text(sub[1]) : null, opportunities: text(m[4]), why: text(m[5]) });
  }
  write("investment.json", `${BASE}/investment/`, items);
}

// ---------- 8. facts ----------
{
  const flat = lines(await get("about.html", "/about/")).join(" ");
  const num = (s) => Number(s.replace(/[,\s]/g, ""));
  const F = (key, label, unit, re) => {
    const m = flat.match(re);
    return { key, label, value: m ? num(m[1]) : null, unit };
  };
  const items = [
    F("congressionalDistricts", "Congressional districts", "count", /(\d+)\s+Congressional Districts/i),
    F("componentCities", "Component cities", "count", /(\d+)\s+Component City/i),
    F("municipalities", "Municipalities", "count", /(\d+)\s+Total Municipalities/i),
    F("barangays", "Barangays", "count", /(\d+)\s+Total Barangays/i),
    F("areaKm2", "Land area of Oriental Mindoro", "sq km", /([\d,.]+)\s*sq\. km\.\s*Total Oriental Mindoro/i),
    F("areaHectares", "Land area of Oriental Mindoro", "ha", /or ([\d,\s]+) hectares/i),
    F("pctOfPhilippines", "Share of the Philippines' land area", "percent", /([\d.]+)%\s*of the Philippines total land area/i),
    F("pctOfMimaropa", "Share of the MIMAROPA land area", "percent", /([\d.]+)% of the MIMAROPA/i),
    F("mimaropaAreaKm2", "Land area of MIMAROPA", "sq km", /([\d,.]+)\s*sq\. km\.\s*Total Land Area of MIMAROPA/i),
    F("philippinesAreaKm2", "Land area of the Philippines", "sq km", /([\d,.]+)\s*sq\. km\.\s*Total Land Area of the Philippines/i),
  ];
  write("facts.json", `${BASE}/about/`, items);
}
