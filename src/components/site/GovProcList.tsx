"use client";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import KitIcon from "@/components/kit/KitIcon";
import { TF as TF_ } from "./DynBits";
import { T, useLang, useT } from "@/lib/i18n/i18n";
import Dropdown from "./Dropdown";
import { ConfChip, Stepper, WorkBadge, card, pill } from "./GovProcBits";
import { NO_FILTERS, filterCards, fmtDate, php, type Card, type Filters, type Money, type StatusFilter } from "@/lib/gov-proc";

const PAGE = 10;
const WORKS = ["road", "building", "bridge", "drainage", "water", "other"];
const STATUS: StatusFilter[] = ["", "waiting", "award", "contract", "ntp"];

function Amount({ label, m }: { label: string; m: Money }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold tracking-wide text-black/65"><T k={label} /></dt>
      <dd className="font-serif text-base font-bold tabular-nums text-fiesta-navy">{m ? php(m.v) : <><span aria-hidden>–</span><span className="sr-only"><T k="govb.nodata" /></span></>}{m && m.conf !== "high" && <span className="ml-1 align-middle"><ConfChip conf={m.conf} /></span>}</dd>
    </div>
  );
}

function ProjectCard({ c }: { c: Card }) {
  return (
    <Link href={`/pamahalaan/bidding/${c.slug}`} className="group block h-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md hover:ring-fiesta-navy/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
      <div className="flex items-start gap-3">
        <WorkBadge work={c.work} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tabular-nums tracking-wide text-black/65">{c.refNo}</p>
          <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-fiesta-navy">{c.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-black/70">
            <span>{c.townName ?? <T k="govb.notown" />}</span><span aria-hidden>·</span><span><T k={`govb.work.${c.work}`} /></span>
            <span aria-hidden>·</span><span className="tabular-nums">{fmtDate(c.firstDate)}</span>
          </p>
        </div>
        {c.flags > 0 && <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900"><TF_ k="govb.chip.notes" v={[c.flags]} /></span>}
      </div>
      <div className="mt-4"><Stepper stages={c.stages} /></div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <Amount label="govb.abc" m={c.abc} />
        <Amount label="govb.price" m={c.price} />
        <div className="col-span-2 min-w-0"><dt className="text-[11px] font-semibold tracking-wide text-black/65"><T k="govb.contractor" /></dt><dd className="truncate text-sm text-black/85">{c.contractor?.v ?? "–"}</dd></div>
      </dl>
    </Link>
  );
}

/** Search, filters and the paged list of project cards. Filtering is client-side over the slim card list. */
export default function GovProcList({ cards, towns, years }: { cards: Card[]; towns: { v: string; t: string }[]; years: string[] }) {
  const t = useT();
  const lang = useLang();
  const id = useId();
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const set = (p: Partial<Filters>) => { setF((x) => ({ ...x, ...p })); setPage(1); };
  const rows = useMemo(() => filterCards(cards, f), [cards, f]);
  const last = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, last);
  const shown = rows.slice((cur - 1) * PAGE, cur * PAGE);
  const present = new Set(cards.map((c) => c.town));
  const worksPresent = WORKS.filter((w) => cards.some((c) => c.work === w));
  const month = (m: string) => new Date(`2000-${m}-01T00:00:00Z`).toLocaleDateString(lang === "en" ? "en-PH" : "fil-PH", { month: "long", timeZone: "UTC" });
  const nav = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-black/20 bg-white px-3 text-sm font-semibold text-fiesta-navy hover:border-fiesta-navy focus-visible:outline-2 focus-visible:outline-fiesta-blue disabled:border-black/10 disabled:bg-black/5 disabled:text-black/65";
  return (
    <section aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="font-serif text-2xl font-bold text-fiesta-navy"><T k="govb.list.h" /></h3>
      <div className={`${card} mt-3 space-y-4`}>
        <label className="relative block">
          <span className="sr-only"><T k="govb.search" /></span>
          <KitIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/65" />
          <input type="search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder={t("govb.search.ph")} className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 bg-white pl-11 pr-4 text-sm outline-none focus-visible:border-fiesta-blue focus-visible:ring-4 focus-visible:ring-fiesta-blue/20" />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-xs font-semibold text-black/65"><T k="govb.f.town" /><Dropdown ariaLabel={t("govb.f.town")} className="mt-1" value={f.town} onChange={(v) => set({ town: v })} options={[{ v: "", t: t("govb.f.alltowns") }, ...towns.filter((x) => present.has(x.v))]} /></label>
          <label className="block text-xs font-semibold text-black/65"><T k="govb.f.year" /><Dropdown ariaLabel={t("govb.f.year")} className="mt-1" value={f.year} onChange={(v) => set({ year: v })} options={[{ v: "", t: t("govb.f.allyears") }, ...years.map((y) => ({ v: y, t: y }))]} /></label>
          <label className="block text-xs font-semibold text-black/65"><T k="govb.f.month" /><Dropdown ariaLabel={t("govb.f.month")} className="mt-1" value={f.month} onChange={(v) => set({ month: v })} options={[{ v: "", t: t("govb.f.allmonths") }, ...Array.from({ length: 12 }, (_, i) => { const m = String(i + 1).padStart(2, "0"); return { v: m, t: month(m) }; })]} /></label>
        </div>
        <div role="group" aria-label={t("govb.f.work")} className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={f.work === ""} onClick={() => set({ work: "" })} className={pill(f.work === "")}><T k="govb.f.allwork" /></button>
          {worksPresent.map((w) => <button key={w} type="button" aria-pressed={f.work === w} onClick={() => set({ work: w })} className={pill(f.work === w)}><T k={`govb.work.${w}`} /></button>)}
        </div>
        <div role="group" aria-label={t("govb.f.status")} className="flex flex-wrap items-center gap-2">
          {STATUS.map((s) => <button key={s || "all"} type="button" aria-pressed={f.status === s} onClick={() => set({ status: s })} className={pill(f.status === s)}><T k={`govb.status.${s || "all"}`} /></button>)}
          <button type="button" aria-pressed={f.flagged} onClick={() => set({ flagged: !f.flagged })} className={`${pill(f.flagged)} ml-auto`}><T k="govb.f.flagged" /></button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-black/75" role="status" aria-live="polite"><TF_ k="govb.list.count" v={[rows.length.toLocaleString("en-PH"), cards.length.toLocaleString("en-PH")]} /></p>
          <button type="button" onClick={() => { setF(NO_FILTERS); setPage(1); }} className="min-h-11 px-3 text-sm font-semibold text-fiesta-blue underline underline-offset-2"><T k="govb.f.reset" /></button>
        </div>
      </div>
      {shown.length === 0 ? <p className={`${card} mt-4 text-sm text-black/75`}><T k="govb.list.none" /></p> : (
        <ul className="mt-4 grid auto-rows-fr gap-3 md:grid-cols-2">{shown.map((c) => <li key={c.slug} className="min-w-0"><ProjectCard c={c} /></li>)}</ul>
      )}
      {last > 1 && (
        <nav aria-label="Pages" className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button type="button" className={nav} disabled={cur <= 1} onClick={() => setPage(1)} aria-label={t("proyekto.page.first")}>«</button>
          <button type="button" className={nav} disabled={cur <= 1} onClick={() => setPage(cur - 1)}>‹ <span className="ml-1"><T k="proyekto.page.prev" /></span></button>
          <span className="px-2 text-sm font-semibold tabular-nums text-fiesta-navy" aria-current="page">{cur} / {last}</span>
          <button type="button" className={nav} disabled={cur >= last} onClick={() => setPage(cur + 1)}><span className="mr-1"><T k="proyekto.page.next" /></span> ›</button>
          <button type="button" className={nav} disabled={cur >= last} onClick={() => setPage(last)} aria-label={t("proyekto.page.last")}>»</button>
        </nav>
      )}
    </section>
  );
}
