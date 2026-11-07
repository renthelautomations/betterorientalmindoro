"use client";
import { useState } from "react";
import { useT } from "./i18n";

export type Series = { name: string; points: { year: number; value: number }[] };

/** One line, picked from a list. Always starts at zero so growth is not exaggerated. */
export default function LineChart({ series, label }: { series: Series[]; label: string }) {
  const t = useT();
  const [name, setName] = useState(series[0]?.name);
  const s = series.find((x) => x.name === name) ?? series[0];
  if (!s || s.points.length < 2) return <p className="text-sm text-black/60">Walang sapat na datos.</p>;
  const W = 560, H = 280, L = 52, R = 20, T = 22, B = 38;
  const xs = s.points.map((p) => p.year), ys = s.points.map((p) => p.value);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const raw = (Math.max(...ys) * 1.05) / 5, mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag, ymax = Math.ceil((Math.max(...ys) * 1.05) / step) * step;
  const X = (v: number) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const Y = (v: number) => T + (1 - v / ymax) * (H - T - B);
  const d = s.points.map((p, i) => `${i ? "L" : "M"}${X(p.year).toFixed(1)} ${Y(p.value).toFixed(1)}`).join("");
  const area = `${d}L${X(x1)} ${Y(0)}L${X(x0)} ${Y(0)}Z`;
  const ticks = Array.from({ length: Math.round(ymax / step) + 1 }, (_, i) => i * step);
  const last = s.points[s.points.length - 1];
  return (
    <div>
      <label className={`mb-3 items-center gap-2 text-sm ${series.length > 1 ? "flex" : "hidden"}`}>
        <span className="font-medium">{t(label)}</span>
        <select value={s.name} onChange={(e) => setName(e.target.value)} className="min-h-11 rounded-lg border border-black/20 bg-white px-3">
          {series.map((x) => <option key={x.name}>{x.name}</option>)}
        </select>
      </label>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${s.name}: ${s.points.map((p) => `${p.year} ${p.value.toLocaleString("en-PH")}`).join(", ")}`}>
        {ticks.map((t) => (
          <g key={t}><line x1={L} x2={W - R} y1={Y(t)} y2={Y(t)} stroke="#000" opacity=".08" /><text x={L - 8} y={Y(t) + 4} textAnchor="end" className="fill-black/60 text-[14px]">{t >= 1000 ? `${t / 1000}k` : t}</text></g>
        ))}
        <path className="anim-fade" d={area} fill="#2b4fa3" opacity=".12" />
        <path className="anim-draw" pathLength={1} d={d} fill="none" stroke="#2b4fa3" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {s.points.map((p) => (
          <g key={p.year}>
            <circle cx={X(p.year)} cy={Y(p.value)} r="4.500" fill="#fff" stroke="#2b4fa3" strokeWidth="2.500"><title>{`${p.year}: ${p.value.toLocaleString("en-PH")}`}</title></circle>
            <text x={X(p.year)} y={H - 12} textAnchor="middle" className="fill-black/60 text-[14px]">{p.year}</text>
          </g>
        ))}
        <text x={X(last.year)} y={Y(last.value) - 12} textAnchor="end" className="fill-[#1b2a4a] text-[15px] font-bold">{last.value.toLocaleString("en-PH")}</text>
      </svg>
    </div>
  );
}
