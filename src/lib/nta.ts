import data from "@/data/nta.json";

/** National Tax Allotment (NTA) share per LGU, in PESOS, from the DBM COMPASS public export. Later years may be proposed, not final: say so where shown. */
export type Lgu = { name: string; kind: "province" | "city" | "municipality"; amounts: Record<string, number> };
const d = data as unknown as { source: string; docs: string; export: string; unit: string; years: number[]; fetchedAt: string; province: Lgu; city: Lgu; municipalities: Lgu[] };

export const NTA_YEARS = d.years;
export const getNtaMeta = () => ({ source: d.source, docs: d.docs, fetchedAt: d.fetchedAt });
export const getProvince = () => d.province;
/** Calapan first (it is a city), then the towns from largest to smallest in the latest year. */
export const getLgus = (): Lgu[] => [d.city, ...d.municipalities];
export const amount = (l: Lgu, y: number): number | null => l.amounts[String(y)] ?? null;
export const ntaChange = (l: Lgu, from: number, to: number): number | null => {
  const a = amount(l, from), b = amount(l, to);
  return a == null || b == null || a === 0 ? null : ((b - a) / a) * 100;
};
