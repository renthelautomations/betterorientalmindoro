// Pure logic for the procurement pages: merge listed documents with OCR facts, group them into project cards, filter and count.
// No JSON imports here so client components can use it; data getters live in gov-proc-data.ts.
// A missing value is null and shown as a dash, never zero. Only high-confidence amounts feed totals.
import type { Flag } from "./gov-flags";

export type Stage = "itb" | "reso" | "noa" | "coa" | "ntp";
/** Real order of stages. "coa" on the official site is the signed contract agreement. */
export const STAGES: readonly Stage[] = ["itb", "reso", "noa", "coa", "ntp"];
export type Conf = "high" | "medium" | "low";
export type Listed = { id: string; refNo: string | null; type: string; title: string; date: string | null; url: string | null; town: string | null; work: string };
export type Extracted = {
  id: string; ocr?: boolean; pageCount?: number | null; fields?: Record<string, unknown> | null; confidence?: Record<string, string> | null;
  evidence?: { field: string; page: number | null; quote: string }[] | null; summary?: string | null; summaryFil?: string | null;
};
export type DocView = Listed & {
  ocr: boolean; pageCount: number | null; fields: Record<string, unknown>; confidence: Record<string, string>;
  evidence: { field: string; page: number | null; quote: string }[]; summary: string | null; summaryFil: string | null;
};
export type Money = { v: number; conf: Conf } | null;
export type Name = { v: string; conf: Conf } | null;
export type Card = {
  slug: string; refNo: string; title: string; town: string | null; townName: string | null; work: string;
  stages: Record<Stage, { id: string; date: string | null } | null>;
  firstDate: string | null; abc: Money; price: Money; contractor: Name; bidType: Name; flags: number; docs: number; read: number;
};

export function mergeDocs(listed: Listed[], extracted: Extracted[]): DocView[] {
  const ex = new Map(extracted.map((e) => [e.id, e]));
  return listed.map((l) => {
    const e = ex.get(l.id);
    return { ...l, ocr: !!e?.ocr, pageCount: e?.pageCount ?? null, fields: e?.fields ?? {}, confidence: e?.confidence ?? {}, evidence: e?.evidence ?? [], summary: e?.summary ?? null, summaryFil: e?.summaryFil ?? null };
  });
}

/** URL-safe project key: "CW2026 118" -> "CW2026-118". */
export const slugRef = (ref: string) => ref.trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const stageIndex = (t: string) => { const i = STAGES.indexOf(t as Stage); return i < 0 ? 99 : i; };
/** Documents of one project in the real stage order, then by date. */
export const sortDocs = <T extends { type: string; date: string | null; id: string }>(ds: T[]) =>
  [...ds].sort((a, b) => stageIndex(a.type) - stageIndex(b.type) || (a.date ?? "").localeCompare(b.date ?? "") || a.id.localeCompare(b.id));

const PREFIX = /^IB\s*NO\.?[\s-]*CW[\s-]*\d{4}[\s-]*\S{3}(?:\s+[A-Z])?(?=\s|$)\s*(?:(?:ITB|RESO|NOA|NTP|COA|CA)\b\.?\s*)?/i;
/** Official title without the "IB No. ... ITB" prefix; falls back to the full title. */
export const plainTitle = (t: string) => t.replace(PREFIX, "").trim() || t;
export const isShouting = (t: string) => { const l = t.replace(/[^A-Za-z]/g, ""); return l.length > 12 && l.replace(/[^A-Z]/g, "").length / l.length > 0.8; };

const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null);
const str = (x: unknown): string | null => (typeof x === "string" && x.trim() ? x.trim() : null);
const conf = (d: DocView, f: string): Conf => (d.confidence[f] === "high" ? "high" : d.confidence[f] === "medium" ? "medium" : "low");

