"use client";
import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { ConfChip, DocSummary, DocType, OfficialPdf, card } from "./GovProcBits";
import { docConf, fieldValue, fmtDate, type DocView } from "@/lib/gov-proc";

export function DocFacts({ d }: { d: DocView }) {
  const rows = Object.keys(d.fields).filter((k) => fieldValue(k, d.fields[k]));
  return (
    <section className={`${card} p-5`} aria-labelledby="facts">
      <h2 id="facts" className="font-serif text-xl font-bold text-fiesta-navy"><T k="govb.d.facts" /></h2>
      {!d.ocr || rows.length === 0 ? <p className="mt-2 text-sm text-black/75"><T k="govb.unread" /></p> : (
        <>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead><tr className="text-xs text-black/65"><th scope="col" className="py-2 pr-3 font-semibold"><T k="govb.d.field" /></th><th scope="col" className="py-2 pr-3 font-semibold"><T k="govb.d.value" /></th><th scope="col" className="py-2 font-semibold"><T k="govb.d.conf" /></th></tr></thead>
              <tbody>
                {rows.map((k) => { const v = fieldValue(k, d.fields[k])!; return (
                  <tr key={k} className="border-t border-black/10 align-top">
                    <th scope="row" className="py-2 pr-3 font-semibold text-fiesta-navy"><T k={`govb.field.${k}`} /></th>
                    <td className="min-w-0 break-words py-2 pr-3 text-black/85">{v.key ? <T k={v.key} /> : v.text}</td>
                    <td className="py-2"><ConfChip conf={d.confidence[k]} /></td>
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
          <details className="mt-4 rounded-xl bg-black/[0.03] p-3">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-fiesta-navy focus-visible:outline-2 focus-visible:outline-fiesta-blue"><T k="govb.d.evidence" /></summary>
            {d.evidence.length === 0 ? <p className="mt-2 text-sm text-black/70">–</p> : (
              <ul className="mt-2 space-y-3 text-sm">
                {d.evidence.map((e, i) => (
                  <li key={i}><p className="font-semibold text-fiesta-navy"><T k={`govb.field.${e.field}`} /> · <T k="govb.d.page" /> {e.page ?? "–"}</p><blockquote className="mt-1 break-words text-black/75">&ldquo;{e.quote}&rdquo;</blockquote></li>
                ))}
              </ul>
            )}
          </details>
        </>
      )}
    </section>
  );
}

export function DocBody({ d, project, prev, next }: { d: DocView; project: { slug: string; title: string } | null; prev: { id: string; type: string } | null; next: { id: string; type: string } | null }) {
  const conf = docConf(d);
  const nav = "inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-fiesta-navy shadow-sm ring-1 ring-black/10 hover:ring-fiesta-navy/40 focus-visible:outline-2 focus-visible:outline-fiesta-blue";
  return (
    <div className="mt-5 space-y-4">
      <header className={`${card} p-5`}>
        <p className="text-xs font-semibold tracking-[0.2em] text-[#b5532f]"><DocType type={d.type} /></p>
        <h1 className="mt-2 break-words font-serif text-2xl font-bold leading-snug text-fiesta-navy md:text-3xl">{d.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/75">
          <span><T k="govb.d.date" />: <span className="tabular-nums">{fmtDate(d.date)}</span></span>
          {d.refNo && <span><T k="govb.d.ref" />: <span className="tabular-nums">{d.refNo}</span></span>}
          {conf ? <ConfChip conf={conf} /> : <span className="rounded-full border border-dashed border-black/30 px-2.5 py-1 text-xs font-semibold text-black/65"><T k="govb.unread.chip" /></span>}
        </p>
        <div className="mt-4"><OfficialPdf url={d.url} /></div>
      </header>
      <section className={`${card} p-5`} aria-labelledby="sum">
        <h2 id="sum" className="font-serif text-xl font-bold text-fiesta-navy"><T k="govb.d.summary" /></h2>
        <div className="mt-2"><DocSummary en={d.summary} fil={d.summaryFil} /></div>
      </section>
      <DocFacts d={d} />
      <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950"><T k="govb.d.disclaimer" /></p>
      <nav aria-label={"Documents"} className="flex flex-wrap items-center justify-between gap-3">
        {prev ? <Link href={`/pamahalaan/dokumento/${prev.id}`} className={nav}>‹ <T k="govb.d.prev" />: <DocType type={prev.type} /></Link> : <span />}
        {project && <Link href={`/pamahalaan/bidding/${project.slug}`} className="min-h-11 content-center text-sm font-semibold text-fiesta-blue underline underline-offset-2"><T k="govb.d.project" /></Link>}
        {next ? <Link href={`/pamahalaan/dokumento/${next.id}`} className={nav}><T k="govb.d.next" />: <DocType type={next.type} /> ›</Link> : <span />}
      </nav>
    </div>
  );
}
