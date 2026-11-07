import data from "@/data/hotlines.json";

export type Category = "emergency" | "medical" | "government" | "utility";
// verifiedAt = date the source page was read; confirmed = source is the provincial government site.
export type Hotline = { id: string; scope: string; category: Category; name: string; number: string; source: string; verifiedAt: string; confirmed: boolean };

const all = data as Hotline[];

export const getHotlines = (scope?: string): Hotline[] => (scope ? all.filter((h) => h.scope === scope) : all);

export const groupByCategory = (rows: Hotline[]): Partial<Record<Category, Hotline[]>> => {
  const g: Partial<Record<Category, Hotline[]>> = {};
  for (const h of rows) (g[h.category] ??= []).push(h);
  return g;
};

/** Numbers for one bayan (may be none) plus the province-wide fallback. Never invents: unknown or empty bayan gives local = []. */
export const hotlinesForBayan = (slug?: string) => ({
  local: slug && slug !== "province" ? getHotlines(slug) : [],
  province: getHotlines("province"),
});
