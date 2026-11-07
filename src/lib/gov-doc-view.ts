import type { Eo, Report, ReportKind } from "./gov";
import type { EoDoc, EoTopic } from "./gov-docs";
import { eoShort } from "./gov-doc-flags";

export const PAGE_SIZE = 10;
/** Orders matching a text, year and topic filter ("" = all). Topic filters need a summary; orders without one only appear under "all". */
export function filterEos(items: Eo[], docs: Map<string, EoDoc>, f: { q: string; year: string; topic: string }) {
  const q = f.q.trim().toLowerCase();
  return items.filter((e) => {
    if (f.year && String(e.year) !== f.year) return false;
    if (f.topic && docs.get(e.id)?.topic !== f.topic) return false;
    if (!q) return true;
    const d = docs.get(e.id);
    return [eoShort(e), e.label, e.title ?? "", d?.summary ?? "", d?.summaryFil ?? ""].some((s) => s.toLowerCase().includes(q));
  });
}
export const pageCount = (n: number, size = PAGE_SIZE) => Math.max(1, Math.ceil(n / size));
export const pageSlice = <T,>(xs: T[], page: number, size = PAGE_SIZE) => xs.slice((page - 1) * size, page * size);

/** Counts per key, keys with no count omitted; sorted by count then key. */
export function countBy<T>(xs: T[], key: (x: T) => string | null) {
  const m = new Map<string, number>();
  for (const x of xs) { const k = key(x); if (k) m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m].map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n || a.k.localeCompare(b.k));
}
export const topicCounts = (items: Eo[], docs: Map<string, EoDoc>) => countBy(items, (e) => docs.get(e.id)?.topic ?? null) as { k: EoTopic; n: number }[];
export const reportKinds: ReportKind[] = ["supplemental-budget", "lgsf", "assistance", "other"];
export const sortByDateDesc = (rs: Report[]) => [...rs].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
/** Bar width in percent; null (unknown) gives null, never 0. */
export const barPct = (v: number | null, max: number) => (v == null || max <= 0 ? null : Math.max(2, Math.round((v / max) * 100)));
export const fmtPeso = (n: number | null) => (n == null ? "-" : "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 2 }));