function pick<V>(docs: DocView[], spec: [Stage, string][], get: (x: unknown) => V | null): { v: V; conf: Conf } | null {
  const c: { v: V; conf: Conf }[] = [];
  for (const [t, f] of spec) for (const d of docs) if (d.type === t) { const v = get(d.fields[f]); if (v != null && conf(d, f) !== "low") c.push({ v, conf: conf(d, f) }); }
  return c.find((x) => x.conf === "high") ?? c[0] ?? null;
}
export const pickMoney = (docs: DocView[], spec: [Stage, string][]): Money => pick(docs, spec, num);
export const pickText = (docs: DocView[], spec: [Stage, string][]): Name => pick(docs, spec, str);

export const ABC_SPEC: [Stage, string][] = [["itb", "abc"], ["coa", "abc"]];
export const PRICE_SPEC: [Stage, string][] = [["noa", "contractPrice"], ["coa", "contractPrice"], ["reso", "bidAmount"]];
export const CONTRACTOR_SPEC: [Stage, string][] = [["noa", "contractor"], ["coa", "contractor"], ["reso", "winner"], ["ntp", "contractor"]];

export function stagesOf(docs: DocView[]): Card["stages"] {
  const out = { itb: null, reso: null, noa: null, coa: null, ntp: null } as Card["stages"];
  for (const d of sortDocs(docs)) if (d.type in out && !out[d.type as Stage]) out[d.type as Stage] = { id: d.id, date: d.date };
  return out;
}

export function buildCards(docs: DocView[], flagCount: Record<string, number>, townName: (slug: string) => string | undefined, title: (ds: DocView[]) => string = (ds) => plainTitle((ds.find((d) => d.type === "itb") ?? ds[0]).title)): Card[] {
  const g = new Map<string, DocView[]>();
  for (const d of docs) if (d.refNo) g.set(d.refNo, [...(g.get(d.refNo) ?? []), d]);
  const cards: Card[] = [];
  for (const [refNo, ds] of g) {
    const stages = stagesOf(ds);
    const dates = Object.values(stages).map((s) => s?.date).filter((x): x is string => !!x).sort();
    const town = ds.find((d) => d.town)?.town ?? null;
    cards.push({
      slug: slugRef(refNo), refNo, title: title(ds), town, townName: town ? townName(town) ?? null : null,
      work: ds.find((d) => d.work && d.work !== "other")?.work ?? ds[0].work ?? "other", stages, firstDate: dates[0] ?? null,
      abc: pickMoney(ds, ABC_SPEC), price: pickMoney(ds, PRICE_SPEC), contractor: pickText(ds, CONTRACTOR_SPEC), bidType: pickText(ds, [["noa", "bidType"]]),
      flags: flagCount[refNo] ?? 0, docs: ds.length, read: ds.filter((d) => d.ocr).length,
    });
  }
  return cards.sort((a, b) => (b.firstDate ?? "").localeCompare(a.firstDate ?? "") || a.refNo.localeCompare(b.refNo));
}

// ---- filters ----
export type StatusFilter = "" | "waiting" | "award" | "contract" | "ntp";
export type Filters = { q: string; town: string; work: string; status: StatusFilter; year: string; month: string; flagged: boolean };
export const NO_FILTERS: Filters = { q: "", town: "", work: "", status: "", year: "", month: "", flagged: false };

export function filterCards(cards: Card[], f: Filters): Card[] {
  const q = f.q.trim().toLowerCase();
  return cards.filter((c) => {
    if (q && !`${c.refNo} ${c.title} ${c.townName ?? ""} ${c.contractor?.v ?? ""}`.toLowerCase().includes(q)) return false;
    if (f.town && c.town !== f.town) return false;
    if (f.work && c.work !== f.work) return false;
    if (f.year && c.firstDate?.slice(0, 4) !== f.year) return false;
    if (f.month && c.firstDate?.slice(5, 7) !== f.month) return false;
    if (f.flagged && c.flags === 0) return false;
    const s = c.stages;
    if (f.status === "waiting" && (s.reso || s.noa)) return false;
    if (f.status === "award" && !(s.reso || s.noa)) return false;
    if (f.status === "contract" && !s.coa) return false;
    if (f.status === "ntp" && !s.ntp) return false;
    return true;
  });
}

