import Link from "next/link";
import TownEmblem from "@/components/kit/TownEmblem";
import { IncomeClass } from "@/components/stats/StatCard";
import { T } from "@/lib/i18n/i18n";
import { fmtInt, fmtPeso } from "@/lib/stats";
import type { TownRow } from "./TownCards";

const th = "px-4 py-3 font-semibold";
/** Number with a bar sized against the biggest town, so the column reads at a glance. A dash means no figure, never zero. */
function Bar({ v, max, color, text }: { v: number | null; max: number; color: string; text: string }) {
  return (
    <div className="min-w-24">
      <span className="font-semibold tabular-nums text-fiesta-navy">{text}</span>
      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/5" aria-hidden>{v != null && <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.max((v / max) * 100, 3)}%` }} />}</span>
    </div>
  );
}

/** Town table, largest population first: rank, emblem and name, then bars for population, area and revenue, barangays and income class. */
export default function TownTable({ rows }: { rows: TownRow[] }) {
  const sorted = [...rows].sort((a, b) => (b.pop ?? -1) - (a.pop ?? -1));
  const max = { pop: Math.max(...rows.map((r) => r.pop ?? 0), 1), area: Math.max(...rows.map((r) => r.area), 1), rev: Math.max(...rows.map((r) => r.rev ?? 0), 1) };
  return (
    <div role="region" tabIndex={0} aria-labelledby="rank-h" className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        <caption className="sr-only"><T k="finance.rank.cap" /></caption>
        <thead>
          <tr className="bg-fiesta-navy text-xs uppercase tracking-widest text-white">
            <th scope="col" className={`${th} w-12 text-center`}>#</th>
            <th scope="col" className={th}><T k="town.town" /></th>
            <th scope="col" className={th}><T k="metric.pop" /></th>
            <th scope="col" className={th}><T k="finance.area" /></th>
            <th scope="col" className={`${th} text-right`}><T k="finance.brgy" /></th>
            <th scope="col" className={th}><T k="metric.revenue" /></th>
            <th scope="col" className={th}><T k="finance.th.class" /></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.slug} className={`border-b border-black/5 align-middle last:border-0 ${i % 2 ? "bg-fiesta-cream/60" : ""}`}>
              <td className="px-4 py-3 text-center font-serif text-base font-bold tabular-nums text-black/65">{i + 1}</td>
              <th scope="row" className="px-4 py-3 font-medium">
                <Link href={`/bayan/${r.slug}`} className="inline-flex min-h-11 items-center gap-3 font-serif text-base font-bold text-fiesta-navy hover:text-fiesta-blue">
                  <TownEmblem slug={r.slug} name="" className="h-9 w-9 shrink-0 rounded-lg" capital={r.slug === "calapan-city"} />{r.name}
                </Link>
              </th>
              <td className="px-4 py-3"><Bar v={r.pop} max={max.pop} color="bg-fiesta-blue" text={fmtInt(r.pop)} /></td>
              <td className="px-4 py-3"><Bar v={r.area} max={max.area} color="bg-fiesta-green" text={`${fmtInt(r.area)} km²`} /></td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-fiesta-navy">{fmtInt(r.brgy)}</td>
              <td className="px-4 py-3"><Bar v={r.rev} max={max.rev} color="bg-fiesta-orange" text={fmtPeso(r.rev)} /></td>
              <td className="px-4 py-3"><span className="inline-flex whitespace-nowrap rounded-full bg-fiesta-mint px-3 py-1 text-xs font-semibold text-fiesta-navy"><IncomeClass value={r.cls} />{r.clsYear ? ` · ${r.clsYear}` : ""}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
