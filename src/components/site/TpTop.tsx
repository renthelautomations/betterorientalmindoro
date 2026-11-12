"use client";
import { useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import { fmtPeso } from "@/lib/stats";

type Row = { name: string; awards: number; amount: number };
/** Ranked bars with a switch between by amount and by number of awards. Names are shown as published. */
export default function TpTop({ title, byAmount, byCount, note }: { title: string; byAmount: Row[]; byCount?: Row[]; note?: string }) {
  const t = useT();
  const [mode, setMode] = useState<"amt" | "cnt">("amt");
  const rows = (mode === "cnt" && byCount ? byCount : byAmount).slice(0, 10);
  const max = Math.max(...rows.map((r) => (mode === "cnt" ? r.awards : r.amount)), 1);
  const pill = (on: boolean) => `inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg font-bold text-fiesta-navy"><T k={title} /></h3>
        {byCount && <div role="group" aria-label={t(title)} className="inline-flex rounded-full bg-fiesta-navy/5 p-0.5"><button type="button" aria-pressed={mode === "amt"} onClick={() => setMode("amt")} className={pill(mode === "amt")}>{t("pp.top.byamt")}</button><button type="button" aria-pressed={mode === "cnt"} onClick={() => setMode("cnt")} className={pill(mode === "cnt")}>{t("pp.top.bycnt")}</button></div>}
      </div>
      {note && <p className="mt-2 text-xs text-black/70"><T k={note} /></p>}
      <ol className="mt-4 space-y-3">
        {rows.map((r, i) => {
          const v = mode === "cnt" ? r.awards : r.amount;
          return (
            <li key={r.name}>
              <p className="flex items-baseline justify-between gap-3 text-sm"><span className="min-w-0"><span className="mr-2 text-xs tabular-nums text-black/65">{i + 1}</span><span className="font-medium text-fiesta-navy">{r.name}</span></span><span className="shrink-0 font-semibold tabular-nums">{mode === "cnt" ? r.awards.toLocaleString("en-PH") : fmtPeso(r.amount)}</span></p>
              <span className="mt-1 block h-2.5 rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-blue" style={{ width: `${(v / max) * 100}%` }} /></span>
              <p className="mt-0.5 text-xs text-black/65">{mode === "cnt" ? fmtPeso(r.amount) : `${r.awards.toLocaleString("en-PH")} ${t("pp.awards")}`}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
