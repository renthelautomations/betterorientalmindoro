"use client";
import Link from "next/link";
import { useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";
import { card, pill } from "./GovProcBits";
import { fmtDate } from "@/lib/gov-proc";

export type NoAwardRow = { ref: string; slug: string; title: string; date: string | null };
const STEP = 25;

/** The very frequent informational rule as a compact filterable table, not a wall of cards. */
export default function GovProcNoAward({ rows, notes }: { rows: NoAwardRow[]; notes: { title: string; disclaimer: string } }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [n, setN] = useState(STEP);
  const years = [...new Set(rows.map((r) => r.date?.slice(0, 4)).filter((x): x is string => !!x))].sort().reverse();
  const k = q.trim().toLowerCase();
  const list = rows.filter((r) => (!year || r.date?.startsWith(year)) && (!k || `${r.ref} ${r.title}`.toLowerCase().includes(k)));
  return (
    <div className={`${card} p-5`}>
      <p className="text-sm text-black/80">{notes.disclaimer}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="min-w-0 flex-1"><span className="sr-only"><T k="govb.search" /></span>
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setN(STEP); }} placeholder={t("govb.search.ph")} className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 px-4 text-sm outline-none focus-visible:border-fiesta-blue focus-visible:ring-4 focus-visible:ring-fiesta-blue/20" /></label>
        <div role="group" aria-label={t("govb.f.year")} className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={year === ""} onClick={() => { setYear(""); setN(STEP); }} className={pill(year === "")}><T k="govb.f.allyears" /></button>
          {years.map((y) => <button key={y} type="button" aria-pressed={year === y} onClick={() => { setYear(y); setN(STEP); }} className={pill(year === y)}>{y}</button>)}
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-fiesta-navy" role="status" aria-live="polite"><TF k="govb.list.count" v={[list.length.toLocaleString("en-PH"), rows.length.toLocaleString("en-PH")]} /></p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <caption className="sr-only">{notes.title}</caption>
          <thead><tr className="text-xs text-black/65"><th scope="col" className="py-2 pr-3 font-semibold"><T k="govb.d.ref" /></th><th scope="col" className="py-2 pr-3 font-semibold"><T k="govb.nt.project" /></th><th scope="col" className="py-2 font-semibold"><T k="govb.nt.itbdate" /></th></tr></thead>
          <tbody>
            {list.slice(0, n).map((r) => (
              <tr key={r.ref} className="border-t border-black/10 align-top">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 font-semibold tabular-nums"><Link href={`/pamahalaan/bidding/${r.slug}`} className="inline-flex min-h-11 items-center text-fiesta-blue underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-fiesta-blue">{r.ref}</Link></th>
                <td className="min-w-0 py-2 pr-3 text-black/80">{r.title}</td>
                <td className="whitespace-nowrap py-2 tabular-nums text-black/80">{fmtDate(r.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {n < list.length && <button type="button" onClick={() => setN(n + STEP)} className={`${pill(false)} mt-3`}><T k="govb.nt.more" /></button>}
    </div>
  );
}
