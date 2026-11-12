import data from "@/data/bir.json";

/** BIR tax collection by area and month, 2020-2024, in MILLIONS of pesos, as BetterGov publishes it (CC0). A missing figure is null, never zero. */
export type Area = { region: string; area: string; totals: Record<string, number | null>; months?: Record<string, (number | null)[]> };
export const YEARS: number[] = (data as { years: number[] }).years;
export const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

export const getAreas = () => (data as unknown as { items: Area[] }).items;
export const getBirMeta = () => data as unknown as { source: string; dashboard: string; license: string; unit: string; fetchedAt: string };
export const OM = "Oriental Mindoro";
export const getArea = (name: string) => getAreas().find((a) => a.area === name);

export const inRegion = (a: Area, region = "MIMAROPA") => a.region.toUpperCase().includes(region);
export const yearTotal = (a: Area, y: number): number | null => a.totals[String(y)] ?? null;
export const series = (a: Area, years = YEARS) => years.map((y) => ({ year: y, value: yearTotal(a, y) }));
/** Growth between two years in percent; null if either is missing or the base is zero. */
export const growth = (a: Area, from: number, to: number): number | null => {
  const x = yearTotal(a, from), y = yearTotal(a, to);
  return x == null || y == null || x === 0 ? null : ((y - x) / x) * 100;
};
/** Year-on-year growth for each year after the first. */
export const yoy = (a: Area) => YEARS.slice(1).map((y) => ({ year: y, pct: growth(a, y - 1, y) }));
/** Share of the region's total for a year, counting only areas that have a figure that year. */
export function regionShare(a: Area, year: number, all: Area[] = getAreas()): number | null {
  const v = yearTotal(a, year); if (v == null) return null;
  const sum = all.filter((x) => x.region === a.region).reduce((s, x) => s + (yearTotal(x, year) ?? 0), 0);
  return sum > 0 ? (v / sum) * 100 : null;
}
/** Rank (1 = highest) of an area within its region for a year, with the number of ranked areas. */
export function rankInRegion(a: Area, year: number, all: Area[] = getAreas()): { rank: number; of: number } | null {
  const v = yearTotal(a, year); if (v == null) return null;
  const peers = all.filter((x) => x.region === a.region && yearTotal(x, year) != null).sort((p, q) => yearTotal(q, year)! - yearTotal(p, year)!);
  return { rank: peers.findIndex((x) => x.area === a.area) + 1, of: peers.length };
}
export const monthly = (a: Area, year: number): (number | null)[] => a.months?.[String(year)] ?? Array(12).fill(null);
/** "Palawan (includes City of Puerto Princesa)" -> "Palawan" for compact labels. */
export const shortArea = (s: string) => s.replace(/\s*\(.*\)/, "");

/** Amounts in the data are millions of pesos: 2765.53 -> "₱2.77B", 628.4 -> "₱628.4M", null -> "-". */
export const fmtM = (v: number | null | undefined): string => (v == null ? "-" : v >= 1000 ? `₱${(v / 1000).toFixed(2)}B` : `₱${v.toFixed(1)}M`);
export const fmtPct = (p: number | null | undefined): string => (p == null ? "-" : `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`);
