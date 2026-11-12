"use client";
import { useMemo, useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";
import Dropdown from "./Dropdown";
import { fmtPeso } from "@/lib/stats";
import { filterAwards, paginate, type Award } from "@/lib/philgeps";

const MATCH_TONE = { delivery: "bg-[#e7f1f8] text-[#14597f]", entity: "bg-[#e6ecf8] text-fiesta-navy", both: "bg-[#e2f2e7] text-[#1f6b37]" } as const;

/** One award as a card. Amounts as published; a missing amount, date or awardee is said so, never shown as zero. */
export function AwardCard({ a }: { a: Award }) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className={`rounded-full px-2.5 py-1 ${MATCH_TONE[a.matchBy]}`}><T k={`pp.m.${a.matchBy}`} /></span>
        {a.category && <span className="text-black/65">{a.category}</span>}
      </div>
      <p className="line-clamp-3 font-semibold leading-snug text-fiesta-navy" title={a.title ?? undefined}>{a.title ?? "-"}</p>
      <p className="text-xs text-black/70">{a.entity}</p>
      <p className="text-xs text-black/70">{a.awardee ?? <T k="pp.c.noawardee" />}</p>
      <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-black/10 pt-3">
        <div><dt className="text-[11px] font-semibold tracking-wide text-black/65 uppercase"><T k="pp.c.amount" /></dt><dd className="font-serif text-lg font-bold tabular-nums text-fiesta-navy">{a.amount == null ? "-" : fmtPeso(a.amount)}</dd></div>
        <div><dt className="text-[11px] font-semibold tracking-wide text-black/65 uppercase"><T k="pp.c.date" /></dt><dd className="text-sm font-semibold tabular-nums text-fiesta-navy">{a.awardDate ?? <T k="pp.c.nodate" />}</dd></div>
      </dl>
      {a.items > 1 && <p className="text-xs text-black/65"><TF k="pp.c.items" v={[a.items]} /></p>}
    </div>
  );
}

const pill = (on: boolean) => `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold tabular-nums ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;

/** All awards with full detail (the last three award years): year pills, office dropdown, search, pages of 12. */
export default function TpAwards({ awards, offices }: { awards: Award[]; offices: string[] }) {
  const t = useT();
  const [year, setYear] = useState<number | null>(null);
  const [office, setOffice] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const years = useMemo(() => [...new Set(awards.map((x) => x.year).filter((y): y is number => y != null))].sort((x, y) => y - x), [awards]);
  const shown = useMemo(() => filterAwards(awards, { year: year ?? undefined, entity: office || undefined, q }).sort((x, y) => (y.awardDate ?? "").localeCompare(x.awardDate ?? "")), [awards, year, office, q]);
  const pg = paginate(shown, page, 12);
  const reset = (f: () => void) => { f(); setPage(1); };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 basis-56"><span className="sr-only">{t("pp.f.search")}</span><input type="search" value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder={t("pp.f.search")} autoComplete="off" className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-sm outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" /></label>
        <div className="w-72"><Dropdown value={office} onChange={(v) => reset(() => setOffice(v))} options={[{ v: "", t: t("pp.f.alloffices") }, ...offices.map((o) => ({ v: o, t: o }))]} ariaLabel={t("pp.f.office")} /></div>
      </div>
      <div role="group" aria-label={t("pp.f.year")} className="mt-3 inline-flex flex-wrap rounded-full bg-fiesta-navy/5 p-0.5">
        <button type="button" aria-pressed={year === null} onClick={() => reset(() => setYear(null))} className={pill(year === null)}>{t("pp.f.allyears")}</button>
        {years.map((y) => <button key={y} type="button" aria-pressed={year === y} onClick={() => reset(() => setYear(y))} className={pill(year === y)}>{y}</button>)}
      </div>
      <p className="mt-3 text-sm text-black/70" aria-live="polite"><TF k="pp.f.count" v={[shown.length.toLocaleString("en-PH")]} /></p>
      {pg.items.length ? <ul className="mt-3 grid auto-rows-fr gap-3 md:grid-cols-2 lg:grid-cols-3">{pg.items.map((a) => <li key={a.id}><AwardCard a={a} /></li>)}</ul> : <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-black/70 shadow-sm ring-1 ring-black/5">{t("pp.f.none")}</p>}
      {pg.pages > 1 && (
        <nav aria-label="Pages" className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled={pg.page <= 1} onClick={() => setPage(pg.page - 1)} className="min-h-11 rounded-full border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white disabled:opacity-40">{t("pp.prev")}</button>
          <span className="text-sm tabular-nums text-black/75"><TF k="pp.page" v={[pg.page, pg.pages]} /></span>
          <button type="button" disabled={pg.page >= pg.pages} onClick={() => setPage(pg.page + 1)} className="min-h-11 rounded-full border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white disabled:opacity-40">{t("pp.next")}</button>
        </nav>
      )}
    </div>
  );
}
