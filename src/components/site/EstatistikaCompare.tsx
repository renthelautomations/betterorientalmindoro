"use client";
import { useState } from "react";
import Link from "next/link";
import { INPUT } from "@/components/kit/Ui";

export type CompareRow = { slug: string; name: string; population: string; area: string; barangays: string; incomeClass: string };

/** Two selects, side by side. Without JS the default pair shows and each name still links to its page. */
export default function EstatistikaCompare({ rows }: { rows: CompareRow[] }) {
  const [a, setA] = useState(rows.find((r) => r.slug === "calapan-city")?.slug ?? rows[0].slug);
  const [b, setB] = useState(rows.find((r) => r.slug !== a && r.slug === "baco")?.slug ?? rows[1].slug);
  const pick = (s: string) => rows.find((r) => r.slug === s)!;
  const L = pick(a), R = pick(b);
  const sel = (id: string, v: string, set: (s: string) => void, label: string) => (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      <select id={id} value={v} onChange={(e) => set(e.target.value)} className={INPUT}>{rows.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}</select>
    </div>
  );
  const line = (k: string, x: string, y: string) => (
    <div className="grid grid-cols-[1fr_1fr] gap-x-4 border-b border-black/10 py-3 sm:grid-cols-[8rem_1fr_1fr]">
      <dt className="col-span-2 text-sm text-black/65 sm:col-span-1">{k}</dt>
      <dd className="font-serif text-xl font-bold tabular-nums text-fiesta-navy">{x}</dd>
      <dd className="font-serif text-xl font-bold tabular-nums text-fiesta-navy">{y}</dd>
    </div>
  );
  return (
    <div>
      <div className="flex flex-wrap gap-4">{sel("cmp-a", a, setA, "Unang bayan")}{sel("cmp-b", b, setB, "Pangalawang bayan")}</div>
      <div aria-live="polite" className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
        <div className="grid grid-cols-[1fr_1fr] gap-x-4 sm:grid-cols-[8rem_1fr_1fr]">
          <span className="hidden sm:block" />
          <Link href={`/bayan/${L.slug}`} className="font-semibold underline">{L.name}</Link>
          <Link href={`/bayan/${R.slug}`} className="font-semibold underline">{R.name}</Link>
        </div>
        <dl>
          {line("Populasyon", L.population, R.population)}
          {line("Laki (km²)", L.area, R.area)}
          {line("Barangay", L.barangays, R.barangays)}
          {line("Klase ng kita", L.incomeClass, R.incomeClass)}
        </dl>
      </div>
    </div>
  );
}
