"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { T, useLang, useT } from "@/lib/i18n/i18n";
import { getReports } from "@/lib/gov";
import { getReportDocs, type ReportDoc } from "@/lib/gov-docs";
import { lgsfQuarter, lgsfQuarters } from "@/lib/gov-doc-flags";
import { fmtDate } from "@/lib/gov-doc-format";
import { fmtPeso, reportKinds, sortByDateDesc } from "@/lib/gov-doc-view";
import { Badge, BarList, CheckSvg, FlagSvg, KindChip, Pills } from "./GovDocBits";
import { CARD, KIND_LOOK } from "./govDocLook";

const sbLabel = (title: string, date: string | null) => { const n = title.match(/supplemental\s+budget\s+(?:no\.?\s*)?(\d+)/i)?.[1]; return n ? `${date?.slice(0, 4) ?? ""} · SB ${n}` : fmtDate(date); };

/** Financial reports and assistance: timeline with kind filter, supplemental-budget bars (amount as printed, dash when unknown), LGSF quarter strip. */
export default function GovReports() {
  const t = useT();
  const fil = useLang() === "fil";
  const all = useMemo(() => sortByDateDesc(getReports().items), []);
  const docs = useMemo(() => new Map<string, ReportDoc>(getReportDocs().map((d) => [d.id, d])), []);
  const [kind, setKind] = useState("");
  const rows = kind ? all.filter((r) => r.kind === kind) : all;
  const sbs = all.filter((r) => r.kind === "supplemental-budget");
  const { listed, notListed, latest } = useMemo(() => lgsfQuarters(all), [all]);
  const missing = new Set(notListed.map((x) => `${x.year}-${x.q}`));
  const listedBy = new Map([...listed].map(([i, ids]) => [`${Math.floor(i / 4)}-${(i % 4) + 1}`, ids[0]]));
  const years = latest ? Array.from({ length: +latest.slice(0, 4) - Math.min(...[...listed.keys()].map((i) => Math.floor(i / 4))) + 1 }, (_, n) => +latest.slice(0, 4) - n) : [];
  const h2 = "font-serif text-lg font-bold text-fiesta-navy";
  const h2b = "mt-1 text-xs text-black/65";
  return (
    <div className="space-y-6">
      <section aria-labelledby="rp-sb" className={`${CARD} p-5`}>
        <h2 id="rp-sb" className={h2}><T k="gova.rep.sb" /></h2>
        <p className={`${h2b} mb-3`}><T k="gova.amount.printed" /></p>
        <BarList aria={t("gova.rep.sb")} rows={sbs.map((r) => { const v = docs.get(r.id)?.totalAmount ?? null; return { key: r.id, label: sbLabel(r.title, r.date), value: v, text: fmtPeso(v), color: "#2b4fa3" }; })} />
        {sbs.every((r) => docs.get(r.id)?.totalAmount == null) && <p className="mt-3 text-sm text-black/65"><T k="gova.rep.amountsSoon" /></p>}
      </section>

      <section aria-labelledby="rp-q" className={`${CARD} p-5`}>
        <h2 id="rp-q" className={h2}><T k="gova.rep.lgsf" /></h2>
        <p className={`${h2b} mb-3`}><T k="gova.rep.lgsfNote" /></p>
        <div className="space-y-3">
          {years.map((y) => (
            <div key={y} className="grid grid-cols-[3.5rem_1fr] items-center gap-3">
              <span className="font-serif font-bold text-fiesta-navy">{y}</span>
              <ul className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((q) => {
                  const k = `${y}-${q}`; const id = listedBy.get(k); const miss = missing.has(k);
                  const body = id ? <><CheckSvg className="h-4 w-4" /> Q{q}<span className="sr-only"> - <T k="gova.q.listed" /></span></> : miss ? <><FlagSvg className="h-4 w-4" /> Q{q}<span className="sr-only"> - <T k="gova.q.notListed" /></span></> : <>Q{q} –<span className="sr-only"> - <T k="gova.q.na" /></span></>;
                  const cls = "flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold";
                  return <li key={q}>{id ? <Link href={`/pamahalaan/ulat/${id}`} className={`${cls} bg-fiesta-mint text-fiesta-navy hover:shadow focus-visible:outline-2 focus-visible:outline-fiesta-blue`}>{body}</Link> : <span className={`${cls} ${miss ? "bg-black/5 text-black/70" : "text-black/65"}`}>{body}</span>}</li>;
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-4 text-xs text-black/70"><span className="inline-flex items-center gap-1"><CheckSvg className="h-3.5 w-3.5" /><T k="gova.q.listed" /></span><span className="inline-flex items-center gap-1"><FlagSvg className="h-3.5 w-3.5" /><T k="gova.q.notListed" /></span></p>
      </section>

      <Pills label={t("gova.rep.kind")} value={kind} onChange={setKind} options={[{ v: "", t: t("gova.all") }, ...reportKinds.map((k) => ({ v: k, t: t(`gova.kind.${k}`) }))]} />
      <p role="status" className="text-sm text-black/70">{rows.length} <T k="gova.rep.count" /></p>
      <ol className="space-y-4">
        {rows.map((r) => {
          const d = docs.get(r.id); const look = KIND_LOOK[r.kind]; const q = r.kind === "lgsf" ? lgsfQuarter(r.title) : null;
          return (
            <li key={r.id} className={`${CARD} relative flex gap-4 p-5 hover:shadow-md`}>
              <Badge icon={look.icon} color={look.color} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest text-black/65 uppercase"><time dateTime={r.date ?? undefined}>{fmtDate(r.date)}</time><KindChip kind={r.kind} />{q && <span>Q{q.q} {q.year}</span>}</p>
                <h3 className="mt-1 font-serif text-lg font-bold leading-snug text-fiesta-navy"><Link href={`/pamahalaan/ulat/${r.id}`} className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-fiesta-blue">{r.title}</Link></h3>
                {d ? <p className="mt-2 text-sm text-black/75">{(fil ? d.summaryFil : d.summary).slice(0, 190)}</p> : <p className="mt-2 text-sm text-black/65"><T k="gova.summary.coming" /></p>}
                {d?.totalAmount != null && <p className="mt-1 text-sm font-semibold text-fiesta-navy tabular-nums">{fmtPeso(d.totalAmount)} <span className="font-normal text-black/65">· <T k="gova.amount.printed" /></span></p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
