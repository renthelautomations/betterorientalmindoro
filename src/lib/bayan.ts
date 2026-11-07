import { getBarangays, getMunicipality } from "./municipalities";
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
