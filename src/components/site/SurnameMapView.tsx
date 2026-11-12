"use client";
import { useState } from "react";
import Link from "next/link";
import { FIESTA as F } from "@/components/kit/Patterns";
import { T, useT } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";

export type MapTown = { slug: string; name: string; d: string; x: number; y: number };
export type MapEdge = { a: string; b: string; weight: number; surnames: string[] };
const cap = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function SurnameMapView({ viewBox, towns, edges }: { viewBox: string; towns: MapTown[]; edges: MapEdge[] }) {
  const t = useT();
  const [active, setActive] = useState<string | null>(null);
  const pos = new Map(towns.map((x) => [x.slug, x]));
  const linked = new Set(edges.flatMap((e) => [e.a, e.b]));
  const maxW = Math.max(...edges.map((e) => e.weight), 1);
  const hot = (e: MapEdge) => !active || e.a === active || e.b === active;
  const shown = active ? edges.filter((e) => e.a === active || e.b === active) : [];
  const arc = (e: MapEdge) => {
    const p = pos.get(e.a)!, q = pos.get(e.b)!, mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
    const bow = Math.min(len * 0.28, 90); // bulge sideways so crossing arcs stay readable
    return `M${p.x} ${p.y}Q${mx - (dy / len) * bow} ${my + (dx / len) * bow} ${q.x} ${q.y}`;
  };
  return (
    <figure>
      <svg viewBox={viewBox} className="mx-auto h-auto w-full max-w-xl" role="group" aria-label={t("dyn.net.aria")}>
        <defs><pattern id="sm-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.6" fill={F.blue} opacity=".12" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#sm-dots)" />
        {towns.map((x) => (
          <Link key={x.slug} href={`/dynasties/${x.slug}`} aria-label={`${t("dyn.map.open")}: ${x.name}`} onMouseEnter={() => setActive(x.slug)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(x.slug)} onBlur={() => setActive(null)}>
            <path d={x.d} strokeLinejoin="round" strokeWidth="1.6" stroke="#fff" fill={x.slug === active ? F.orange : linked.has(x.slug) ? "#b7cdea" : F.mint} className="transition-colors"><title>{x.name}</title></path>
          </Link>
        ))}
        <g className="pointer-events-none">
          {edges.map((e) => (
            <path key={e.a + e.b} d={arc(e)} fill="none" stroke={F.navy} strokeLinecap="round" strokeWidth={2 + (e.weight / maxW) * 5} opacity={active ? (hot(e) ? 0.9 : 0.06) : 0.55} className="transition-opacity" />
          ))}
          {towns.filter((x) => linked.has(x.slug)).map((x) => <circle key={x.slug} cx={x.x} cy={x.y} r={x.slug === active ? 8 : 6} fill={F.orange} stroke="#fff" strokeWidth="2.5" />)}
          {towns.map((x) => {
            const on = linked.has(x.slug), hl = x.slug === active || shown.some((e) => e.a === x.slug || e.b === x.slug);
            return <text key={x.slug} x={x.x} y={x.y - (on ? 12 : 4)} textAnchor="middle" stroke="#fff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round" className={`${on || hl ? "fill-[#1b2a4a] font-bold" : "fill-[#5b6577] font-medium"} text-[13px]`}>{x.name}</text>;
          })}
        </g>
      </svg>
      <figcaption className="mt-3 text-sm" aria-live="polite">
        {shown.length ? (
          <ul className="space-y-1">{shown.map((e) => <li key={e.a + e.b}><b>{pos.get(e.a)!.name}</b> <T k="dyn.and" /> <b>{pos.get(e.b)!.name}</b>: {e.surnames.map(cap).join(", ")} ({e.weight})</li>)}</ul>
        ) : active ? <TF k="dyn.map.none" v={[pos.get(active)!.name]} /> : <span className="text-black/70"><T k="dyn.map.hint" /></span>}
      </figcaption>
      <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-black/70">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: "#b7cdea" }} /><T k="dyn.map.linked" /></span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: F.mint }} /><T k="dyn.map.unlinked" /></span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 rounded" style={{ background: F.navy }} /><T k="dyn.map.line" /></span>
      </p>
    </figure>
  );
}
