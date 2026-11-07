"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import TownEmblem from "@/components/kit/TownEmblem";
import { T, useT } from "@/lib/i18n/i18n";
import { runs, span } from "@/lib/dyn-runs";
import { posKey } from "./dynKeys";
import { seatId } from "@/lib/dyn-pure";

export type SeatData = { position: string; cells: { year: number; surname: string | null; full: string }[] };
export type TownSeats = { slug: string; name: string; seats: SeatData[] };

const SOLID = ["bg-fiesta-blue", "bg-fiesta-orange", "bg-fiesta-green", "bg-fiesta-yellow", "bg-fiesta-pink", "bg-fiesta-sky"];
const TINT = ["bg-fiesta-blue/15", "bg-fiesta-orange/20", "bg-fiesta-green/20", "bg-fiesta-yellow/35", "bg-fiesta-pink/40", "bg-fiesta-sky/25"];
const VIEWS = [["towns", "dyn.view.towns"], ["year", "dyn.view.year"], ["table", "dyn.view.table"]] as const;

/** Three ways to read the same winners: a card per town (runs of the same surname), one election at a time for every town, and the full table. All panels are in the page; the pills only choose which one is visible. */
export default function WinnersViews({ towns, years, table }: { towns: TownSeats[]; years: number[]; table: ReactNode }) {
  const t = useT();
  const [view, setView] = useState<(typeof VIEWS)[number][0]>("towns");
  const [year, setYear] = useState(years.at(-1) ?? years[0]);
  const pill = (on: boolean) => `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;
  return (
    <div>
      <div role="group" aria-label={t("dyn.view.label")} className="inline-flex flex-wrap rounded-full bg-fiesta-navy/5 p-0.5">
        {VIEWS.map(([v, k]) => <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={pill(view === v)}>{t(k)}</button>)}
      </div>

      <div hidden={view !== "towns"} className="mt-4">
        <ul className="grid gap-4 sm:grid-cols-2">
          {towns.map((tw) => (
            <li key={tw.slug} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <Link href={`/dynasties/${tw.slug}`} className="flex items-center gap-3 rounded-lg hover:text-fiesta-blue">
                <TownEmblem slug={tw.slug} name="" className="h-10 w-10 shrink-0 rounded-lg" capital={tw.slug === "calapan-city"} />
                <span className="font-serif text-xl font-bold text-fiesta-navy">{tw.name}</span>
              </Link>
              {tw.seats.map((s) => {
                const rs = runs(s.cells.map((c) => ({ year: c.year, surname: c.surname })));
                return (
                  <div key={s.position} className="mt-3">
                    <p className="text-xs font-semibold tracking-widest text-black/65 uppercase"><T k={posKey(s.position)} /></p>
                    <div className="mt-1.5 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                      {s.cells.map((c) => <span key={c.year} className={`flex-1 ${c.surname ? SOLID[tone(rs, c.surname)] : "bg-black/10"}`} />)}
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {rs.map((r) => (
                        <li key={r.from} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm ${r.surname ? `${TINT[r.tone % TINT.length]} font-semibold text-fiesta-navy` : "bg-black/5 text-black/60"}`}>
                          <span>{r.surname ?? <T k="dyn.view.norec" />}</span><span className="text-xs font-normal tabular-nums text-black/70">{span(r)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-black/65"><T k="dyn.view.towns.note" /></p>
      </div>

      <div hidden={view !== "year"} className="mt-4">
        <div role="group" aria-label={t("dyn.view.pick")} className="flex flex-wrap gap-2">
          {years.map((y) => <button key={y} type="button" aria-pressed={year === y} onClick={() => setYear(y)} className={`min-h-10 rounded-full border-2 px-4 text-sm font-semibold tabular-nums ${year === y ? "border-fiesta-navy bg-fiesta-navy text-white" : "border-fiesta-navy/20 text-fiesta-navy hover:border-fiesta-navy"}`}>{y}</button>)}
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {towns.map((tw) => (
            <li key={tw.slug} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <Link href={`/dynasties/${tw.slug}`} className="flex items-center gap-2 font-serif text-lg font-bold text-fiesta-navy hover:text-fiesta-blue"><TownEmblem slug={tw.slug} name="" className="h-7 w-7 shrink-0 rounded-md" capital={tw.slug === "calapan-city"} />{tw.name}</Link>
              <dl className="mt-2 space-y-1.5">
                {tw.seats.map((s) => {
                  const i = s.cells.findIndex((c) => c.year === year), c = s.cells[i], prev = i > 0 ? s.cells[i - 1] : undefined;
                  const same = !!(c?.surname && prev?.surname === c.surname);
                  return (
                    <div key={s.position} className="flex items-center justify-between gap-3">
                      <dt className="text-xs text-black/65"><T k={posKey(s.position)} /></dt>
                      <dd className="min-w-0">{c?.surname ? (
                        <Link href={`/dynasties/${tw.slug}#${seatId(s.position, year)}`} title={c.full} className={`inline-block rounded-lg px-2.5 py-1 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white ${same ? "bg-fiesta-orange/15 text-[#8a3a18]" : ""}`}>{c.surname}</Link>
                      ) : <span className="px-2.5 text-black/40"><span aria-hidden>–</span><span className="sr-only"><T k="dyn.view.norec" /></span></span>}</dd>
                    </div>
                  );
                })}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-2 text-xs text-black/65"><span className="inline-block h-3 w-3 rounded bg-fiesta-orange/25" aria-hidden /><T k="dyn.view.repeat" /></p>
      </div>

      <div hidden={view !== "table"} className="mt-4">{table}</div>
    </div>
  );
}

/** Solid ribbon colour of a surname: the tone its run was given. */
function tone(rs: ReturnType<typeof runs>, surname: string) {
  return (rs.find((r) => r.surname === surname)?.tone ?? 0) % SOLID.length;
}
