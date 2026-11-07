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
