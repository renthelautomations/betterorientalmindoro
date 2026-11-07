import data from "@/data/stats.json";

export const DASH = "-"; // a dash means no data, never zero

export type Datum<T = number> = { value: T; year: number; source: string; citedAs?: string | null; retrievedAt: string; license: string };
export type PopPoint = { year: number; value: number; asOf: string; source: string; retrievedAt: string };
export type Stats = {
  wikidata: string;
  population: PopPoint[];
  incomeClass: Datum<string> | null;
  revenue: Datum | null;
  expenditure: Datum | null;
  assets: Datum | null;
  liabilities: Datum | null;
  ira: Datum | null;
};

const all = data as unknown as { generatedAt: string; province: Stats; municipalities: Record<string, Stats> };

export const getStats = (slug: string): Stats | undefined => all.municipalities[slug];
export const getProvinceStats = (): Stats => all.province;

const ok = (n: number | null | undefined): n is number => typeof n === "number" && Number.isFinite(n);

/** IRA / total income, or null when either is missing or income is not positive. */
export const iraDependency = (ira: number | null | undefined, income: number | null | undefined): number | null =>
  ok(ira) && ok(income) && income > 0 ? ira / income : null;

/** Fractional growth from first to last point. */
export const popGrowth = (pts: { value: number }[]): number | null =>
  pts.length >= 2 && pts[0].value > 0 ? pts[pts.length - 1].value / pts[0].value - 1 : null;

export const fmtInt = (n: number | null | undefined) => (ok(n) ? Math.round(n).toLocaleString("en-PH") : DASH);
export const fmtPct = (f: number | null | undefined, digits = 1) => (ok(f) ? `${(f * 100).toFixed(digits)}%` : DASH);
export const fmtPeso = (n: number | null | undefined) => {
  if (!ok(n)) return DASH;
  if (Math.abs(n) >= 1e9) return `₱${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `₱${(n / 1e6).toFixed(2)}M`;
  return `₱${Math.round(n).toLocaleString("en-PH")}`;
};
