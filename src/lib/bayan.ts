import type { Metric } from "@/components/kit/CompareTowns";
import { getBarangays, getMunicipalities, getMunicipality } from "./municipalities";
import { getStats } from "./stats";
import { getProjects } from "./projects";
import { getHotlines } from "./hotlines";
import { getTown, sharedSurnames, titleCase } from "./dynasties";

export type BayanSummary = {
  name: string; slug: string; pcode: string; areaKm2: number; barangays: number;
  population?: number; incomeClass?: string; projectCount: number;
  hotlineCount: number | null; // null = unknown (no municipal rows), never 0
  topSurnames: { surname: string; seats: number }[];
};

export function getBayanSummary(slug: string): BayanSummary | undefined {
  const m = getMunicipality(slug);
  if (!m) return undefined;
  const s = getStats(slug);
  const hot = getHotlines(slug).length;
  return {
    name: m.name, slug, pcode: m.pcode, areaKm2: m.areaKm2, barangays: getBarangays(m.pcode).length,
    population: s?.population.at(-1)?.value,
    incomeClass: s?.incomeClass?.value.replace(/ (municipal|city|provincial) income class/, " klase"),
    projectCount: getProjects().filter((p) => p.municipality === slug && !p.uncertain).length,
    hotlineCount: hot > 0 ? hot : null,
    topSurnames: sharedSurnames(getTown(slug)?.contests ?? []).slice(0, 3).map((r) => ({ surname: titleCase(r.surname), seats: r.seats })),
  };
}

/** CompareTowns metrics for all towns. null = no data (never 0). Project counts only rows assigned to the slug. */
export function bayanMetrics(): Metric[] {
  const ms = getMunicipalities();
  const by = (f: (slug: string, areaKm2: number) => number | null) => Object.fromEntries(ms.map((m) => [m.slug, f(m.slug, m.areaKm2)]));
  return [
    { label: "metric.pop", values: by((s) => getStats(s)?.population.at(-1)?.value ?? null) },
    { label: "metric.area", values: by((_, a) => a) },
    { label: "metric.projects", values: by((s) => getProjects(s).length) },
    { label: "metric.revenue", unit: "peso", values: by((s) => getStats(s)?.revenue?.value ?? null) },
  ];
}

/** Rows for the sortable DataTable (class fields are plain values so a server page can pass them). */
export const bayanRows = () => getMunicipalities().map((m) => {
  const s = getStats(m.slug);
  return { name: m.name, kind: m.isCity ? "Lungsod" : "Bayan", pop: s?.population.at(-1)?.value ?? null, trend: s?.population.map((p) => p.value) ?? null, area: m.areaKm2 };
});
