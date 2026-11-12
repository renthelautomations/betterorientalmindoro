"use client";
import { useMemo, useState } from "react";
import Dropdown from "./Dropdown";
import { FlagSvg, ProgLabel } from "./RedFlagsBits";
import { TF } from "./DynBits";
import { T, useT } from "@/lib/i18n/i18n";
import { fmtPeso } from "@/lib/badyet";
import { GROUPS, filterRows, pageOf, programOf, type Group, type Row } from "@/lib/redflags";

const GROUP_TONE: Record<Group, string> = { house_only: "bg-[#fdf0d5] text-[#7a4a00]", increased: "bg-[#fbece5] text-[#8a3a18]", unchanged: "bg-[#e6ecf8] text-fiesta-navy", decreased: "bg-[#e2f2e7] text-[#1f6b37]", nep_only: "bg-[#e7f1f8] text-[#14597f]" };
const pill = (on: boolean) => `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;

/** Every project of the slice with filters. Amounts side by side, a dash when a version has no figure. Each card links to the House bill page and to the BetterGov project page. */
export default function RedFlagsList({ rows, towns }: { rows: Row[]; towns: { slug: string; name: string }[] }) {
  const t = useT();
  const [group, setGroup] = useState<Group | "">("");
  const [program, setProgram] = useState("");
  const [town, setTown] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const name = (s: string | null) => towns.find((x) => x.slug === s)?.name;
  const programs = useMemo(() => [...new Set(rows.map(programOf))], [rows]);
  const shown = useMemo(() => filterRows(rows, { group: group || undefined, program: program || undefined, town: town || undefined, q }), [rows, group, program, town, q]);
  const pg = pageOf(shown, page);
  const reset = (f: () => void) => { f(); setPage(1); };
  const counts = (g: Group) => rows.filter((r) => r.group === g).length;
  const progOpts = [{ v: "", t: t("rf.f.allprog") }, ...programs.map((p) => ({ v: p, t: ["fmr", "hfep", "nia"].includes(p) ? t(`rf.p.${p}`) : p }))];
  const townOpts = [{ v: "", t: t("rf.f.alltowns") }, ...towns.filter((x) => rows.some((r) => r.town === x.slug)).map((x) => ({ v: x.slug, t: x.name }))];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 basis-56"><span className="sr-only">{t("rf.f.search")}</span>
          <input type="search" value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder={t("rf.f.search")} autoComplete="off" className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-sm outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" /></label>
        <div className="w-56"><Dropdown value={program} onChange={(v) => reset(() => setProgram(v))} options={progOpts} ariaLabel={t("rf.f.program")} /></div>
        <div className="w-48"><Dropdown value={town} onChange={(v) => reset(() => setTown(v))} options={townOpts} ariaLabel={t("rf.f.town")} /></div>
      </div>
      <div role="group" aria-label={t("rf.list.h")} className="mt-3 inline-flex flex-wrap rounded-full bg-fiesta-navy/5 p-0.5">
        <button type="button" aria-pressed={group === ""} onClick={() => reset(() => setGroup(""))} className={pill(group === "")}>{t("rf.f.all")} <span className="ml-1.5 tabular-nums opacity-80">{rows.length}</span></button>
        {GROUPS.filter((g) => counts(g) > 0).map((g) => <button key={g} type="button" aria-pressed={group === g} onClick={() => reset(() => setGroup(g))} className={pill(group === g)}>{t(`rf.grp.${g}`)} <span className="ml-1.5 tabular-nums opacity-80">{counts(g)}</span></button>)}
      </div>
      <p className="mt-3 text-sm text-black/70" aria-live="polite"><TF k="rf.count" v={[shown.length]} /></p>

      {pg.rows.length ? (
        <ul className="mt-3 grid auto-rows-fr gap-3 md:grid-cols-2">
          {pg.rows.map((r) => (
            <li key={r.id} className="flex min-w-0 flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${GROUP_TONE[r.group]}`}>{r.group === "house_only" && <FlagSvg className="h-3.5 w-3.5" />}{t(`rf.grp.${r.group}`)}</span>
                {r.held && <span className="rounded-full bg-black/5 px-2.5 py-1 text-black/75">{t("rf.unconf")}</span>}
                <span className="text-black/65"><ProgLabel row={r} /></span>
              </div>
              <p className="line-clamp-3 font-semibold leading-snug text-fiesta-navy" title={r.title}>{r.title}</p>
              <p className="text-xs text-black/65">{name(r.town) ?? t("rf.untown")}</p>
              <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-black/10 pt-3">
                <div><dt className="text-[11px] font-semibold tracking-wide text-black/65 uppercase">{t("rf.l.nep")}</dt><dd className="font-serif text-lg font-bold tabular-nums text-fiesta-navy">{fmtPeso(r.nep)}</dd></div>
                <div><dt className="text-[11px] font-semibold tracking-wide text-black/65 uppercase">{t("rf.l.house")}</dt><dd className="font-serif text-lg font-bold tabular-nums text-fiesta-navy">{fmtPeso(r.house)}</dd></div>
              </dl>
              <p className="flex flex-wrap gap-x-4 text-sm font-semibold">
                {r.pages.house && <a href={r.pages.house} rel="noopener" className="inline-flex min-h-11 items-center text-fiesta-blue underline underline-offset-2">{t("rf.link.house")} ↗</a>}
                <a href={r.url} rel="noopener" className="inline-flex min-h-11 items-center text-fiesta-blue underline underline-offset-2">{t("rf.link.bg")} ↗</a>
              </p>
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-black/70 shadow-sm ring-1 ring-black/5">{t("rf.none")}</p>}

      {pg.last > 1 && (
        <nav aria-label="Pages" className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled={pg.page <= 1} onClick={() => setPage(pg.page - 1)} className="min-h-11 rounded-full border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white disabled:opacity-40">{t("rf.prev")}</button>
          <span className="text-sm tabular-nums text-black/75"><TF k="rf.page" v={[pg.page, pg.last]} /></span>
          <button type="button" disabled={pg.page >= pg.last} onClick={() => setPage(pg.page + 1)} className="min-h-11 rounded-full border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white disabled:opacity-40">{t("rf.next")}</button>
        </nav>
      )}
    </div>
  );
}
