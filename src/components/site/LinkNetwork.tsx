"use client";
import { useState } from "react";
import { FIESTA as F } from "@/components/kit/Patterns";
import { useT } from "@/lib/i18n/i18n";

// Copy of the kit Network with role="group" instead of role="img": the kit one puts focusable nodes inside an img role (axe nested-interactive).
// Towns linked by shared surnames. Circular layout, no physics. Hover or focus a town to light up its links.
export type NetNode = { id: string; label: string };
export type NetEdge = { a: string; b: string; weight: number; surnames: string };
export function LinkNetwork({ nodes, edges }: { nodes: NetNode[]; edges: NetEdge[] }) {
  const t = useT();
  const label = new Map(nodes.map((n) => [n.id, n.label]));
  const [active, setActive] = useState<string | null>(null);
  const S = 560, c = S / 2, R = 180;
  const pos = new Map(nodes.map((n, i) => { const t = (i / nodes.length) * Math.PI * 2 - Math.PI / 2; return [n.id, { x: c + R * Math.cos(t), y: c + R * Math.sin(t), t }]; }));
  const deg = new Map<string, number>();
  for (const e of edges) for (const id of [e.a, e.b]) deg.set(id, (deg.get(id) ?? 0) + e.weight);
  const maxW = Math.max(...edges.map((e) => e.weight), 1);
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto h-auto w-full max-w-lg" role="group" aria-label={t("dyn.net.aria")}>
      {edges.map((e) => {
        const p = pos.get(e.a)!, q = pos.get(e.b)!;
        return <path key={e.a + e.b} d={`M${p.x} ${p.y}Q${c} ${c} ${q.x} ${q.y}`} fill="none" stroke={F.blue} strokeWidth={1 + (e.weight / maxW) * 5} strokeLinecap="round" className={`transition-opacity ${active ? (e.a === active || e.b === active ? "opacity-90" : "opacity-[0.06]") : "opacity-25 hover:opacity-90"}`}><title>{`${label.get(e.a)} ${t("dyn.and")} ${label.get(e.b)}: ${e.surnames}`}</title></path>;
      })}
      {nodes.map((n) => {
        const p = pos.get(n.id)!;
        const right = Math.cos(p.t) >= 0;
        return (
          <g key={n.id} tabIndex={0} role="button" aria-label={t("dyn.net.node").replace("{0}", n.label).replace("{1}", String(edges.filter((e) => e.a === n.id || e.b === n.id).length))} className="cursor-pointer outline-none" onMouseEnter={() => setActive(n.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(n.id)} onBlur={() => setActive(null)}>
            <circle cx={p.x} cy={p.y} r={5 + Math.min((deg.get(n.id) ?? 0) / 2, 9)} fill={active === n.id ? F.red : F.orange} stroke="#fff" strokeWidth="2" />
            <text x={p.x + (right ? 1 : -1) * 16} y={p.y + 4} textAnchor={right ? "start" : "end"} className="fill-[#1b2a4a] text-[15px] font-semibold">{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
