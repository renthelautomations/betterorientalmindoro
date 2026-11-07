import { readFileSync } from "node:fs";
import { join } from "node:path";

// Copy of the kit Choropleth with role="group" instead of role="img": the kit one wraps links in an img role (axe nested-interactive). ----------
type Ring = number[][];
type Geom = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Fc = { features: { properties: Record<string, string>; geometry: Geom }[] };
const load = (f: string): Fc => JSON.parse(readFileSync(join(process.cwd(), "public/data", `${f}.geojson`), "utf8"));
const RAMP = ["#e3ecf7", "#b7cdea", "#7fa4d6", "#4a79bf", "#2b4fa3"];
export type ChoroRow = { pcode: string; name: string; value: number | null; href?: string };

export default function LinkChoropleth({ rows, format, unit }: { rows: ChoroRow[]; format: (n: number) => string; unit: string }) {
  const feats = [...load("municipalities").features, ...load("component_cities").features];
  const rings = (g: Geom): Ring[] => (g.type === "Polygon" ? g.coordinates : g.coordinates.flat());
  const pts = feats.flatMap((f) => rings(f.geometry).flat());
  const lon0 = Math.min(...pts.map((p) => p[0])), lon1 = Math.max(...pts.map((p) => p[0]));
  const lat0 = Math.min(...pts.map((p) => p[1])), lat1 = Math.max(...pts.map((p) => p[1]));
  const k = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180); // equirectangular, good enough at province scale
  const S = 520 / (lat1 - lat0);
  const W = (lon1 - lon0) * k * S + 8, H = (lat1 - lat0) * S + 8;
  const path = (g: Geom) => rings(g).map((r) => "M" + r.map(([x, y]) => `${(4 + (x - lon0) * k * S).toFixed(1)} ${(4 + (lat1 - y) * S).toFixed(1)}`).join("L") + "Z").join("");

  const vals = rows.map((r) => r.value).filter((v): v is number => v != null).sort((a, b) => a - b);
  const cuts = RAMP.slice(1).map((_, i) => vals[Math.floor(((i + 1) / RAMP.length) * vals.length)]);
  const bin = (v: number) => cuts.filter((c) => v >= c).length;
  const byCode = new Map(rows.map((r) => [r.pcode, r]));

  return (
    <figure>
      <svg viewBox={`0 0 ${W.toFixed(0)} ${H.toFixed(0)}`} className="mx-auto h-auto w-full max-w-xs" role="group" aria-label={`Mapa ng Oriental Mindoro ayon sa ${unit}; bawat bayan ay link`}>
        {feats.map((f) => {
          const r = byCode.get(f.properties.ADM3_PCODE);
          const fill = r?.value != null ? RAMP[bin(r.value)] : "#e5e5e5";
          const shape = <path d={path(f.geometry)} fill={fill} stroke="#fff" strokeWidth="1.500" strokeLinejoin="round" className="transition-opacity hover:opacity-80"><title>{`${r?.name ?? f.properties.ADM3_EN}: ${r?.value != null ? format(r.value) : "no data"}`}</title></path>;
          return r?.href ? <a key={f.properties.ADM3_PCODE} href={r.href}>{shape}</a> : <g key={f.properties.ADM3_PCODE}>{shape}</g>;
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-black/70">
        {RAMP.map((c, i) => (
          <span key={c} className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: c }} />{i === 0 ? `< ${format(cuts[0])}` : i === RAMP.length - 1 ? `≥ ${format(cuts[i - 1])}` : `${format(cuts[i - 1])}–${format(cuts[i])}`}</span>
        ))}
      </figcaption>
    </figure>
  );
}
