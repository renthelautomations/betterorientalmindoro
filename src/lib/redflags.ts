import data from "@/data/redflags.json";
import basket from "@/data/redflags-basket.json";

/** FY2027 project rows of Oriental Mindoro in the programs of the PBC red-flag basket that list projects one by one. Amounts are allocations in the documents, not spending. */
export type Row = {
  id: string; dataset: "dpwh" | "fmr" | "hfep" | "nia"; title: string; program: string | null; pap: string | null; office: string | null;
  town: string | null; group: "house_only" | "nep_only" | "unchanged" | "increased" | "decreased"; held: boolean; flags: string[];
  nep: number | null; house: number | null; delta: number | null; pages: { nep: string | null; house: string | null }; url: string;
};
export const GROUPS = ["house_only", "increased", "unchanged", "decreased", "nep_only"] as const;
export type Group = (typeof GROUPS)[number];

export const getRows = () => (data as unknown as { items: Row[] }).items;
export const getMeta = () => ({ builtAt: (data as { builtAt: string }).builtAt, source: (data as { source: string }).source, docs: (data as { docs: string }).docs, repo: (data as { repo: string }).repo });
export const getBasket = () => basket;

/** Program shown to readers: DPWH rows by their published program, other datasets by what they are. */
export const programOf = (r: Pick<Row, "dataset" | "program">): string => (r.dataset === "dpwh" ? (r.program ?? "DPWH") : r.dataset === "fmr" ? "fmr" : r.dataset === "hfep" ? "hfep" : "nia");

export type Totals = { projects: number; nep: number; house: number; houseOnly: number; held: number };
/** NEP and House totals are two versions of one budget: they are reported side by side, never added. A row with no figure counts nothing, never zero. */
export function totals(rows: Row[]): Totals {
  return {
    projects: rows.length,
    nep: rows.reduce((a, r) => a + (r.nep ?? 0), 0),
    house: rows.reduce((a, r) => a + (r.house ?? 0), 0),
    houseOnly: rows.filter((r) => r.group === "house_only").length,
    held: rows.filter((r) => r.held).length,
  };
}
export function byProgram(rows: Row[]): { program: string; t: Totals }[] {
  const m = new Map<string, Row[]>();
  for (const r of rows) m.set(programOf(r), [...(m.get(programOf(r)) ?? []), r]);
  return [...m].map(([program, rs]) => ({ program, t: totals(rs) })).sort((a, b) => b.t.house - a.t.house || b.t.nep - a.t.nep);
}
export function byTown(rows: Row[]): { town: string | null; t: Totals }[] {
  const m = new Map<string | null, Row[]>();
  for (const r of rows) m.set(r.town, [...(m.get(r.town) ?? []), r]);
  return [...m].map(([town, rs]) => ({ town, t: totals(rs) })).sort((a, b) => b.t.projects - a.t.projects);
}

export type Filter = { group?: Group; program?: string; town?: string; q?: string };
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function filterRows(rows: Row[], f: Filter): Row[] {
  const q = f.q ? fold(f.q.trim()).split(/\s+/).filter(Boolean) : [];
  return rows.filter((r) => (!f.group || r.group === f.group) && (!f.program || programOf(r) === f.program) && (!f.town || r.town === f.town) && q.every((w) => fold(`${r.title} ${r.program ?? ""} ${r.pap ?? ""}`).includes(w)));
}
export const pageOf = <T,>(rows: T[], page: number, size = 10) => { const last = Math.max(1, Math.ceil(rows.length / size)); const p = Math.min(Math.max(1, page), last); return { page: p, last, rows: rows.slice((p - 1) * size, p * size) }; };
