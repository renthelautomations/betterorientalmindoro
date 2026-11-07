import Link from "next/link";
import { Badge } from "@/components/kit/Parts";
import { FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { T } from "@/lib/i18n/i18n";

export const peso = (n?: number) => (n == null ? "-" : "₱" + Math.round(n).toLocaleString("en-PH"));
export const pesoShort = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)} B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)} M` : peso(n));

export const iconFor = (c?: string): KitIconName => (/Flood/.test(c ?? "") ? "flood" : /Water/.test(c ?? "") ? "drop" : /Road|Bridge/.test(c ?? "") ? "road" : "doc");

/** One colour + pattern per project status (same language as service categories). Text on it is white, so only AA-safe colours here. */
export function statusLook(status?: string): { color: string; pattern: PatternKey } {
  switch (status) {
    case "Completed": return { color: FIESTA_DEEP.green, pattern: "dotblocks" };
    case "On-Going": return { color: FIESTA.blue, pattern: "wave" };
    case "For Procurement": return { color: FIESTA_DEEP.orange, pattern: "burst" };
    case "Terminated": return { color: FIESTA.red, pattern: "horns" };
    default: return { color: FIESTA.navy, pattern: "mosaic" };
  }
}

/** Status is published data and stays as is; only the missing-status placeholder is interface text. */
export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge kind="soon"><T k="proyekto.nostatus" /></Badge>;
  return <Badge kind={status === "Completed" ? "verified" : status === "On-Going" ? "new" : "wip"}><T k={`proyekto.st.${status}`} /></Badge>;
}

// Translatable twins of kit parts whose props are plain strings (kit SectionHeader, Breadcrumbs, EmptyState, Accordion, StatCard, Timeline).
// Labels are dictionary keys (T passes unknown text through, so data like a project id is fine).
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-black/60">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            {it.href && i < items.length - 1 ? <Link href={it.href} className="underline-offset-2 hover:underline"><T k={it.label} /></Link> : <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-semibold text-fiesta-navy" : ""}><T k={it.label} /></span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PHead({ crumbs, eyebrow, title, children }: { crumbs: { label: string; href?: string }[]; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header>
      <Crumbs items={crumbs} />
      <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-[#b5532f]"><T k={eyebrow} /></p>
      <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl"><T k={title} /></h1>
      <div className="mt-3 h-1 w-16 rounded-full bg-fiesta-orange" />
      {children && <div className="mt-4 max-w-2xl space-y-2 text-black/75">{children}</div>}
    </header>
  );
}

export function Sec({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header>
      <p className="text-xs font-semibold tracking-[0.2em] text-[#b5532f]"><T k={eyebrow} /></p>
      <h2 className="mt-2 font-serif text-3xl font-bold"><T k={title} /></h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-[#b5532f]" />
    </header>
  );
}

export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/20 p-10 text-center">
      <p className="font-serif text-xl font-bold"><T k={title} /></p>
      <div className="mt-1 text-sm text-black/65">{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint, icon, color }: { label: string; value: React.ReactNode; hint: React.ReactNode; icon: KitIconName; color: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold tracking-widest text-black/60"><T k={label} /></p><KitIcon name={icon} variant="duo" color={color} /></div>
      <p className="mt-3 font-serif text-4xl font-bold" style={{ color }}>{value}</p>
      <p className="mt-1 text-sm text-black/60">{hint}</p>
    </div>
  );
}

export function Steps({ items }: { items: { when: React.ReactNode; title: string; sub?: React.ReactNode }[] }) {
  return (
    <ol className="relative ml-3 border-l-2 border-[#1b2a4a]/15">
      {items.map((it) => (
        <li key={it.title} className="relative pb-6 pl-7 last:pb-0">
          <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-fiesta-blue ring-4 ring-[#fbf7f0]" aria-hidden />
          <p className="font-serif text-xl font-bold text-[#1b2a4a]">{it.when}</p>
          <p className="font-semibold"><T k={it.title} /></p>
          {it.sub && <p className="text-sm text-black/65">{it.sub}</p>}
        </li>
      ))}
    </ol>
  );
}

/** By-year bars, oldest first. Counts are printed under each bar; each column links to that year's filter. */
export function YearBars({ rows }: { rows: { y: number; n: number; on: boolean; href: string }[] }) {
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <figure className="flex h-80 flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:h-96">
      <span id="yb-label" className="sr-only"><T k="proyekto.yearbars" /></span>
      <ul className="flex min-h-0 flex-1 items-end gap-1.5" aria-labelledby="yb-label">
        {rows.map(({ y, n, on, href }) => (
          <li key={y} className="flex h-full min-w-0 flex-1">
            <Link href={href} aria-current={on ? "true" : undefined} className="group flex h-full w-full flex-col justify-end text-center">
              <span className="text-xs font-semibold tabular-nums">{n}<span className="sr-only"> <T k="proyekto.yearsr" /></span></span>
              <span className={`mt-1 block rounded-t-sm ${on ? "bg-fiesta-orange" : "bg-fiesta-blue group-hover:bg-fiesta-navy"}`} style={{ height: `${Math.max((n / max) * 100, 2) * 0.85}%` }} />
              <span className="mt-1 text-[10px] tabular-nums text-black/70">{y}</span>
            </Link>
          </li>
        ))}
      </ul>
      <figcaption className="mt-2 text-xs text-black/60"><T k="proyekto.yearhint" /></figcaption>
    </figure>
  );
}
