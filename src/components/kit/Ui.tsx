import Link from "next/link";
import KitIcon from "./KitIcon";
import { Halcon, Tamaraw } from "./Motifs";
import { CopyButton } from "./Interactive";
import { T } from "@/lib/i18n/i18n";
import { Badge } from "./Parts";

const CYCLE = ["bg-fiesta-blue", "bg-fiesta-orange", "bg-fiesta-green", "bg-fiesta-red"];

/** FAQ. Native <details>: keyboard and screen-reader support for free. */
export function Accordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
      {items.map((it) => (
        <details key={it.q} className="group px-5">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
            {it.q}<KitIcon name="arrow" className="h-5 w-5 shrink-0 rotate-90 text-fiesta-blue transition group-open:-rotate-90" />
          </summary>
          <div className="pb-5 text-sm leading-relaxed text-black/75">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

/** "How to apply" flow. */
export function Stepper({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
          {i < steps.length - 1 && <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-fiesta-navy/15" aria-hidden />}
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold text-white ${CYCLE[i % 4]}`}>{i + 1}</span>
          <div><p className="font-semibold">{s.title}</p><p className="mt-0.5 text-sm text-black/70">{s.body}</p></div>
        </li>
      ))}
    </ol>
  );
}

/** Requirements checklist. Native checkboxes; checked items are struck through. */
export function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <fieldset className="rounded-2xl border border-black/10 bg-white p-5">
      <legend className="px-2 text-sm font-semibold tracking-widest text-fiesta-blue">{title}</legend>
      <ul className="space-y-1">
        {items.map((t) => (
          <li key={t}><label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="checkbox" className="peer h-5 w-5 shrink-0 accent-fiesta-blue" /><span className="text-sm peer-checked:text-black/60 peer-checked:line-through">{t}</span></label></li>
        ))}
      </ul>
    </fieldset>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-black/60">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            {it.href && i < items.length - 1 ? <Link href={it.href} className="underline-offset-2 hover:underline">{it.label}</Link> : <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-semibold text-fiesta-navy" : ""}>{it.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Wrap a focusable element (button, link). Shows on hover and keyboard focus. */
export function Tooltip({ tip, children }: { tip: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-56 -translate-x-1/2 rounded-lg bg-fiesta-navy px-3 py-2 text-xs text-white shadow-lg group-focus-within:block group-hover:block">{tip}</span>
    </span>
  );
}

export const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => <div className={`animate-pulse rounded bg-black/10 motion-reduce:animate-none ${className}`} aria-hidden />;

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/20 p-10 text-center">
      <Halcon outline className="mx-auto h-12 w-auto text-fiesta-navy/40" color="currentColor" />
      <p className="mt-4 font-serif text-xl font-bold">{title}</p>
      <div className="mt-1 text-sm text-black/65">{children}</div>
    </div>
  );
}

/** Weather and disaster notices. Flat fill, no side bar. */
export function AlertBanner({ level, title, children }: { level: "advisory" | "warning"; title: string; children: React.ReactNode }) {
  const c = level === "warning" ? "bg-fiesta-red text-white" : "bg-fiesta-yellow text-fiesta-navy";
  return (
    <div role={level === "warning" ? "alert" : "status"} className={`flex items-start gap-3 rounded-2xl px-5 py-4 ${c}`}>
      <KitIcon name="alert" className="mt-0.5 h-6 w-6 shrink-0" />
      <div><p className="font-semibold">{title}</p><p className="text-sm opacity-90">{children}</p></div>
    </div>
  );
}

// ---- Form field ----
export const INPUT = "min-h-11 w-full rounded-lg border border-black/25 bg-white px-3 text-sm outline-none focus:border-fiesta-blue focus:ring-2 focus:ring-fiesta-blue/25 aria-[invalid=true]:border-fiesta-red";
export function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-black/60">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-semibold text-fiesta-red">{error}</p>}
    </div>
  );
}

// ---- Hotline card ----
export type HotlineCardData = { name: string; number: string; source: string; verifiedAt: string; confirmed: boolean };
const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");
/** Tap to call, copy, and a clear "when was this checked" stamp. */
export function HotlineCard({ h, tone = "emergency" }: { h: HotlineCardData; tone?: "emergency" | "medical" | "government" | "utility" }) {
  // Category shows as a small colored badge, not an edge stripe or outline.
  const chip = { emergency: "bg-fiesta-red/10 text-[#a8281b]", medical: "bg-fiesta-green/15 text-[#1f6b37]", government: "bg-fiesta-blue/10 text-fiesta-blue", utility: "bg-fiesta-yellow/30 text-[#7a5600]" }[tone];
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${chip}`}><T k={`cat.${tone}`} /></span>
      <p className="font-semibold leading-snug">{h.name}</p>
      <a href={tel(h.number)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-fiesta-navy px-3 font-serif text-lg font-bold whitespace-nowrap text-white hover:bg-fiesta-blue sm:text-xl"><KitIcon name="phone" className="h-5 w-5 shrink-0" />{h.number}</a>
      <div className="flex flex-wrap items-center gap-2"><CopyButton text={h.number} /><a href={h.source} rel="noopener" className="inline-flex min-h-11 items-center px-2 text-sm underline"><T k="common.source" /></a></div>
      <p className="mt-auto flex flex-wrap items-center gap-2 text-xs text-black/60"><Badge kind={h.confirmed ? "verified" : "wip"}><T k={h.confirmed ? "common.verified" : "common.unconfirmed"} /></Badge><span><T k="common.checked" /> {h.verifiedAt}</span></p>
    </div>
  );
}

/** 404 / 500 page body. Pass the real links; this only styles. */
export function ErrorState({ code, title, children, links }: { code: string; title: string; children?: React.ReactNode; links: { label: string; href: string }[] }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="flex items-end justify-center gap-4 text-fiesta-navy" aria-hidden>
        <Halcon outline className="h-14 w-auto" color="currentColor" />
        <span className="font-serif text-7xl font-bold leading-none text-fiesta-blue">{code}</span>
        <Tamaraw outline className="h-16 w-auto" color="currentColor" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-bold">{title}</h1>
      <div className="mt-2 text-black/70">{children}</div>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {links.map((l) => <li key={l.href}><Link href={l.href} className="inline-flex min-h-11 items-center rounded-full bg-fiesta-navy px-6 text-sm font-semibold text-white hover:bg-fiesta-blue">{l.label}</Link></li>)}
      </ul>
    </div>
  );
}
