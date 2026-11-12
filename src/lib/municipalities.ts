import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Municipality = { slug: string; name: string; pcode: string; areaKm2: number; isCity: boolean };

type Fc = { features: { properties: Record<string, string | number> }[] };
const load = (f: string): Fc => JSON.parse(readFileSync(join(process.cwd(), "public/data", `${f}.geojson`), "utf8"));

// "Bulalacao (San Pedro)" -> "Bulalacao"; "City of Calapan (Capital)" -> "Calapan City"
const clean = (n: string) => {
  const base = n.replace(/\s*\(.*\)/, "").trim();
  return base.startsWith("City of ") ? `${base.slice(8)} City` : base;
};
const slugify = (n: string) => n.toLowerCase().replace(/\s+/g, "-");

let cache: Municipality[] | undefined;

export function getMunicipalities(): Municipality[] {
  cache ??= [
    ...load("municipalities").features.map((f) => ({ f, isCity: false })),
    ...load("component_cities").features.map((f) => ({ f, isCity: true })),
  ]
    .map(({ f, isCity }) => {
      const name = clean(String(f.properties.ADM3_EN));
      return { slug: slugify(name), name, pcode: String(f.properties.ADM3_PCODE), areaKm2: Math.round(Number(f.properties.AREA_SQKM)), isCity };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export const getMunicipality = (slug: string) => getMunicipalities().find((m) => m.slug === slug);

export const getBarangays = (pcode: string): string[] =>
  load("barangays")
    .features.filter((f) => f.properties.ADM3_PCODE === pcode)
    .map((f) => String(f.properties.ADM4_EN))
    .sort((a, b) => a.localeCompare(b));

type Geom = { coordinates: unknown };
const walk = (c: unknown, f: (x: number, y: number) => void): void => { if (Array.isArray(c) && typeof c[0] === "number") f(c[0], c[1] as number); else if (Array.isArray(c)) c.forEach((i) => walk(i, f)); };

/** [west, south, east, north] of one town or city outline, for fitting a map to it. */
export function getBounds(pcode: string): [number, number, number, number] | undefined {
  const b: [number, number, number, number] = [180, 90, -180, -90];
  for (const f of ["municipalities", "component_cities"]) {
    for (const ft of (load(f) as unknown as { features: { properties: Record<string, string | number>; geometry: Geom }[] }).features) {
      if (ft.properties.ADM3_PCODE !== pcode) continue;
      walk(ft.geometry.coordinates, (x, y) => { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); });
    }
  }
  return b[0] <= b[2] ? b : undefined;
}
