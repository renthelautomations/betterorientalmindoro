"use client";
import { useMemo, useState } from "react";

export type Col<T> = { key: keyof T & string; label: string; align?: "left" | "right"; format?: "int" | "peso" }; // a name, not a function: server pages cannot pass functions to client components

/** Sort by clicking a header, filter with the box. Dashes sort last. */
export default function DataTable<T extends Record<string, string | number | null>>({ rows, cols, filterKey, caption }: { rows: T[]; cols: Col<T>[]; filterKey: keyof T & string; caption: string }) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const f = rows.filter((r) => String(r[filterKey]).toLowerCase().includes(q.trim().toLowerCase()));
    if (!sort) return f;
    return [...f].sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      if (x == null) return 1;
      if (y == null) return -1;
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [rows, sort, q, filterKey]);
  return (
    <div>
      <label className="block">
        <span className="sr-only">Maghanap</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Maghanap…" className="mb-3 min-h-11 w-full max-w-xs rounded-lg border border-black/20 bg-white px-3 text-sm outline-none focus:border-[#1b2a4a]" />
      </label>
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-[#1b2a4a] text-white">
            <tr>
              {cols.map((c) => (
                <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`p-0 font-semibold ${c.align === "right" ? "text-right" : "text-left"}`}>
                  <button type="button" onClick={() => setSort(sort?.key === c.key ? { key: c.key, dir: sort.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 })} className={`min-h-11 w-full px-4 hover:bg-white/10 ${c.align === "right" ? "text-right" : "text-left"}`}>
                    {c.label}<span aria-hidden className="ml-1 text-white/60">{sort?.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : ""}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className="border-t border-black/5 odd:bg-[#fbf7f0]/60">
                {cols.map((c) => <td key={c.key} className={`px-4 py-2.5 ${c.align === "right" ? "text-right tabular-nums" : ""}`}>{r[c.key] == null ? "-" : c.format === "int" ? Number(r[c.key]).toLocaleString("en-PH") : c.format === "peso" ? "₱" + Number(r[c.key]).toLocaleString("en-PH", { maximumFractionDigits: 0 }) : String(r[c.key])}</td>)}
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={cols.length} className="px-4 py-6 text-center text-black/60">Walang tugma.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
