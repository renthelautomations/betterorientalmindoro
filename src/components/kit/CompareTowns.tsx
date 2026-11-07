"use client";
import Dropdown from "@/components/site/Dropdown";
import { useState } from "react";
import { useT } from "@/lib/i18n/i18n";

export type Metric = { label: string; unit?: "peso" | "pct"; values: Record<string, number | null> };
const fmt = (n: number | null, unit?: string) => (n == null ? "-" : unit === "peso" ? `₱${n >= 1e9 ? (n / 1e9).toFixed(2) + "B" : n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : Math.round(n).toLocaleString("en-PH")}` : unit === "pct" ? `${(n * 100).toFixed(1)}%` : Math.round(n).toLocaleString("en-PH"));

/** Two towns, mirrored bars per metric. Each row is scaled to the larger of the two, so only same-row bars compare. */
export default function CompareTowns({ towns, metrics, initial }: { towns: { slug: string; name: string }[]; metrics: Metric[]; initial: [string, string] }) {
  const t = useT();
  const [a, setA] = useState(initial[0]);
  const [b, setB] = useState(initial[1]);
  const name = (s: string) => towns.find((t) => t.slug === s)?.name ?? s;
  const sel = (id: string, v: string, set: (s: string) => void, color: string) => (
    <label className="flex items-center gap-2 text-sm"><span className="h-3 w-3 rounded-sm" style={{ background: color }} /><span className="sr-only">{t("common.town")}</span>
      <Dropdown id={id} value={v} onChange={set} options={towns.map((t) => ({ v: t.slug, t: t.name }))} className="min-w-40" /></label>
  );
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">{sel("cmp-a", a, setA, "#2b4fa3")}<span className="text-sm text-black/60">{t("compare.vs")}</span>{sel("cmp-b", b, setB, "#e8552d")}</div>
      <ul className="mt-6 space-y-5">
        {metrics.map((m) => {
          const x = m.values[a] ?? null, y = m.values[b] ?? null, max = Math.max(x ?? 0, y ?? 0, 1);
          return (
            <li key={m.label}>
              <p className="mb-1.5 text-center text-xs font-semibold tracking-widest text-black/65">{t(m.label).toUpperCase()}</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex items-center justify-end gap-2"><span className="text-sm font-semibold tabular-nums">{fmt(x, m.unit)}</span><span className="block h-5 rounded-l-sm bg-fiesta-blue transition-[width]" style={{ width: `${((x ?? 0) / max) * 100}%`, minWidth: x ? 3 : 0 }} role="img" aria-label={`${name(a)} ${fmt(x, m.unit)}`} /></div>
                <span className="h-5 w-px bg-black/20" aria-hidden />
                <div className="flex items-center gap-2"><span className="block h-5 rounded-r-sm bg-fiesta-orange transition-[width]" style={{ width: `${((y ?? 0) / max) * 100}%`, minWidth: y ? 3 : 0 }} role="img" aria-label={`${name(b)} ${fmt(y, m.unit)}`} /><span className="text-sm font-semibold tabular-nums">{fmt(y, m.unit)}</span></div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
