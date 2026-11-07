"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { T, useT } from "@/lib/i18n/i18n";

// Date these four pages' text was last revised.
export const DOC_UPDATED = "2026-11-08";

export type DocSection = { id: string; h: string; body: ReactNode };

/** Chrome for Terms / Privacy / Accessibility / FAQ: header, last-updated chip, optional sticky contents (lg). */
export function DocShell({ titleKey, eyebrowKey = "docs.eyebrow.info", sections = [], children }: { titleKey: string; eyebrowKey?: string; sections?: { id: string; h: string }[]; children: ReactNode }) {
  const t = useT();
  const title = t(titleKey);
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <div className="max-w-3xl">
        <PageHead crumbs={[{ label: t("docs.home"), href: "/" }, { label: title }]} eyebrow={t(eyebrowKey)} title={title} />
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-fiesta-mint/70 px-3 py-1.5 text-xs font-semibold text-fiesta-navy"><KitIcon name="calendar" className="h-4 w-4" /><T k="uxa.doc.updated" /> {DOC_UPDATED}</p>
      </div>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[13rem_minmax(0,48rem)]">
        {sections.length > 1 && (
          <nav aria-label={t("uxa.doc.toc")} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-28 lg:order-first">
            <p className="text-xs font-semibold tracking-widest text-black/65"><T k="uxa.doc.toc" /></p>
            <ol className="mt-2 space-y-0.5 text-sm">
              {sections.map((s) => <li key={s.id}><Link href={`#${s.id}`} className="flex min-h-11 items-center rounded-lg px-2 font-medium text-fiesta-navy hover:bg-fiesta-mint/50 focus-visible:outline-2 focus-visible:outline-fiesta-blue">{s.h}</Link></li>)}
            </ol>
          </nav>
        )}
        <div className={`min-w-0 ${sections.length > 1 ? "" : "lg:col-span-2"}`}>{children}</div>
      </div>
    </main>
  );
}

/** Long-form body: optional callout card, then each section as an anchored h2. */
export function DocBody({ callout, sections, icons = [] }: { callout?: ReactNode; sections: DocSection[]; icons?: KitIconName[] }) {
  return (
    <div className="space-y-5 leading-relaxed">
      {callout && <p className="rounded-2xl bg-fiesta-mint/60 p-5 text-black/80">{callout}</p>}
      {sections.map((s, i) => (
        <section key={s.id} aria-labelledby={s.id} className="scroll-mt-28 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 id={s.id} className="flex items-center gap-3 font-serif text-xl font-bold"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fiesta-blue"><KitIcon name={icons[i] ?? "doc"} color="#fff" className="h-5 w-5" /></span>{s.h}</h2>
          <div className="mt-3 space-y-3 text-black/80 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">{s.body}</div>
        </section>
      ))}
    </div>
  );
}

const ICONS: KitIconName[] = ["shield", "mountain", "pin", "budget", "people"];
const BG = ["bg-fiesta-blue", "bg-fiesta-orange", "bg-fiesta-green", "bg-fiesta-red"];

/** FAQ: one white card per question, icon badge, native details/summary. */
export function DocFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <details key={it.q} className="group rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 rounded-2xl px-5 py-3 focus-visible:outline-2 focus-visible:outline-fiesta-blue [&::-webkit-details-marker]:hidden">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${BG[i % 4]}`}><KitIcon name={ICONS[i % ICONS.length]} color="#fff" className="h-5 w-5" /></span>
            <span className="flex-1 font-serif text-lg font-bold leading-snug">{it.q}</span>
            <KitIcon name="arrow" className="h-5 w-5 shrink-0 rotate-90 text-fiesta-blue transition group-open:-rotate-90" />
          </summary>
          <p className="px-5 pb-5 pl-[4.75rem] leading-relaxed text-black/75">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
