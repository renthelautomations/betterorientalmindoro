"use client";
import { useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import { MONTHS, fmtM } from "@/lib/bir";

/** Twelve bars for one year at a time. A month with no figure shows a dash and no bar. */
export default function TpMonthly({ years, data }: { years: number[]; data: Record<string, (number | null)[]> }) {
  const t = useT();
  const [year, setYear] = useState(String(years.at(-1)));
  const vals = data[year] ?? Array(12).fill(null);
  const max = Math.max(...vals.map((v) => v ?? 0), 1);
  const peak = vals.reduce<number>((b, v, i) => ((v ?? -1) > (vals[b] ?? -1) ? i : b), 0);
  return (
    <div>
      <div role="group" aria-label={t("tax.month.h")} className="inline-flex flex-wrap rounded-full bg-fiesta-navy/5 p-0.5">
        {years.map((y) => <button key={y} type="button" aria-pressed={year === String(y)} onClick={() => setYear(String(y))} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold tabular-nums ${year === String(y) ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`}>{y}</button>)}
      </div>
      <ul className="mt-5 flex h-56 items-end gap-1.5 sm:gap-3">
        {vals.map((v, i) => (
          <li key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 text-center" title={`${MONTHS[i]} ${year}: ${fmtM(v)}`}>
            <span className="text-[10px] font-semibold tabular-nums text-fiesta-navy sm:text-xs">{v == null ? "-" : v >= 1000 ? (v / 1000).toFixed(2) + "B" : Math.round(v)}</span>
            {v != null && <span aria-hidden className={`w-full max-w-10 rounded-t-md ${i === peak ? "bg-fiesta-orange" : "bg-fiesta-blue"}`} style={{ height: `${Math.max((v / max) * 70, 2)}%` }} />}
            <span className="border-t border-black/15 pt-1 text-[10px] text-black/75 sm:text-xs">{MONTHS[i]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-black/70"><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-fiesta-orange align-middle" aria-hidden /><T k="tax.month.peak" />: {MONTHS[peak]} {year}, {fmtM(vals[peak])}</p>
    </div>
  );
}
