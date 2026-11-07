"use client";
import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n/i18n";

export type Col<T> = { key: keyof T & string; label: string; align?: "left" | "right"; format?: "int" | "peso" | "spark" }; // a name, not a function: server pages cannot pass functions to client components

/** Tiny trend line, drawn from the series itself. Colored by direction. */
function Spark({ points }: { points: number[] }) {
  if (points.length < 2) return <>-</>;
  const lo = Math.min(...points), hi = Math.max(...points), span = hi - lo || 1;
  const d = points.map((v, i) => `${i ? "L" : "M"}${(i / (points.length - 1)) * 80} ${22 - ((v - lo) / span) * 20}`).join("");
  const up = points[points.length - 1] >= points[0];
  return <svg viewBox="0 0 80 24" className="inline-block h-6 w-20 align-middle" role="img" aria-label={up ? "tumataas" : "bumababa"}><path d={d} fill="none" stroke={up ? "#2a7f44" : "#c23a2a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** Sort by clicking a header, filter with the box. Dashes sort last. */
export default function DataTable<T extends Record<string, string | number | number[] | null>>({ rows, cols, filterKey, caption }: { rows: T[]; cols: Col<T>[]; filterKey: keyof T & string; caption: string }) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [q, setQ] = useState("");
  const t = useT();
  const shown = useMemo(() => {
    const f = rows.filter((r) => String(r[filterKey]).toLowerCase().includes(q.trim().toLowerCase()));
    if (!sort) return f;
    return [...f].sort((a, b) => {
      const last = (v: unknown) => (Array.isArray(v) ? v[v.length - 1] : v);
      const x = last(a[sort.key]), y = last(b[sort.key]);
      if (x == null) return 1;
      if (y == null) return -1;
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [rows, sort, q, filterKey]);
  return (
    <div>
      <label className="block">
        <span className="sr-only">{t("table.search")}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("table.search")} className="mb-3 min-h-12 w-full max-w-sm rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-base outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
      </label>
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-[#1b2a4a] text-white">
            <tr>
              {cols.map((c) => (
                <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`p-0 font-semibold ${c.align === "right" ? "text-right" : "text-left"}`}>
                  <button type="button" onClick={() => setSort(sort?.key === c.key ? { key: c.key, dir: sort.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 })} className={`min-h-11 w-full px-4 hover:bg-white/10 ${c.align === "right" ? "text-right" : "text-left"}`}>
                    {t(c.label)}<span aria-hidden className="ml-1 text-white/60">{sort?.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : ""}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className="border-t border-black/5 odd:bg-[#fbf7f0]/60">
                {cols.map((c) => <td key={c.key} className={`px-4 py-2.5 ${c.align === "right" ? "text-right tabular-nums" : ""}`}>{r[c.key] == null ? "-" : c.format === "spark" ? <Spark points={r[c.key] as number[]} /> : c.format === "int" ? Number(r[c.key]).toLocaleString("en-PH") : c.format === "peso" ? "₱" + Number(r[c.key]).toLocaleString("en-PH", { maximumFractionDigits: 0 }) : String(r[c.key])}</td>)}
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={cols.length} className="px-4 py-6 text-center text-black/60">{t("table.none")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
