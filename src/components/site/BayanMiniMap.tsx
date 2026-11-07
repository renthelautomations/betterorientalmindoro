import { readFileSync } from "node:fs";
import { join } from "node:path";

type Ring = number[][];
type Geom = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Fc = { features: { properties: Record<string, string>; geometry: Geom }[] };
const load = (f: string): Fc => JSON.parse(readFileSync(join(process.cwd(), "public/data", `${f}.geojson`), "utf8"));

/** Server-rendered SVG of one bayan outline with project points (lon/lat, cos-latitude corrected). The list beside it is the content. */
export default function BayanMiniMap({ pcode, name, points }: { pcode: string; name: string; points: { lat: number; lon: number }[] }) {
  const f = [...load("municipalities").features, ...load("component_cities").features].find((x) => x.properties.ADM3_PCODE === pcode);
  if (!f) return null;
  const rings: Ring[] = f.geometry.type === "Polygon" ? f.geometry.coordinates : f.geometry.coordinates.flat();
  const all = rings.flat();
  const lon0 = Math.min(...all.map((p) => p[0])), lon1 = Math.max(...all.map((p) => p[0]));
  const lat0 = Math.min(...all.map((p) => p[1])), lat1 = Math.max(...all.map((p) => p[1]));
  const k = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180);
  const S = 300 / Math.max(lat1 - lat0, (lon1 - lon0) * k);
  const W = (lon1 - lon0) * k * S + 16, H = (lat1 - lat0) * S + 16;
  const X = (x: number) => (8 + (x - lon0) * k * S).toFixed(1), Y = (y: number) => (8 + (lat1 - y) * S).toFixed(1);
  const d = rings.map((r) => "M" + r.map(([x, y]) => `${X(x)} ${Y(y)}`).join("L") + "Z").join("");
  return (
    <svg viewBox={`0 0 ${W.toFixed(0)} ${H.toFixed(0)}`} className="mx-auto h-auto w-full max-w-sm" role="img" aria-label={`Mapa ng ${name} na may ${points.length} na proyektong may coordinates`}>
      <path d={d} fill="#dcefe8" stroke="#1b2a4a" strokeWidth="1.500" strokeLinejoin="round" />
      {points.map((p, i) => <circle key={i} cx={X(p.lon)} cy={Y(p.lat)} r="3.500" fill="#d2402f" stroke="#fff" strokeWidth="1" />)}
    </svg>
  );
}
