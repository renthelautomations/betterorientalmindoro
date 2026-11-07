"use client";
import Link from "next/link";
import { PatternFill } from "@/components/kit/Patterns";
import { T, useLang, useT } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";
import { ConfChip, DocType, OfficialPdf, Stepper, WorkBadge, WORK_COLOR, card } from "./GovProcBits";
import { STAGES, docConf, fmtDate, php, stageGaps, type Card, type DocView } from "@/lib/gov-proc";

export function ProjectHeader({ c }: { c: Card }) {
  const color = WORK_COLOR[c.work] ?? "#1b2a4a";
  return (
    <header className="relative isolate mt-5 overflow-hidden rounded-2xl text-white shadow-sm" style={{ background: color }}>
      <div className="relative h-14" aria-hidden><PatternFill variant="dotblocks" colors={["#fff"]} opacity={0.16} /></div>
      <div className="flex items-start gap-4 px-5 pb-6 pt-2 md:px-7">
        <WorkBadge work={c.work} className="relative z-10 -mt-9 h-14 w-14 shrink-0 !bg-white !text-fiesta-navy" />
        <div className="min-w-0">
          <p className="text-sm font-semibold tabular-nums tracking-wide">{c.refNo}</p>
          <h1 className="mt-1 font-serif text-2xl font-bold leading-snug md:text-3xl">{c.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"><T k={`govb.work.${c.work}`} /> · {c.townName ?? <T k="govb.notown" />}</p>
        </div>
      </div>
    </header>
  );
}

/** Sentences composed only from fields that exist; a missing field simply leaves its sentence out. */
export function ProjectSummary({ c }: { c: Card }) {
  const t = useT();
  const listed = STAGES.filter((s) => c.stages[s]);
  const award = c.stages.reso || c.stages.noa;
  return (
    <section className={`${card} p-5`} aria-labelledby="sum">
      <h2 id="sum" className="font-serif text-xl font-bold text-fiesta-navy"><T k="govb.p.summary" /></h2>
      <div className="mt-2 space-y-2 text-black/80">
        <p><TF k="govb.sum.listed" v={[listed.length, listed.map((s) => t(`govb.type.${s}`)).join(", ") || "–"]} /></p>
        {c.townName && <p><TF k="govb.sum.town" v={[c.townName, `govb.work.${c.work}`]} /></p>}
        {c.abc && <p><TF k="govb.sum.abc" v={[php(c.abc.v)]} /></p>}
        {c.price && <p><TF k="govb.sum.price" v={[php(c.price.v)]} /></p>}
        {c.contractor && <p><TF k="govb.sum.contractor" v={[c.contractor.v]} /></p>}
        {c.bidType && <p><TF k="govb.sum.bid" v={[`govb.val.${c.bidType.v}`]} /></p>}
        {!award && <p><T k="govb.sum.noaward" /></p>}
        <p className="text-sm text-black/70"><T k="govb.sum.caveat" /></p>
      </div>
    </section>
  );
}

export function Timeline({ c }: { c: Card }) {
  const t = useT();
  const gaps = stageGaps(c.stages);
  return (
    <section className={`${card} p-5`} aria-labelledby="tl">
      <h2 id="tl" className="font-serif text-xl font-bold text-fiesta-navy"><T k="govb.p.timeline" /></h2>
      <div className="mt-4 overflow-x-auto pb-2"><div className="min-w-[34rem]"><Stepper stages={c.stages} /></div>
        <ol className="mt-3 grid min-w-[34rem] grid-cols-5 gap-1 text-center text-xs text-black/80">
          {STAGES.map((s) => <li key={s} className="min-w-0"><span className="block font-semibold tabular-nums text-fiesta-navy">{fmtDate(c.stages[s]?.date)}</span>{c.stages[s] ? null : <span className="block text-black/65"><T k="govb.notlisted" /></span>}</li>)}
        </ol>
      </div>
      {gaps.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-black/80">
          {gaps.map((g) => <li key={g.to}><TF k="govb.gap" v={[t(`govb.type.${g.from}`), t(`govb.type.${g.to}`), g.days]} /></li>)}
        </ul>
      ) : <p className="mt-3 text-sm text-black/70"><T k="govb.gap.none" /></p>}
    </section>
  );
}

