"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { T, useT } from "@/lib/i18n/i18n";
import { pageWindow } from "@/lib/projects";
import type { EoTopic } from "@/lib/gov-docs";
import type { ReportKind } from "@/lib/gov";
import { TOPIC_LOOK, KIND_LOOK } from "./govDocLook";

export const FlagSvg = ({ className = "h-5 w-5" }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>;
export const CheckSvg = ({ className = "h-5 w-5" }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

/** Small tinted chip with a colour dot; text stays navy for contrast. */
export function Chip({ color, children }: { color: string; children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-fiesta-navy" style={{ background: `${color}22` }}><span aria-hidden className="h-2 w-2 rounded-full" style={{ background: color }} />{children}</span>;
}
export const TopicChip = ({ topic }: { topic: EoTopic }) => <Chip color={TOPIC_LOOK[topic].color}><T k={`gova.topic.${topic}`} /></Chip>;
export const KindChip = ({ kind }: { kind: ReportKind }) => <Chip color={KIND_LOOK[kind].color}><T k={`gova.kind.${kind}`} /></Chip>;

/** Round icon badge like ServiceTile's. */
export const Badge = ({ icon, color }: { icon: KitIconName; color: string }) => <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5"><KitIcon name={icon} color={color} className="h-6 w-6" /></span>;

export function Pills<V extends string>({ label, value, options, onChange }: { label: string; value: V; options: { v: V; t: string }[]; onChange: (v: V) => void }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap rounded-3xl bg-fiesta-navy/5 p-0.5">
      {options.map((o) => <button key={o.v} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)} className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-fiesta-blue ${value === o.v ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`}>{o.t}</button>)}
    </div>
  );
}

export function SearchPill({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <KitIcon name="search" className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-fiesta-navy/60" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 bg-white pr-4 pl-11 text-sm text-fiesta-navy outline-none placeholder:text-black/55 focus-visible:border-fiesta-blue focus-visible:ring-4 focus-visible:ring-fiesta-blue/20" />
    </label>
  );
}

/** Client-state pager: previous / numbered / next. */
export function StatePager({ page, last, onPage }: { page: number; last: number; onPage: (p: number) => void }) {
  const t = useT();
  if (last <= 1) return null;
  const b = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-fiesta-blue";
  const live = `${b} border-black/20 bg-white text-fiesta-navy hover:border-fiesta-navy`;
  const off = `${b} border-black/10 bg-black/5 text-black/45`;
  return (
    <nav aria-label={t("gova.pager")} className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? <button type="button" className={live} onClick={() => onPage(page - 1)}>‹ {t("proyekto.page.prev")}</button> : <span className={off} aria-disabled="true">‹ {t("proyekto.page.prev")}</span>}
      <ul className="flex flex-wrap items-center gap-1">
        {pageWindow(page, last).map((n, i) => n === "gap" ? <li key={`g${i}`} aria-hidden className="px-1 text-black/55">…</li>
          : <li key={n}>{n === page ? <span aria-current="page" className={`${b} border-fiesta-navy bg-fiesta-navy text-white tabular-nums`}>{n}</span> : <button type="button" className={`${live} tabular-nums`} onClick={() => onPage(n)}>{n}</button>}</li>)}
      </ul>
      {page < last ? <button type="button" className={live} onClick={() => onPage(page + 1)}>{t("proyekto.page.next")} ›</button> : <span className={off} aria-disabled="true">{t("proyekto.page.next")} ›</span>}
    </nav>
  );
}

export type BarRow = { key: string; label: ReactNode; value: number | null; text: string; color: string };
/** Horizontal bars as a list: every row prints its value, so the list is its own text equivalent. null = no data: dash, no bar. */
export function BarList({ rows, aria }: { rows: BarRow[]; aria: string }) {
  const max = Math.max(0, ...rows.map((r) => r.value ?? 0));
  return (
    <ul aria-label={aria} className="space-y-2">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate font-semibold text-fiesta-navy">{r.label}</span>
          <span className="h-3 rounded-full bg-fiesta-navy/5" aria-hidden>{r.value != null && max > 0 && <span className="block h-3 rounded-full" style={{ width: `${Math.max(2, Math.round((r.value / max) * 100))}%`, background: r.color }} />}</span>
          <span className="min-w-12 text-right tabular-nums text-black/75">{r.value == null ? "-" : r.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function PdfButton({ url }: { url: string | null }) {
  return url
    ? <a href={url} rel="noopener" target="_blank" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-fiesta-navy px-6 font-semibold text-white hover:bg-fiesta-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue"><KitIcon name="doc" className="h-5 w-5" /><T k="gova.pdf.open" /></a>
    : <span className="inline-flex min-h-12 items-center rounded-full bg-black/5 px-6 text-sm text-black/65"><T k="gova.pdf.none" /></span>;
}
export const SummaryNote = () => <p className="text-sm text-black/65"><T k="gova.summary.coming" /></p>;
export const PdfLink = ({ url }: { url: string | null }) => url ? <a href={url} rel="noopener" target="_blank" className="inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline hover:text-fiesta-navy"><T k="gova.pdf.official" /><span className="sr-only"> (PDF)</span></a> : null;
export const OpenLink = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-fiesta-blue">{children}</Link>;
