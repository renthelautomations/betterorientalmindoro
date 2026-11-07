// Compares the official facts (gov.ormindoro.gov.ph/about) with our own boundary data.
import { getFacts, type Fact } from "./gov";
import { getBarangays, getMunicipalities } from "./municipalities";

export type CheckRow = { label: string; official: number | null; ours: number | null; status: "match" | "close" | "differs" | "unknown" };
/** Areas within 1% of each other are "close" (our areas come from rounded boundary polygons, theirs from the PPDO). */
export const AREA_TOLERANCE = 0.01;

export type Ours = { municipalities: number; cities: number; areaKm2: number; barangays: number };
export function ourData(): Ours {
  const all = getMunicipalities();
  return {
    municipalities: all.filter((m) => !m.isCity).length,
    cities: all.filter((m) => m.isCity).length,
    areaKm2: all.reduce((s, m) => s + m.areaKm2, 0),
    barangays: all.reduce((s, m) => s + getBarangays(m.pcode).length, 0),
  };
}

const row = (label: string, official: number | null, ours: number | null, tol = 0): CheckRow => {
  if (official == null || ours == null) return { label, official, ours, status: "unknown" };
  const diff = Math.abs(official - ours);
  return { label, official, ours, status: diff === 0 ? "match" : diff <= official * tol ? "close" : "differs" };
};

export function crossCheck(facts: Fact[] = getFacts().items, ours: Ours = ourData()): CheckRow[] {
  const f = (k: string) => facts.find((x) => x.key === k)?.value ?? null;
  return [
    row("Municipalities (excluding the component city)", f("municipalities"), ours.municipalities),
    row("Component cities", f("componentCities"), ours.cities),
    row("Barangays", f("barangays"), ours.barangays),
    row("Land area (sq km, within 1%)", f("areaKm2"), ours.areaKm2, AREA_TOLERANCE),
  ];
}
