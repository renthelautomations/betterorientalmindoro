import Link from "next/link";
import type { ReactNode } from "react";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { PatternFill } from "@/components/kit/Patterns";
import { TBreadcrumbs } from "@/components/site/DynBits";
import Bilingual from "@/lib/i18n/Bilingual";
import { T } from "@/lib/i18n/i18n";
import type { DocFlag } from "@/lib/gov-doc-flags";
import type { Confidence, DocEvidence } from "@/lib/gov-docs";
import GovFlagCard from "./GovFlagCard";
import { PdfButton, SummaryNote } from "./GovDocBits";
import { CARD } from "./govDocLook";

export type Nav = { href: string; label: string } | null;
export type Related = { heading: string; items: { label: string; href: string | null }[] };

/** Shared anatomy of the executive-order and report pages. Works with no summary: official title, PDF link and a calm "summary coming" note. */
export default function GovDocPage(p: {
  crumbs: { label: string; href?: string }[];
  band: { color: string; icon: KitIconName; eyebrow: ReactNode; heading: string; side: ReactNode };
  title: string;
  summary: { en: string; fil: string } | null;
  points?: string[];
  children?: ReactNode;
  related?: Related[];
  pdf: string | null;
  evidence?: DocEvidence[]; pageCount?: number; confidence?: Confidence;
  prev: Nav; next: Nav;
  flags: DocFlag[];
}) {
  const h2 = "font-serif text-xl font-bold text-fiesta-navy";
  const related = (p.related ?? []).filter((r) => r.items.length);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TBreadcrumbs items={p.crumbs} />
      <header className="mt-4 overflow-hidden rounded-2xl text-white" style={{ background: p.band.color }}>
        {/* pattern on a strip of its own; every word sits on the solid colour below it */}
        <div className="relative h-12" aria-hidden><PatternFill variant="mosaic" colors={["#fff"]} opacity={0.16} /></div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase"><KitIcon name={p.band.icon} className="h-5 w-5" />{p.band.eyebrow}</p>
              <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{p.band.heading}</h1>
            </div>
            <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-fiesta-navy">{p.band.side}</div>
          </div>
          <p className="mt-4 max-w-3xl font-serif text-lg leading-snug md:text-xl">{p.title}</p>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        <section aria-labelledby="doc-sum" className={`${CARD} p-6`}>
          <h2 id="doc-sum" className={h2}><T k="gova.summary.h" /></h2>
          {p.summary ? <p className="mt-2 max-w-3xl text-black/80"><Bilingual en={p.summary.en} fil={p.summary.fil} /></p> : <div className="mt-2"><SummaryNote /></div>}
          {p.summary && <p className="mt-3 text-xs text-black/65"><T k="gova.summary.aid" /></p>}
          {p.points && p.points.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-black/80">{p.points.map((k) => <li key={k}>{k}</li>)}</ul>}
        </section>

        {p.children}

        {related.map((r) => (
          <section key={r.heading} className={`${CARD} p-6`}>
            <h2 className={h2}><T k={r.heading} /></h2>
            <ul className="mt-2 space-y-1">
              {r.items.map((i) => <li key={i.label}>{i.href ? <Link href={i.href} className="inline-flex min-h-11 items-center font-semibold text-fiesta-blue underline">{i.label}</Link> : <span className="inline-flex min-h-11 items-center text-black/80">{i.label}</span>}</li>)}
            </ul>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-3"><PdfButton url={p.pdf} /></div>

        {p.evidence && p.evidence.length > 0 && (
          <details className={`${CARD} p-6`}>
            <summary className="min-h-11 cursor-pointer font-serif text-xl font-bold text-fiesta-navy focus-visible:outline-2 focus-visible:outline-fiesta-blue"><T k="gova.ev.h" /></summary>
            <p className="mt-2 text-sm text-black/70"><T k="gova.ev.ocr" /></p>
            <ul className="mt-3 space-y-3">
              {p.evidence.map((e, i) => <li key={i} className="rounded-xl bg-fiesta-cream p-3 text-sm"><span className="font-semibold text-fiesta-navy"><T k="gova.page" /> {e.page}</span><q className="mt-1 block text-black/80">{e.quote}</q></li>)}
            </ul>
            <p className="mt-3 text-xs text-black/65">{p.pageCount != null && <>{p.pageCount} <T k="gova.pages" /> · </>}{p.confidence && <><T k="gova.flag.conf" />: <T k={`gova.conf.${p.confidence}`} /></>}</p>
          </details>
        )}

        {p.flags.length > 0 && (
          <section aria-labelledby="doc-flags">
            <h2 id="doc-flags" className={h2}><T k="gova.flags.h" /></h2>
            <div className="mt-3 space-y-3">{p.flags.map((f) => <GovFlagCard key={f.id} flag={f} />)}</div>
          </section>
        )}

        <nav aria-label="Previous and next" className="grid gap-3 sm:grid-cols-2">
          {p.prev ? <Link href={p.prev.href} className={`${CARD} flex min-h-11 flex-col p-4 hover:shadow-md`}><span className="text-xs font-semibold text-black/65">← <T k="gova.prev" /></span><span className="font-serif font-bold text-fiesta-navy">{p.prev.label}</span></Link> : <span />}
          {p.next ? <Link href={p.next.href} className={`${CARD} flex min-h-11 flex-col p-4 text-right hover:shadow-md`}><span className="text-xs font-semibold text-black/65"><T k="gova.next" /> →</span><span className="font-serif font-bold text-fiesta-navy">{p.next.label}</span></Link> : <span />}
        </nav>
      </div>
    </main>
  );
}
