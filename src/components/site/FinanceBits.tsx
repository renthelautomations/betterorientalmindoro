"use client";
import { Fragment } from "react";
import { Accordion, Breadcrumbs } from "@/components/kit/Ui";
import { StatCard } from "@/components/kit/Parts";
import PageTitle from "@/components/site/PageTitle";
import KitIcon from "@/components/kit/KitIcon";
import { T, useT } from "@/lib/i18n/i18n";

type Kit = Parameters<typeof StatCard>[0];

/** Dictionary text with `{0}` slots for values and `**bold**`. Values (counts, pesos, dates, names) stay outside the dictionary. */
export function R({ k, v = [] }: { k: string; v?: React.ReactNode[] }) {
  const s = useT()(k);
  return <>{s.split(/(\*\*[^*]+\*\*|\{\d\})/).map((p, i) => p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : /^\{\d\}$/.test(p) ? <Fragment key={i}>{v[+p[1]]}</Fragment> : p)}</>;
}

/** Kit parts that take plain-string labels, with each label run through the dictionary (unknown strings, such as data, pass through). */
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  const t = useT();
  return <Breadcrumbs items={items.map((i) => ({ ...i, label: t(i.label) }))} />;
}
export function Title({ eyebrow, title }: { eyebrow: string; title: string }) {
  const t = useT();
  return <PageTitle eyebrow={t(eyebrow)} title={t(title)} />;
}
export function Acc({ q, children }: { q: string; children: React.ReactNode }) {
  return <Accordion items={[{ q: useT()(q), a: children }]} />;
}
/** Copy of the kit StatCard whose hint can carry a value (the kit one takes a key only). */
export function FinStat({ label, value, hint, icon, color = "#1f7a8c" }: Omit<Kit, "hint"> & { hint: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold tracking-widest text-black/60"><T k={label} /></p><KitIcon name={icon} variant="duo" color={color} /></div>
      <p className="mt-3 font-serif text-4xl font-bold" style={{ color }}>{value}</p>
      <p className="mt-1 text-sm text-black/60">{hint}</p>
    </div>
  );
}
export function Sec({ k, className, children }: { k: string; className?: string; children: React.ReactNode }) {
  return <section aria-label={useT()(k)} className={className}>{children}</section>;
}
export function MetricRadio({ id, label, checked, className }: { id: string; label: string; checked: boolean; className: string }) {
  return <input type="radio" name="metric" id={`m-${id}`} defaultChecked={checked} aria-label={useT()(label)} className={className} />;
}

/** The proportion bar itself: its screen-reader summary is a string attribute, so it needs the dictionary. */
export function SegBar({ total, parts, children }: { total: number; parts: { name: string; rows: number }[]; children: React.ReactNode }) {
  const t = useT();
  const label = t("finance.bar.aria").replace("{0}", String(total)).replace("{1}", parts.map((p) => `${t(p.name)} ${p.rows}`).join(", "));
  return <div role="img" aria-label={label} className="flex h-6 gap-0.5 overflow-hidden rounded-md bg-black/5 motion-reduce:transition-none">{children}</div>;
}
