import data from "@/data/dpwh.json";

export type Project = {
  id: string; title: string; municipality?: string; uncertain?: boolean; cost?: number; status?: string; year?: number; category?: string;
  lat?: number; lon?: number; start?: string; end?: string; contractor?: string; // start/end: YYYY-MM-DD
};

const all = data as Project[];

export const getProjects = (slug?: string): Project[] => (slug ? all.filter((p) => p.municipality === slug) : all);
export const getProject = (id: string) => all.find((p) => p.id === id);
export const getProjectStats = () => ({ total: all.length, assigned: all.filter((p) => p.municipality).length });

export type ProjectFilter = { bayan?: string; year?: number; status?: string; category?: string; q?: string };

export function filterProjects(rows: Project[], f: ProjectFilter): Project[] {
  const q = f.q?.trim().toLowerCase();
  return rows.filter(
    (p) =>
      (f.bayan == null || p.municipality === f.bayan) &&
      (f.year == null || p.year === f.year) &&
      (f.status == null || p.status === f.status) &&
      (f.category == null || p.category === f.category) &&
      (!q || p.title.toLowerCase().includes(q)),
  );
}

const tally = (vals: (string | number | undefined)[]) => {
  const m = new Map<string | number, number>();
  for (const v of vals) if (v != null && v !== "") m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()];
};
/** [year, count] ascending by year; rows without a year are left out. */
export const countsByYear = (rows: Project[]): [number, number][] => (tally(rows.map((p) => p.year)) as [number, number][]).sort((a, b) => a[0] - b[0]);
/** [status, count] most common first; rows without a status are left out. */
export const countsByStatus = (rows: Project[]): [string, number][] => (tally(rows.map((p) => p.status)) as [string, number][]).sort((a, b) => b[1] - a[1]);

const KEEP = new Set(["RC", "DPWH", "GAA", "PCCP", "MPB", "RWCS", "CSR", "NHS", "BIP", "ICT", "DEO", "II", "III", "IV", "VI", "VII", "VIII", "IX", "XI", "XII"]);
/** ALL-CAPS engineering title to sentence case. Tokens with digits (K0103+000, B00048MR), known abbreviations and dotted initials stay as they are. */
export function cleanTitle(title: string): string {
  const out = title.replace(/[A-Za-z0-9+.]+/g, (t) => (/\d/.test(t) || KEEP.has(t) || /^([A-Z]\.){2,}$/.test(t) ? t : t.toLowerCase()));
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** The n most common categories, most common first. */
export const topCategories = (rows: Project[], n: number): string[] =>
  tally(rows.map((p) => p.category)).sort((a, b) => b[1] - a[1]).slice(0, n).map(([c]) => String(c));

/** Hub URL for a filter state; empty values and page 1 are left out. Key order is fixed. */
export function hubHref(f: { bayan?: string; taon?: string; katayuan?: string; kategorya?: string; q?: string; page?: number }): string {
  const sp = new URLSearchParams();
  for (const k of ["bayan", "taon", "katayuan", "kategorya", "q"] as const) if (f[k]) sp.set(k, f[k]);
  if (f.page && f.page > 1) sp.set("page", String(f.page));
  const s = sp.toString();
  return s ? `/proyekto?${s}` : "/proyekto";
}

/** Whole days between two YYYY-MM-DD dates. */
export const durationDays = (start: string, end: string): number => Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);
