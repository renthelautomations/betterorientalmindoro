"use client";
import Link from "next/link";
import { useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import { FIESTA } from "@/components/kit/Patterns";
import Dropdown from "./Dropdown";

type Row = { code: string; name: string; href: string; area: number; v: Record<string, number> };
const tone = (f: number) => (f >= 0.5 ? FIESTA.red : f >= 0.2 ? FIESTA.orange : f > 0 ? FIESTA.yellow : "#cbd5e1");

/** Barangays ranked by the share of their land inside one hazard layer. A bar is the share; 0% means none mapped, which is not the same as safe. */
export default function HazardExposureView({ rows, measures, town, computed }: { rows: Row[]; measures: { id: string; label: string }[]; town: string; computed: string }) {
  const t = useT();
  const [m, setM] = useState(measures[0].id);
  const sorted = [...rows].sort((a, b) => b.v[m] - a.v[m] || a.name.localeCompare(b.name));
  const some = sorted.filter((r) => r.v[m] > 0).length;
  return (
    <div className="space-y-3">
      <div className="grid gap-4 rounded-3xl bg-fiesta-mint p-5 sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-end">
        <div><span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-black/60"><T k="hx.show" /></span><Dropdown ariaLabel={t("hx.show")} value={m} onChange={setM} options={measures.map((x) => ({ v: x.id, t: t(x.label) }))} /></div>
        <p className="text-sm font-semibold text-fiesta-navy" aria-live="polite">{some} / {rows.length} <T k="hx.some" /> {town}</p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {sorted.map((r, i) => (
          <li key={r.code}>
            <Link href={r.href} className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="w-6 text-center font-serif text-sm font-bold text-black/50 tabular-nums">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2"><span className="truncate font-semibold text-fiesta-navy group-hover:underline">{r.name}</span><span className="font-serif text-lg font-bold tabular-nums text-fiesta-navy">{r.v[m] >= 0.995 ? "100" : (r.v[m] * 100).toFixed(r.v[m] < 0.1 ? 1 : 0)}%</span></span>
                <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-black/10" aria-hidden><span className="block h-full rounded-full" style={{ width: `${Math.max(r.v[m] * 100, r.v[m] > 0 ? 2 : 0)}%`, background: tone(r.v[m]) }} /></span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-xs text-black/65"><T k="hx.note" /> {computed}</p>
    </div>
  );
}
