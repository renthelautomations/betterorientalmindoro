"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/i18n";

type Ring = number[][];
type Geom = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Feat = { properties: Record<string, string>; geometry: Geom };
export const RAMP = ["#e3ecf7", "#b7cdea", "#7fa4d6", "#4a79bf", "#2b4fa3"];
const SIDE = ["#a9bddb", "#7f9cc6", "#5877ad", "#34569a", "#1d3a7a"]; // darker twin per step, used for the "walls"
const clean = (n: string) => n.replace(/\s*\(.*\)/, "").replace(/^City of (.*)$/, "$1 City");

/** Quantile break points for the ramp. */
export const breaks = (vals: number[]) => { const v = [...vals].filter((x) => x > 0).sort((a, b) => a - b); return RAMP.slice(1).map((_, i) => v[Math.floor(((i + 1) / RAMP.length) * v.length)] ?? 0); };
export const bin = (b: number[], x: number) => b.filter((c) => x >= c).length;

export const rings = (g: Geom): Ring[] => (g.type === "Polygon" ? g.coordinates : g.coordinates.flat());
/** Centre of the biggest ring's bounding box. Good enough for a label. */
export const centroid = (g: Geom): [number, number] => {
  const r = rings(g).reduce((a, b) => (b.length > a.length ? b : a));
  const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
};

/**
 * Pseudo-3D province map for when WebGL is missing or the real map is still loading.
 * Every town is a raised block: stacked offset copies make the walls, a lighter top carries the population shade.
 */
export default function ReliefSvg({ slugs, values, onSelect, selected }: { slugs: Record<string, string>; values?: Record<string, number>; onSelect?: (slug: string | null) => void; selected?: string | null }) {
  const t = useT();
  const router = useRouter();
  const [feats, setFeats] = useState<Feat[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all(["municipalities", "component_cities"].map((f) => fetch(`/data/${f}.geojson`).then((r) => r.json()))).then(([a, b]) => { if (live) setFeats([...a.features, ...b.features]); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const geo = useMemo(() => {
    if (!feats.length) return null;
    const pts = feats.flatMap((f) => rings(f.geometry).flat());
    const lon0 = Math.min(...pts.map((p) => p[0])), lon1 = Math.max(...pts.map((p) => p[0]));
    const lat0 = Math.min(...pts.map((p) => p[1])), lat1 = Math.max(...pts.map((p) => p[1]));
    const k = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180), S = 560 / (lat1 - lat0), PAD = 28;
    const W = (lon1 - lon0) * k * S + PAD * 2, H = (lat1 - lat0) * S + PAD * 2;
    const proj = ([x, y]: number[]) => [PAD + (x - lon0) * k * S, PAD + (lat1 - y) * S] as const;
    const d = (g: Geom) => rings(g).map((r) => "M" + r.map((p) => proj(p).map((n) => n.toFixed(1)).join(" ")).join("L") + "Z").join("");
    const b = breaks(Object.values(values ?? {}));
    return { W, H, b, items: feats.map((f) => ({ pcode: f.properties.ADM3_PCODE, name: clean(f.properties.ADM3_EN), d: d(f.geometry), c: proj(centroid(f.geometry)), bin: values ? bin(b, values[f.properties.ADM3_PCODE] ?? 0) : 2 })) };
  }, [feats, values]);

  if (!geo) return <div className="h-[60vh] min-h-96 animate-pulse rounded-3xl bg-fiesta-mint motion-reduce:animate-none" aria-hidden />;
  const act = (p: string) => { const s = slugs[p]; if (!s) return; if (onSelect) onSelect(s); else router.push(`/bayan/${s}`); };
  const lifted = (p: string) => hover === p || (selected != null && slugs[p] === selected);
  const ordered = [...geo.items].sort((a, b) => a.c[1] - b.c[1]); // paint north first so southern walls overlap correctly
  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#dff0f4] to-[#c9e3ea] p-2">
      <svg viewBox={`0 0 ${geo.W.toFixed(0)} ${geo.H.toFixed(0)}`} className="mx-auto h-[60vh] min-h-96 w-full" role="group" aria-label={t("home.map.aria")}>
        <defs><filter id="relief-shadow" x="-10%" y="-5%" width="130%" height="120%"><feDropShadow dx="6" dy="14" stdDeviation="9" floodColor="#1b2a4a" floodOpacity=".28" /></filter></defs>
        <g filter="url(#relief-shadow)">
          {ordered.map((t) => {
            const up = lifted(t.pcode) ? 10 : 0;
            return (
              <g key={t.pcode} tabIndex={slugs[t.pcode] ? 0 : -1} role="link" aria-label={t.name} className="cursor-pointer outline-none transition-transform duration-200 focus-visible:[&>path:last-child]:stroke-fiesta-orange"
                style={{ transform: `translateY(${-up}px)` }} onMouseEnter={() => { setHover(t.pcode); onSelect?.(slugs[t.pcode] ?? null); }} onMouseLeave={() => { setHover(null); onSelect?.(null); }}
                onFocus={() => setHover(t.pcode)} onBlur={() => setHover(null)} onClick={() => act(t.pcode)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(t.pcode); } }}>
                {[10, 7, 4].map((o) => <path key={o} d={t.d} transform={`translate(0 ${o})`} fill={lifted(t.pcode) ? "#a63a1c" : SIDE[t.bin]} stroke={SIDE[t.bin]} strokeWidth="1" />)}
                <path d={t.d} fill={lifted(t.pcode) ? "#e8552d" : RAMP[t.bin]} stroke="#fff" strokeWidth="1.800" strokeLinejoin="round" />
              </g>
            );
          })}
        </g>
        {geo.items.map((t) => <text key={t.pcode} x={t.c[0]} y={t.c[1] + 4} textAnchor="middle" className="pointer-events-none fill-[#1b2a4a] text-[12px] font-semibold [paint-order:stroke]" stroke="#fff" strokeWidth="3" strokeLinejoin="round">{t.name}</text>)}
      </svg>
    </div>
  );
}
