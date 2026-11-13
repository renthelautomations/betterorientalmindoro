"use client";
import { useMemo, useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { FIESTA } from "@/components/kit/Patterns";
import type { PmcProject } from "@/lib/pmc";
import ClientPager from "./ClientPager";
import Dropdown from "./Dropdown";
import { PmcCard, TONE, fmtDate, lastOf, peso } from "./PmcCard";

const label = "mb-1 block text-xs font-semibold uppercase tracking-widest text-black/60";
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Inspected projects as cards or a table, with search, a status filter and the same pager as the other lists. */
export default function PmcList({ projects, names }: { projects: PmcProject[]; names: Record<string, string> }) {
  const t = useT();
  const [q, setQ] = useState(""), [st, setSt] = useState(""), [view, setView] = useState<"cards" | "table">("cards"), [page, setPage] = useState(1);
  const size = view === "table" ? 15 : 10;
  const rows = useMemo(() => {
    const w = fold(q).split(/\s+/).filter(Boolean);
    return projects.filter((p) => {
      const l = lastOf(p);
      const ok = !st || (st === "findings" ? p.inspections.some((i) => i.withFindings) : st === "late" ? l.state !== "completed" : l.state === st);
      return ok && w.every((x) => fold(`${p.project} ${p.contractor ?? ""} ${p.fund ?? ""} ${p.barangays.map((b) => names[b] ?? "").join(" ")}`).includes(x));
    });
  }, [projects, q, st, names]);
  const last = Math.max(Math.ceil(rows.length / size), 1), shown = rows.slice((page - 1) * size, page * size);
  return (
    <section aria-labelledby="pmc-list" className="space-y-4">
      <h3 id="pmc-list" className="sr-only"><T k="pmc.tab" /></h3>
      <div className="grid gap-4 rounded-3xl bg-fiesta-mint p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0">
          <label htmlFor="pmc-q" className={label}><T k="pmc.search" /></label>
          <div className="relative">
            <KitIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fiesta-navy/60" />
            <input id="pmc-q" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="min-h-12 w-full rounded-2xl border-2 border-transparent bg-white pl-12 pr-4 text-base text-fiesta-navy shadow-sm outline-none transition focus:border-fiesta-blue" />
          </div>
        </div>
        <div className="min-w-0"><span className={label}><T k="pmc.status" /></span>
          <Dropdown ariaLabel={t("pmc.status")} value={st} onChange={(v) => { setSt(v); setPage(1); }} options={[{ v: "", t: t("pmc.s.all") }, { v: "completed", t: t("pmc.done") }, { v: "ongoing", t: t("pmc.going") }, { v: "late", t: t("pmc.s.late") }, { v: "findings", t: t("pmc.s.find") }]} /></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-black/70" aria-live="polite">{rows.length ? `${(page - 1) * size + 1}–${Math.min(page * size, rows.length)}` : 0} <T k="law.of" /> {rows.length} <T k="law.count" />{rows.length !== projects.length ? ` (${projects.length})` : ""}</p>
        <div role="group" aria-label="View" className="inline-flex rounded-full bg-fiesta-navy/5 p-0.5 text-sm font-semibold">
          {([["cards", "proyekto.view.cards"], ["table", "proyekto.view.table"]] as const).map(([v, k]) => (
            <button key={v} type="button" onClick={() => { setView(v); setPage(1); }} aria-pressed={view === v} className={`inline-flex min-h-10 items-center rounded-full px-4 ${view === v ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`}><T k={k} /></button>
          ))}
        </div>
      </div>
      {!rows.length ? <p className="rounded-2xl bg-white p-5 text-black/75 shadow-sm ring-1 ring-black/5"><T k="law.none" /></p>
        : view === "cards" ? <ul className="grid gap-4 lg:grid-cols-2">{shown.map((p) => <PmcCard key={p.project + p.cost} p={p} names={names} />)}</ul>
        : (
          <div role="region" tabIndex={0} aria-label={t("pmc.tab")} className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
              <thead><tr className="bg-fiesta-navy text-xs text-white">
                {["pmc.c.project", "pmc.c.contractor", "pmc.c.cost", "pmc.c.fund", "pmc.c.status", "pmc.c.visits", "pmc.c.docs"].map((k, i) => <th key={k} scope="col" className={`px-4 py-3 font-semibold ${i === 2 ? "text-right" : i === 5 ? "text-center" : ""}`}><T k={k} /></th>)}
              </tr></thead>
              <tbody>
                {shown.map((p, n) => {
                  const l = lastOf(p), flagged = p.inspections.some((i) => i.withFindings), c = TONE[l.state];
                  return (
                    <tr key={p.project + p.cost} className={`border-b border-black/5 align-middle transition-colors last:border-0 hover:bg-fiesta-mint/50 ${n % 2 ? "bg-fiesta-cream/60" : ""}`}>
                      <td className="w-[28%] min-w-[16rem] px-4 py-4">
                        <a href={l.url} target="_blank" rel="noopener noreferrer" title={p.project} className="line-clamp-2 font-serif text-base font-bold leading-snug text-fiesta-navy hover:underline">{p.project}</a>
                        {p.barangays.length > 0 && <p className="mt-1 flex flex-wrap gap-1">{p.barangays.slice(0, 3).map((b) => <span key={b} className="rounded-full bg-fiesta-mint px-2 py-0.5 text-[11px] font-semibold text-fiesta-navy">{names[b]}</span>)}{p.barangays.length > 3 && <span className="rounded-full bg-fiesta-navy/10 px-2 py-0.5 text-[11px] font-bold text-fiesta-navy">+{p.barangays.length - 3}</span>}</p>}
                      </td>
                      <td className="px-4 py-4 text-black/80">{p.contractor ?? "-"}</td>
                      <td className="px-4 py-4 text-right font-serif text-base font-bold tabular-nums text-fiesta-navy">{peso(p.cost)}</td>
                      <td className="px-4 py-4"><span className="inline-block rounded-full bg-fiesta-cream px-2.5 py-1 text-xs font-medium text-fiesta-navy ring-1 ring-black/5">{p.fund ?? "-"}</span></td>
                      <td className="min-w-[10rem] px-4 py-4">
                        <div className="flex items-center gap-2"><span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: c }}>{l.progress != null ? `${l.progress}%` : "–"}</span>{flagged && <span className="rounded-full bg-fiesta-yellow/40 px-2 py-0.5 text-[11px] font-bold text-fiesta-navy"><T k="pmc.withfind" /></span>}</div>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-black/10" aria-hidden><span className="block h-full rounded-full" style={{ width: `${Math.min(l.progress ?? 0, 100)}%`, background: c }} /></span>
                        <p className="mt-1 text-xs text-black/65">{fmtDate(l.date)}</p>
                      </td>
                      <td className="px-4 py-4 text-center"><span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-fiesta-navy/5 px-2 font-bold tabular-nums text-fiesta-navy">{p.inspections.length}</span></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.bidDocs.length > 0 && <span className="rounded-full bg-fiesta-blue/10 px-2.5 py-1 text-xs font-semibold text-fiesta-blue">{p.bidDocs.length} <T k="pmc.c.bids" /></span>}
                          {p.philgeps.length > 0 && <span className="rounded-full bg-fiesta-green/15 px-2.5 py-1 text-xs font-semibold text-[#1f6b37]">PhilGEPS</span>}
                          {!p.bidDocs.length && !p.philgeps.length && <span className="text-black/50">-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      <ClientPager page={page} last={last} onPage={(n) => { setPage(n); document.getElementById("pmc-q")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} />
    </section>
  );
}
