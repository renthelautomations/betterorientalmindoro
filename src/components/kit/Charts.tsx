import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";

// ---------- Ranked horizontal bars ----------
export type BarRow = { label: string; value: number; href?: string };

/** Values are printed as text next to the bars, so the chart reads without seeing the bars. */
export function BarChart({ rows, format, color = "#2b4fa3", highlight }: { rows: BarRow[]; format: (n: number) => string; color?: string; highlight?: string }) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((r) => r.value), 1);
  return (
    <ol className="space-y-1.5">
      {sorted.map((r, i) => {
        const label = r.href ? <Link href={r.href} className="underline-offset-2 hover:underline">{r.label}</Link> : r.label;
        return (
          <li key={r.label} className="grid grid-cols-[1.5rem_8rem_1fr_5.5rem] items-center gap-2 text-sm">
            <span className="text-right text-black/50 tabular-nums">{i + 1}</span>
            <span className="truncate">{label}</span>
            <span className="h-4 rounded-sm bg-black/5" aria-hidden>
              <span className="anim-grow block h-4 rounded-sm" style={{ width: `${(r.value / max) * 100}%`, background: r.label === highlight ? "#d2402f" : color }} />
            </span>
            <span className="text-right tabular-nums">{format(r.value)}</span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Choropleth (server-rendered SVG from the geojson, no WebGL) ----------
type Ring = number[][];
type Geom = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Fc = { features: { properties: Record<string, string>; geometry: Geom }[] };
const load = (f: string): Fc => JSON.parse(readFileSync(join(process.cwd(), "public/data", `${f}.geojson`), "utf8"));
const RAMP = ["#e3ecf7", "#b7cdea", "#7fa4d6", "#4a79bf", "#2b4fa3"];
export type ChoroRow = { pcode: string; name: string; value: number | null; href?: string };

export function Choropleth({ rows, format, unit }: { rows: ChoroRow[]; format: (n: number) => string; unit: string }) {
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
      <svg viewBox={`0 0 ${W.toFixed(0)} ${H.toFixed(0)}`} className="mx-auto h-auto w-full max-w-xs" role="img" aria-label={`Map of Oriental Mindoro colored by ${unit}`}>
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
