"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import TownEmblem from "@/components/kit/TownEmblem";
import { useT } from "@/lib/i18n/i18n";
import { fmtInt, fmtPct } from "@/lib/stats";

export type TownDataRow = { slug: string; name: string; isCity: boolean; pop: number | null; trend: number[] | null; area: number };
type Key = "name" | "pop" | "growth" | "area" | "density";

const growthOf = (r: TownDataRow) => (r.trend && r.trend.length > 1 && r.trend[0] > 0 ? r.trend[r.trend.length - 1] / r.trend[0] - 1 : null);
const densityOf = (r: TownDataRow) => (r.pop != null && r.area > 0 ? r.pop / r.area : null);

/** Colored by direction: green up, red down. Drawn from the series itself. */
function Spark({ points }: { points: number[] }) {
  const lo = Math.min(...points), hi = Math.max(...points), span = hi - lo || 1;
  const d = points.map((v, i) => `${i ? "L" : "M"}${(i / (points.length - 1)) * 96} ${26 - ((v - lo) / span) * 22}`).join("");
  const up = points[points.length - 1] >= points[0];
  return <svg viewBox="0 0 96 30" className="h-8 w-24" aria-hidden><path d={d} fill="none" stroke={up ? "#2a7f44" : "#c23a2a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Bar({ v, max, color, text }: { v: number | null; max: number; color: string; text: string }) {
  return (
    <div className="min-w-24">
      <span className="font-semibold tabular-nums text-fiesta-navy">{text}</span>
      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/5" aria-hidden>{v != null && <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.max((v / max) * 100, 3)}%` }} />}</span>
    </div>
  );
}

/** Searchable, sortable town table: emblem and name, type, population bar, growth since the first census with a trend line, area bar, density. A dash means no figure. */
export default function TownDataTable({ rows, caption }: { rows: TownDataRow[]; caption: string }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "pop", dir: -1 });
  const max = useMemo(() => ({ pop: Math.max(...rows.map((r) => r.pop ?? 0), 1), area: Math.max(...rows.map((r) => r.area), 1), density: Math.max(...rows.map((r) => densityOf(r) ?? 0), 1) }), [rows]);
  const shown = useMemo(() => {
    const f = rows.filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));
    const val = (r: TownDataRow): number | string | null => (sort.key === "name" ? r.name : sort.key === "pop" ? r.pop : sort.key === "growth" ? growthOf(r) : sort.key === "area" ? r.area : densityOf(r));
    return [...f].sort((a, b) => {
      const x = val(a), y = val(b);
      if (x == null) return 1;
      if (y == null) return -1;
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [rows, q, sort]);
  const head = (key: Key, label: string, right = false) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`p-0 font-semibold ${right ? "text-right" : "text-left"}`}>
      <button type="button" onClick={() => setSort(sort.key === key ? { key, dir: sort.dir === 1 ? -1 : 1 } : { key, dir: key === "name" ? 1 : -1 })} className={`min-h-11 w-full px-4 hover:bg-white/10 ${right ? "text-right" : "text-left"}`}>
        {t(label)}<span aria-hidden className="ml-1 text-white/60">{sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );
  return (
    <div>
      <label className="block">
        <span className="sr-only">{t("table.search")}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("table.search")} className="mb-3 min-h-12 w-full max-w-sm rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-base outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
      </label>
      <div role="region" tabIndex={0} aria-label={caption} className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-fiesta-navy text-white"><tr>
            {head("name", "table.name")}
            <th scope="col" className="px-4 text-left font-semibold">{t("table.kind")}</th>
            {head("pop", "table.pop")}
            {head("growth", "bayan.col.growth")}
            {head("area", "table.area")}
            {head("density", "bayan.col.density")}
          </tr></thead>
          <tbody>
            {shown.map((r, i) => {
              const g = growthOf(r), d = densityOf(r);
              return (
                <tr key={r.slug} className={`border-b border-black/5 align-middle last:border-0 ${i % 2 ? "bg-fiesta-cream/60" : ""}`}>
                  <th scope="row" className="px-4 py-2.5 font-medium">
                    <Link href={`/bayan/${r.slug}`} className="inline-flex min-h-11 items-center gap-3 font-serif text-base font-bold text-fiesta-navy hover:text-fiesta-blue">
                      <TownEmblem slug={r.slug} name="" className="h-9 w-9 shrink-0 rounded-lg" capital={r.slug === "calapan-city"} />{r.name}
                    </Link>
                  </th>
                  <td className="px-4 py-2.5"><span className="rounded-full bg-fiesta-mint px-2.5 py-1 text-xs font-semibold text-fiesta-navy">{t(r.isCity ? "town.city" : "town.town")}</span></td>
                  <td className="px-4 py-2.5"><Bar v={r.pop} max={max.pop} color="bg-fiesta-blue" text={fmtInt(r.pop)} /></td>
                  <td className="px-4 py-2.5">
                    {g == null || !r.trend ? "–" : (
                      <span className="inline-flex items-center gap-2">
                        <Spark points={r.trend} />
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${g >= 0 ? "bg-fiesta-green/15 text-[#1f6b37]" : "bg-fiesta-red/10 text-[#a8281b]"}`}>{g >= 0 ? "+" : ""}{fmtPct(g, 0)}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5"><Bar v={r.area} max={max.area} color="bg-fiesta-green" text={`${fmtInt(r.area)} km²`} /></td>
                  <td className="px-4 py-2.5"><Bar v={d} max={max.density} color="bg-fiesta-orange" text={d == null ? "–" : fmtInt(Math.round(d))} /></td>
                </tr>
              );
            })}
            {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-black/60">{t("table.none")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
