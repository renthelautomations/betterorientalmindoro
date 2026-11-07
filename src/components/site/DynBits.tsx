"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Accordion, Breadcrumbs, Checklist, EmptyState } from "@/components/kit/Ui";
import { Callout } from "@/components/kit/Parts";
import { useT } from "@/lib/i18n/i18n";

// Client wrappers: kit components take plain strings, so these translate dictionary keys first. Unknown strings (data) pass through unchanged.

/** Dictionary text with {0}, {1} filled in. Values that are dictionary keys are translated too. */
export function TF({ k, v = [] }: { k: string; v?: (string | number)[] }) {
  const t = useT();
  return <>{t(k).replace(/\{(\d)\}/g, (_, i) => t(String(v[+i] ?? "")))}</>;
}

export function TBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const t = useT();
  return <Breadcrumbs items={items.map((i) => ({ ...i, label: t(i.label) }))} />;
}
export function TAccordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const t = useT();
  return <Accordion items={items.map((i) => ({ ...i, q: t(i.q) }))} />;
}
export function TChecklist({ title, items }: { title: string; items: string[] }) { return <Checklist title={useT()(title)} items={items} />; }
export function TEmptyState({ title, children }: { title: string; children?: ReactNode }) { return <EmptyState title={useT()(title)}>{children}</EmptyState>; }
/** Callout whose title is a dictionary key followed by a data name, e.g. "Nothing listed yet for Calapan". */
export function TCallout({ titleKey, name, children }: { titleKey: string; name: string; children: ReactNode }) {
  return <Callout kind="info" title={`${useT()(titleKey)} ${name}`}>{children}</Callout>;
}
export function TNav({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return <nav aria-label={useT()(label)} className={className}>{children}</nav>;
}
/** Same look as PageHead / PageTitle; eyebrow, title and crumbs are dictionary keys (or data). */
export function TPageHead({ crumbs, eyebrow, title, children }: { crumbs: { label: string; href?: string }[]; eyebrow: string; title: string; children?: ReactNode }) {
  const t = useT();
  return (
    <header>
      <TBreadcrumbs items={crumbs} />
      <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-[#b5532f]">{t(eyebrow)}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{t(title)}</h1>
      <div className="mt-3 h-1 w-16 rounded-full bg-fiesta-orange" />
      {children && <div className="mt-4 max-w-2xl space-y-2 text-black/75">{children}</div>}
    </header>
  );
}
export function TPageTitle({ eyebrow, title, color = "#b5532f" }: { eyebrow: string; title: string; color?: string }) {
  const t = useT();
  return (
    <header>
      <p className="text-xs font-semibold tracking-[0.2em]" style={{ color }}>{t(eyebrow)}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold">{t(title)}</h1>
      <div className="mt-3 h-1 w-16 rounded-full" style={{ background: color }} />
    </header>
  );
}

/** Scrollable table region whose aria-label is a translated caption. */
export function DynRegion({ k, v, children }: { k: string; v?: string[]; children: ReactNode }) {
  const t = useT();
  const label = t(k).replace(/\{(\d)\}/g, (_, i) => v?.[+i] ?? "");
  return <div role="region" aria-label={label} tabIndex={0} className="overflow-x-auto rounded-2xl border border-black/10 bg-white">{children}</div>;
}
/** Winner link in the grid; the aria-label is "Seat year, town: names". */
export function DynCellLink({ href, seat, year, town, names, children }: { href: string; seat: string; year: number; town: string; names: string; children: ReactNode }) {
  const t = useT();
  return <Link href={href} aria-label={`${t(seat)} ${year}, ${town}: ${names}`} className="font-medium text-fiesta-blue underline decoration-black/20 underline-offset-2">{children}</Link>;
}
