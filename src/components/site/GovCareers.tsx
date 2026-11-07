"use client";
import { useEffect, useMemo, useState } from "react";
import KitIcon from "@/components/kit/KitIcon";
import { FIESTA } from "@/components/kit/Patterns";
import Dropdown from "./Dropdown";
import { getCareers, type Career } from "@/lib/gov";
import { filterCareers, pageOf, daysLeft, type Status } from "@/lib/gov-careers";
import { useT } from "@/lib/i18n/i18n";

const SIZE = 10;
const MAIL = "hrrecruitment@ormindoro.gov.ph";
const ds = getCareers();
const OFFICES = [...new Set(ds.items.map((c) => c.office).filter((o): o is string => !!o))].sort();
const pill = (on: boolean) => `inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;
const fmtDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

function Card({ c, today, mounted }: { c: Career; today: string; mounted: boolean }) {
  const t = useT();
  const left = mounted && c.deadline && c.deadline >= today ? daysLeft(c.deadline, today) : null;
  const quals: [string, string | null][] = [["govc.jb.edu", c.education], ["govc.jb.train", c.training], ["govc.jb.exp", c.experience], ["govc.jb.elig", c.eligibility], ["govc.jb.comp", c.competency]];
  return (
    <li className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fiesta-blue/10" aria-hidden><KitIcon name="people" color={FIESTA.blue} className="h-6 w-6" /></span>
        <div className="min-w-0 flex-1 basis-56">
          <h3 className="font-serif text-lg font-bold leading-snug text-fiesta-navy">{c.position}</h3>
          {c.office && <p className="text-sm text-black/70">{c.office}</p>}
        </div>
        {left != null && <span className="rounded-full bg-fiesta-mint px-3 py-1 text-sm font-semibold text-[#1f6b37]">{left === 0 ? t("govc.jb.today") : left === 1 ? t("govc.jb.left1") : t("govc.jb.left").replace("{0}", String(left))}</span>}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div><dt className="text-xs tracking-wide text-black/60 uppercase">{t("govc.jb.sg")}</dt><dd className="font-semibold tabular-nums text-fiesta-navy">{c.salaryGrade ?? "–"}</dd></div>
        <div><dt className="text-xs tracking-wide text-black/60 uppercase">{t("govc.jb.month")}</dt><dd className="font-semibold tabular-nums text-fiesta-navy">{c.monthlySalary != null ? "₱" + c.monthlySalary.toLocaleString("en-PH") : "–"}</dd></div>
        <div><dt className="text-xs tracking-wide text-black/60 uppercase">{t("govc.jb.deadline")}</dt><dd className="font-semibold text-fiesta-navy">{c.deadline ? fmtDate(c.deadline) : "–"}</dd></div>
        {c.itemNo && <div><dt className="text-xs tracking-wide text-black/60 uppercase">{t("govc.jb.item")}</dt><dd className="font-semibold text-fiesta-navy">{c.itemNo}</dd></div>}
      </dl>
      <details className="mt-2">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-fiesta-blue">{t("govc.jb.quals")}</summary>
        <dl className="space-y-1.5 pb-1 text-sm">
          {quals.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="inline font-semibold text-fiesta-navy">{t(k)}: </dt><dd className="inline text-black/75">{v}</dd></div>)}
        </dl>
        <p className="mt-2 text-sm text-black/70">{t("govc.jb.apply").replace("{0}", "")}<a href={`mailto:${MAIL}`} className="font-semibold text-fiesta-blue underline">{MAIL}</a></p>
      </details>
    </li>
  );
}

/** Jobs tab: open postings first (deadline today or later), closed ones paged. "Today" is read on the client after mount so prerender never depends on the clock. */
export default function GovCareers() {
  const t = useT();
  const [today, setToday] = useState(ds.fetchedAt); // prerender and first paint use the snapshot date
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("open");
  const [office, setOffice] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => { const d = new Date(); setToday(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`); setMounted(true); }, []);
  const { rows, counts } = useMemo(() => filterCareers(ds.items, { status, office, q, today }), [status, office, q, today]);
  const pg = pageOf(rows, page, SIZE);
  const set = <A,>(f: (a: A) => void) => (a: A) => { f(a); setPage(1); };
  const opts = [{ v: "", t: t("govc.jb.alloffices") }, ...OFFICES.map((o) => ({ v: o, t: o }))];
  const tabs: [Status, string][] = [["open", "govc.jb.open"], ["closed", "govc.jb.closed"], ["all", "govc.jb.all"]];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 basis-60"><span className="sr-only">{t("govc.jb.search")}</span>
          <input type="search" value={q} onChange={(e) => set(setQ)(e.target.value)} autoComplete="off" placeholder={t("govc.jb.search")} className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-sm outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
        </label>
        <div role="group" aria-label={t("govc.jb.status")} className="inline-flex flex-wrap rounded-full bg-fiesta-navy/5 p-0.5">
          {tabs.map(([v, k]) => <button key={v} type="button" aria-pressed={status === v} onClick={() => set(setStatus)(v)} className={pill(status === v)}>{t(k)} <span className="tabular-nums opacity-80">{counts[v]}</span></button>)}
        </div>
        <div className="w-full sm:w-80"><Dropdown ariaLabel={t("govc.jb.office")} value={office} options={opts} onChange={set(setOffice)} /></div>
      </div>
      {pg.rows.length ? <ul className="space-y-3">{pg.rows.map((c) => <Card key={c.id} c={c} today={today} mounted={mounted} />)}</ul>
        : <p className="rounded-2xl bg-white p-6 text-sm text-black/70 shadow-sm ring-1 ring-black/5">{status === "open" && !q && !office ? t("govc.jb.noopen") : t("govc.jb.none")}</p>}
      {pg.last > 1 && (
        <nav aria-label={t("govc.jb.page").replace("{0}", String(pg.page)).replace("{1}", String(pg.last))} className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button type="button" disabled={pg.page <= 1} onClick={() => setPage(pg.page - 1)} className="min-h-11 rounded-lg border border-black/20 bg-white px-4 text-sm font-semibold text-fiesta-navy hover:border-fiesta-navy disabled:bg-black/5 disabled:text-black/35">‹ {t("govc.jb.prev")}</button>
          <span className="text-sm tabular-nums text-black/70">{t("govc.jb.page").replace("{0}", String(pg.page)).replace("{1}", String(pg.last))}</span>
          <button type="button" disabled={pg.page >= pg.last} onClick={() => setPage(pg.page + 1)} className="min-h-11 rounded-lg border border-black/20 bg-white px-4 text-sm font-semibold text-fiesta-navy hover:border-fiesta-navy disabled:bg-black/5 disabled:text-black/35">{t("govc.jb.next")} ›</button>
        </nav>
      )}
      <p className="text-xs text-black/65"><a href={ds.source} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center underline">{t("govc.jb.src")} ↗</a></p>
    </div>
  );
}
