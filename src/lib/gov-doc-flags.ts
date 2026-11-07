// Automatic checks over the posted lists of executive orders and financial reports. They describe the LIST on the official page, never a finding about anyone.
import { getEo, getReports, parseEo, type Eo, type Report } from "./gov";

export const DISCLAIMER = "This is an automatic check of the posted list and scanned documents, not a finding of wrongdoing or an allegation. OCR can misread text; open the PDF to confirm. There may be an ordinary explanation (for example a document not yet posted).";
export const REPORT_MISTAKE_URL = "https://github.com/renthelautomations/betterorientalmindoro/issues/new";

export type FlagEvidence = { docId: string; page: number | null; quote: string | null; value: string | number | null };
export type DocFlag = {
  id: string; rule: string; severity: "info" | "review"; // any rule: this card also shows the procurement flags
  title: string; what: string; evidence: FlagEvidence[]; verify: string[];
  references: { label: string; url: string }[]; confidence: "high" | "medium" | "low"; disclaimer: string;
};

export const VERIFY = {
  pdf: "Open the official PDF and read the order or report itself.",
  list: "Compare with the list posted on the official website.",
  legal: "Ask the Provincial Legal Office or the Office of the Governor whether the order exists.",
  ppdo: "Ask the Provincial Planning and Development Office (PPDO) or the Provincial Budget Office for the report.",
  coa: "Check the Commission on Audit (COA) annual audit reports for the province.",
} as const;
/** English verify sentence -> dictionary key, so the card can show it in Filipino. */
export const VERIFY_KEY: Record<string, string> = Object.fromEntries(Object.entries(VERIFY).map(([k, v]) => [v, `gova.v.${k}`]));
const LGC = { label: "Local Government Code, RA 7160", url: "https://lawphil.net/statutes/repacts/ra1991/ra_7160_1991.html" };
const COA = { label: "Commission on Audit", url: "https://www.coa.gov.ph/" };

/** "EO No. 61, s. 2026" (letter suffix kept); falls back to the printed label. */
export const eoShort = (e: Pick<Eo, "number" | "suffix" | "year" | "label">) =>
  e.number == null || e.year == null ? e.label : `EO No. ${e.number}${e.suffix ?? ""}, s. ${e.year}`;