export function PriceCard({ c }: { c: Card }) {
  const both = c.abc?.conf === "high" && c.price?.conf === "high";
  const max = both ? Math.max(c.abc!.v, c.price!.v) : 1;
  const diff = both ? c.price!.v - c.abc!.v : 0;
  const row = (label: string, v: number, color: string) => (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm"><span className="font-semibold text-black/75"><T k={label} /></span><span className="font-serif text-lg font-bold tabular-nums text-fiesta-navy">{php(v)}</span></div>
      <div className="mt-1 h-3 rounded-full bg-black/5" aria-hidden><div className="h-full rounded-full" style={{ width: `${Math.max((v / max) * 100, 2)}%`, background: color }} /></div>
    </div>
  );
  return (
    <section className={`${card} p-5`} aria-labelledby="pc">
      <h2 id="pc" className="font-serif text-xl font-bold text-fiesta-navy"><T k="govb.p.price" /></h2>
      {both ? (
        <div className="mt-3 space-y-3">
          {row("govb.abc", c.abc!.v, "#2b4fa3")}{row("govb.price", c.price!.v, "#c4431a")}
          <p className="text-sm text-black/80"><TF k={diff === 0 ? "govb.diff.same" : diff < 0 ? "govb.diff.lower" : "govb.diff.higher"} v={[php(Math.abs(diff))]} /></p>
        </div>
      ) : (
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {([["govb.abc", c.abc], ["govb.price", c.price]] as const).map(([k, m]) => (
            <div key={k}><dt className="text-xs font-semibold text-black/65"><T k={k} /></dt><dd className="font-serif text-lg font-bold tabular-nums text-fiesta-navy">{m ? php(m.v) : "–"} {m && <ConfChip conf={m.conf} />}</dd></div>
          ))}
        </dl>
      )}
      <p className="mt-3 text-xs text-black/70"><T k="govb.price.note" /></p>
      <dl className="mt-3 grid gap-3 border-t border-black/10 pt-3 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold text-black/65"><T k="govb.contractor" /></dt><dd className="text-sm text-black/85">{c.contractor?.v ?? "–"}</dd></div>
        <div><dt className="text-xs font-semibold text-black/65"><T k="govb.bidtype" /></dt><dd className="text-sm text-black/85">{c.bidType ? <T k={`govb.val.${c.bidType.v}`} /> : "–"}</dd></div>
      </dl>
    </section>
  );
}

export function DocList({ docs }: { docs: DocView[] }) {
  const lang = useLang();
  return (
    <ul className="space-y-3">
      {docs.map((d) => {
        const conf = docConf(d);
        return (
          <li key={d.id} className={card}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-serif text-lg font-bold text-fiesta-navy"><DocType type={d.type} /></h3>
              <span className="text-sm tabular-nums text-black/70">{fmtDate(d.date)}</span>
              {conf ? <ConfChip conf={conf} /> : <span className="rounded-full border border-dashed border-black/30 px-2.5 py-1 text-xs font-semibold text-black/65"><T k="govb.unread.chip" /></span>}
            </div>
            <p className="mt-2 text-sm text-black/80">{d.ocr ? ((lang === "en" ? d.summary : d.summaryFil ?? d.summary) ?? d.title) : d.title}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/pamahalaan/dokumento/${d.id}`} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-fiesta-navy shadow-sm ring-1 ring-black/10 hover:ring-fiesta-navy/40 focus-visible:outline-2 focus-visible:outline-fiesta-blue"><T k="govb.opendoc" /></Link>
              <OfficialPdf url={d.url} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
