import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getMunicipalities } from "./municipalities";
import { getProjects, type Project } from "./projects";
import { belongsTo, placeProject, type Place } from "./project-places";

export type Brgy = { name: string; code: string; slug: string; town: string; areaKm2: number; rings: [number, number][][] };

type Feat = { properties: Record<string, string | number>; geometry: { type: string; coordinates: unknown } };
const slugify = (n: string) => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

let cache: Brgy[] | undefined;
/** All 426 barangays. slug = name + last 3 digits of the PSGC code, because names repeat inside one town (7 "Poblacion"s). */
export function getAllBarangays(): Brgy[] {
  if (!cache) {
    const fc = JSON.parse(readFileSync(join(process.cwd(), "public/data/barangays.geojson"), "utf8")) as { features: Feat[] };
    const town = new Map(getMunicipalities().map((m) => [m.pcode, m.slug]));
    cache = fc.features.map((f) => {
      const p = f.properties, code = String(p.ADM4_PCODE), g = f.geometry;
      const polys = (g.type === "MultiPolygon" ? g.coordinates : [g.coordinates]) as [number, number][][][];
      return { name: String(p.ADM4_EN), code, slug: `${slugify(String(p.ADM4_EN))}-${code.slice(-3)}`, town: town.get(String(p.ADM3_PCODE)) ?? "", areaKm2: Number(p.AREA_SQKM), rings: polys.map((r) => r[0]) };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  return cache;
}
export const getTownBarangays = (town: string) => getAllBarangays().filter((b) => b.town === town);
export const getBarangay = (town: string, slug: string) => getAllBarangays().find((b) => b.town === town && b.slug === slug);

/** Ray casting; ring of [lon, lat]. */
export function inRing(x: number, y: number, ring: [number, number][]): boolean {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export const contains = (b: Brgy, lon: number, lat: number) => b.rings.some((r) => inRing(lon, lat, r));

const placed = new Map<string, Map<string, Place>>();
/** Where each DPWH project of a town sits, by the one rule in project-places.ts. Cached per town. */
export function placesOf(town: string): Map<string, Place> {
  let m = placed.get(town);
  if (!m) { const brgs = getTownBarangays(town); m = new Map(getProjects(town).map((p) => [p.id, placeProject(p, brgs, (b, x, y) => contains(b, x, y))])); placed.set(town, m); }
  return m;
}
/** DPWH projects in this barangay: named in the title, else holding the GPS point. */
export const projectsIn = (b: Brgy): Project[] => { const pl = placesOf(b.town); return getProjects(b.town).filter((p) => belongsTo(pl.get(p.id)!, b.code)); };

/** SVG paths for every barangay of the town, fitted to size x size. */
export function townShapes(town: string, size = 320) {
  const list = getTownBarangays(town);
  const pts = list.flatMap((b) => b.rings.flat());
  const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180), s = (size - 16) / Math.max((x1 - x0) * k, y1 - y0);
  const ox = (size - (x1 - x0) * k * s) / 2, oy = (size - (y1 - y0) * s) / 2;
  const P = (lon: number, lat: number): [number, number] => [ox + (lon - x0) * k * s, oy + (y1 - lat) * s];
  return {
    P,
    shapes: list.map((b) => ({ b, d: b.rings.map((r) => "M" + r.map(([x, y]) => P(x, y).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z").join("") })),
  };
}

/** The barangay's own outline as one SVG path, scaled to fit a size x size box with a small margin. */
export function shapePath(b: Brgy, size = 64, pad = 6) {
  const pts = b.rings.flat();
  const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180), s = (size - pad * 2) / Math.max((x1 - x0) * k, y1 - y0, 1e-9);
  const ox = (size - (x1 - x0) * k * s) / 2, oy = (size - (y1 - y0) * s) / 2;
  return b.rings.map((r) => "M" + r.map(([x, y]) => `${(ox + (x - x0) * k * s).toFixed(1)} ${(oy + (y1 - y) * s).toFixed(1)}`).join("L") + "Z").join("");
}
