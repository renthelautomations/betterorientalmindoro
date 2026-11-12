import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getMunicipalities } from "@/lib/municipalities";
import SurnameMapView, { type MapEdge, type MapTown } from "./SurnameMapView";

type Ring = number[][];
type Geom = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Fc = { features: { properties: Record<string, string>; geometry: Geom }[] };
const load = (f: string): Fc => JSON.parse(readFileSync(join(process.cwd(), "public/data", `${f}.geojson`), "utf8"));
const rings = (g: Geom): Ring[] => (g.type === "Polygon" ? g.coordinates : g.coordinates.flat());

/** Province map with the shared-surname links drawn as arcs between town centres. Geometry is computed here, hover and focus in the client view. */
export default function SurnameMap({ edges }: { edges: { a: string; b: string; weight: number; surnames: string[] }[] }) {
  const feats = [...load("municipalities").features, ...load("component_cities").features];
  const pts = feats.flatMap((f) => rings(f.geometry).flat());
  const lon0 = Math.min(...pts.map((p) => p[0])), lon1 = Math.max(...pts.map((p) => p[0]));
  const lat0 = Math.min(...pts.map((p) => p[1])), lat1 = Math.max(...pts.map((p) => p[1]));
  const k = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180), S = 560 / (lat1 - lat0), pad = 70;
  const X = (x: number) => pad + (x - lon0) * k * S, Y = (y: number) => 14 + (lat1 - y) * S;
  const W = (lon1 - lon0) * k * S + pad * 2, H = (lat1 - lat0) * S + 28;
  const bySlug = new Map(getMunicipalities().map((m) => [m.pcode, m]));
  const towns: MapTown[] = feats.map((f) => {
    const m = bySlug.get(f.properties.ADM3_PCODE)!;
    const rs = rings(f.geometry);
    const big = rs.reduce((a, r) => (r.length > a.length ? r : a), rs[0]); // centre of the main landmass
    const cx = big.reduce((s, p) => s + p[0], 0) / big.length, cy = big.reduce((s, p) => s + p[1], 0) / big.length;
    return { slug: m.slug, name: m.name, d: rs.map((r) => "M" + r.map(([x, y]) => `${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join("L") + "Z").join(""), x: X(cx), y: Y(cy) };
  });
  const E: MapEdge[] = edges.map((e) => ({ ...e }));
  return <SurnameMapView viewBox={`0 0 ${W.toFixed(0)} ${H.toFixed(0)}`} towns={towns} edges={E} />;
}