// ---- aggregations ----
const tally = (keys: (string | null | undefined)[]) => {
  const m = new Map<string, number>();
  for (const k of keys) if (k) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
};
export const countsDesc = (keys: (string | null | undefined)[]) => [...tally(keys)].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
export const countsByMonth = (cards: Card[]) => [...tally(cards.map((c) => c.firstDate?.slice(0, 7)))].map(([key, n]) => ({ key, n })).sort((a, b) => a.key.localeCompare(b.key));
export const funnel = (cards: Card[]) => STAGES.map((s) => ({ stage: s, n: cards.filter((c) => c.stages[s]).length }));
/** Totals use ONLY high-confidence amounts; `n` says how many projects that is. */
export function abcTotal(cards: Card[]) {
  const hi = cards.filter((c) => c.abc?.conf === "high");
  return { total: hi.reduce((s, c) => s + c.abc!.v, 0), n: hi.length };
}
export const years = (cards: Card[]) => [...new Set(cards.map((c) => c.firstDate?.slice(0, 4)).filter((x): x is string => !!x))].sort().reverse();

// ---- formatting ----
export const php = (n: number | null | undefined) => (n == null ? "–" : "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
export const phpShort = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)} B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)} M` : "₱" + Math.round(n).toLocaleString("en-PH"));
export const fmtDate = (d: string | null | undefined) => (d && /^\d{4}-\d{2}-\d{2}/.test(d) ? new Date(d.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "–");
export const fmtMonth = (ym: string) => new Date(ym + "-01T00:00:00Z").toLocaleDateString("en-PH", { year: "numeric", month: "short", timeZone: "UTC" });
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** Days between consecutive listed stages that both have dates. */
export function stageGaps(stages: Card["stages"]) {
  const have = STAGES.filter((s) => stages[s]?.date);
  return have.slice(1).map((to, i) => ({ from: have[i], to, days: daysBetween(stages[have[i]]!.date!, stages[to]!.date!) }));
}

// ---- flags ----
export const RULES = ["price-over-abc", "dates-out-of-order", "single-bid", "award-concentration", "no-award-listed", "ref-number-anomaly"] as const;
/** Flags with no refNo are aggregates (about the whole set), shown once. */
export function groupFlags(flags: Flag[]) {
  const byRule: Record<string, Flag[]> = {};
  for (const f of flags) (byRule[f.rule] ??= []).push(f);
  return { byRule, aggregate: flags.filter((f) => !f.refNo) };
}
export const flagCounts = (flags: Flag[]) => { const m: Record<string, number> = {}; for (const f of flags) if (f.refNo) m[f.refNo] = (m[f.refNo] ?? 0) + 1; return m; };

// ---- document facts ----
/** One chip for a whole document: null if nothing was read; high only when every read field is high. */
export function docConf(d: Pick<DocView, "fields" | "confidence">): Conf | null {
  const cs = Object.keys(d.fields).filter((k) => d.fields[k] != null).map((k) => d.confidence[k]);
  if (!cs.length) return null;
  if (cs.every((c) => c === "high")) return "high";
  return cs.some((c) => c === "high" || c === "medium") ? "medium" : "low";
}
const MONEY = new Set(["abc", "abcWords", "contractPrice", "contractPriceWords", "bidAmount"]);
const DATES = new Set(["date", "startDate"]);
const STAMPS = new Set(["bidDeadline", "bidOpening"]);
const ENUMS = new Set(["bidType", "kind", "documentKind"]);
/** A fact for display: `text` is shown as is, `key` is a dictionary key to translate. Null values are not shown (dash). */
export function fieldValue(name: string, v: unknown): { text?: string; key?: string } | null {
  if (v == null || v === "") return null;
  if (typeof v === "boolean") return { key: v ? "govb.val.true" : "govb.val.false" };
  if (typeof v === "number") return { text: MONEY.has(name) ? php(v) : v.toLocaleString("en-PH") };
  const s = String(v);
  if (DATES.has(name)) return { text: fmtDate(s) };
  if (STAMPS.has(name)) return { text: fmtDate(s) + (s.length > 10 ? ", " + s.slice(11, 16) : "") };
  if (ENUMS.has(name)) return { key: `govb.val.${s}` };
  return { text: s };
}