/** Resolve a label such as "Executive Order No. 59, Series of 2020" to the id of a listed order, or null. */
export function resolveEoRef(label: string, eos: Eo[]): string | null {
  const r = parseEo(label);
  if (r.number == null || r.year == null) return null;
  const hit = eos.filter((e) => e.number === r.number && e.year === r.year);
  return (hit.find((e) => e.suffix === r.suffix) ?? hit[0])?.id ?? null;
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
/** Quarter an LGSF report covers, read from its title ("...Ended March 31, 2026", "as of June, 2026"); null when no month and year. */
export function lgsfQuarter(title: string): { year: number; q: 1 | 2 | 3 | 4 } | null {
  const m = title.toLowerCase().match(new RegExp(`(${MONTHS.join("|")})\\b[^0-9]*(?:\\d{1,2}[^0-9]+)?(\\d{4})`));
  if (!m) return null;
  return { year: Number(m[2]), q: (Math.ceil((MONTHS.indexOf(m[1]) + 1) / 3)) as 1 | 2 | 3 | 4 };
}
const qIndex = (x: { year: number; q: number }) => x.year * 4 + x.q - 1;
const qFrom = (i: number) => ({ year: Math.floor(i / 4), q: ((i % 4) + 1) as 1 | 2 | 3 | 4 });
/** ISO date of the last day of a quarter. */
export const quarterEnd = (x: { year: number; q: number }) => `${x.year}-${["03-31", "06-30", "09-30", "12-31"][x.q - 1]}`;

/** Quarter -> listed LGSF report ids, and the quarters (listed range up to the data's latest date) with none. */
export function lgsfQuarters(reports: Report[]) {
  const listed = new Map<number, string[]>();
  for (const r of reports) {
    if (r.kind !== "lgsf") continue;
    const q = lgsfQuarter(r.title);
    if (q) listed.set(qIndex(q), [...(listed.get(qIndex(q)) ?? []), r.id]);
  }
  const latest = reports.reduce((a, r) => (r.date && r.date > a ? r.date : a), "");
  const all = [...listed.keys()];
  const notListed: { year: number; q: 1 | 2 | 3 | 4 }[] = [];
  if (all.length && latest) {
    for (let i = Math.min(...all); i <= Math.max(...all, qIndex({ year: +latest.slice(0, 4), q: 4 })); i++) {
      if (quarterEnd(qFrom(i)) <= latest && !listed.has(i)) notListed.push(qFrom(i));
    }
  }
  return { listed, notListed, latest };
}

const range = (a: number, b: number) => (a === b ? `${a}` : `${a}-${b}`);

export function eoFlags(eos: Eo[] = getEo().items): DocFlag[] {
  const out: DocFlag[] = [];
  const byYear = new Map<number, Eo[]>();
  for (const e of eos) if (e.year != null && e.number != null) byYear.set(e.year, [...(byYear.get(e.year) ?? []), e]);
  for (const [year, list] of [...byYear].sort((a, b) => b[0] - a[0])) {
    const nums = new Set(list.map((e) => e.number!));
    const lo = Math.min(...nums), hi = Math.max(...nums);
    const runs: [number, number][] = [];
    for (let n = lo; n <= hi; n++) if (!nums.has(n)) { const last = runs.at(-1); if (last && last[1] === n - 1) last[1] = n; else runs.push([n, n]); }
    if (runs.length) {
      const missing = runs.map(([a, b]) => range(a, b)).join(", ");
      const total = runs.reduce((s, [a, b]) => s + b - a + 1, 0);
      const evidence = runs.slice(0, 8).map(([a, b]) => {
        const before = list.filter((e) => e.number! < a).sort((x, y) => y.number! - x.number!)[0];
        return { docId: before.id, page: null, quote: null, value: `No. ${range(a, b)}` };
      });
      out.push({
        id: `eo-number-gap:${year}`, rule: "eo-number-gap", severity: "info",
        title: `${total} order number${total === 1 ? "" : "s"} not listed for ${year}`,
        what: `The official page lists orders from No. ${lo} to No. ${hi} for ${year}; No. ${missing} are not listed on the official page, which does not mean they were not issued.`,
        evidence: [{ docId: list[0].id, page: null, quote: null, value: missing }, ...evidence],
        verify: [VERIFY.list, VERIFY.legal, VERIFY.pdf], references: [LGC], confidence: "medium", disclaimer: DISCLAIMER,
      });
    }
    const seen = new Map<string, Eo[]>();
    for (const e of list) seen.set(`${e.number}${e.suffix ?? ""}`, [...(seen.get(`${e.number}${e.suffix ?? ""}`) ?? []), e]);
    for (const [k, dups] of seen) {
      if (dups.length < 2) continue;
      out.push({
        id: `eo-duplicate:${year}-${k}`, rule: "eo-duplicate", severity: "review",
        title: `Number ${k} of ${year} is listed ${dups.length} times`,
        what: `The official page lists Executive Order No. ${k}, series of ${year}, ${dups.length} times; the entries may be different documents or a repeated posting.`,
        evidence: dups.map((d) => ({ docId: d.id, page: null, quote: d.title, value: d.url })),
        verify: [VERIFY.pdf, VERIFY.list, VERIFY.legal], references: [LGC], confidence: "high", disclaimer: DISCLAIMER,
      });
    }
  }
  return out;
}

export function lgsfFlags(reports: Report[] = getReports().items): DocFlag[] {
  const { listed, notListed } = lgsfQuarters(reports);
  return notListed.map((x) => {
    const near = [...listed.keys()].sort((a, b) => Math.abs(a - qIndex(x)) - Math.abs(b - qIndex(x)))[0];
    return {
      id: `lgsf-quarter-not-listed:${x.year}-Q${x.q}`, rule: "lgsf-quarter-not-listed" as const, severity: "info" as const,
      title: `No LGSF report listed for Q${x.q} ${x.year}`,
      what: `The official page does not list a Local Government Support Fund utilization report for the quarter ended ${quarterEnd(x)}.`,
      evidence: [{ docId: listed.get(near)![0], page: null, quote: null, value: `Q${x.q} ${x.year}` }],
      verify: [VERIFY.list, VERIFY.ppdo, VERIFY.coa], references: [LGC, COA], confidence: "medium" as const, disclaimer: DISCLAIMER,
    };
  });
}

export const allDocFlags = (): DocFlag[] => [...eoFlags(), ...lgsfFlags()];
export const flagsForDoc = (docId: string, flags: DocFlag[] = allDocFlags()) => flags.filter((f) => f.evidence.some((e) => e.docId === docId));

/** Values to fill the {0}, {1} slots of the Filipino title/what templates (gova.flag.<rule>.title / .what). */
export function flagVars(f: DocFlag): string[] {
  const p = f.id.split(":")[1] ?? "";
  if (f.rule === "eo-number-gap") return [p, String(f.evidence[0]?.value ?? ""), String(f.evidence.length)];
  if (f.rule === "eo-duplicate") { const [y, ...k] = p.split("-"); return [k.join("-"), y, String(f.evidence.length)]; }
  const [y, q] = p.split("-"); return [q, y, quarterEnd({ year: +y, q: +q.slice(1) })];
}
