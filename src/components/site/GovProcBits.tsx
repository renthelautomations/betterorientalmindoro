"use client";
import Link from "next/link";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { T, useLang, useT } from "@/lib/i18n/i18n";
import { STAGES, type Card, type Conf } from "@/lib/gov-proc";

export const WORK_ICON: Record<string, KitIconName> = { road: "road", bridge: "road", drainage: "flood", water: "drop", building: "school", other: "doc" };
/** Header band colours: all pass AA under white text. */
export const WORK_COLOR: Record<string, string> = { road: FIESTA.navy, bridge: FIESTA.navy, drainage: FIESTA.blue, water: FIESTA_DEEP.sky, building: FIESTA_DEEP.green, other: "#5b4636" };
export const workIcon = (w: string) => WORK_ICON[w] ?? "doc";

export const card = "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5";
export const pill = (on: boolean) => `inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue ${on ? "bg-fiesta-navy text-white" : "bg-white text-fiesta-navy shadow-sm ring-1 ring-black/10 hover:ring-fiesta-navy/40"}`;
export const linkPill = "inline-flex min-h-11 items-center gap-2 rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue";

export const DocType = ({ type }: { type: string }) => <T k={`govb.type.${type}`} />;

const CONF: Record<Conf, string> = { high: "bg-emerald-100 text-emerald-900", medium: "bg-amber-100 text-amber-900", low: "bg-black/5 text-black/70" };
export function ConfChip({ conf }: { conf: string | null | undefined }) {
  const c: Conf = conf === "high" || conf === "medium" ? conf : "low";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${CONF[c]}`}><T k={`govb.conf.${c}`} /></span>;
}

export function WorkBadge({ work, className = "h-11 w-11 shrink-0" }: { work: string; className?: string }) {
  return <KitIcon name={workIcon(work)} variant="badge" color={WORK_COLOR[work] ?? FIESTA.navy} className={className} />;
}

/** Five steps in the real order; filled = a document for that step is listed on the official page. */
export function Stepper({ stages }: { stages: Card["stages"] }) {
  return (
    <ol className="flex items-start gap-1">
      {STAGES.map((s, i) => {
        const on = !!stages[s];
        return (
          <li key={s} className="flex min-w-0 flex-1 flex-col items-center text-center">
            <span className="flex w-full items-center" aria-hidden>
              <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : on ? "bg-fiesta-navy" : "bg-black/15"}`} />
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${on ? "bg-fiesta-navy" : "bg-white ring-2 ring-black/20"}`}>{on && <KitIcon name="check" className="h-3.5 w-3.5" />}</span>
              <span className={`h-0.5 flex-1 ${i === STAGES.length - 1 ? "opacity-0" : "bg-black/15"}`} />
            </span>
            <span className={`mt-1 text-[11px] leading-tight ${on ? "font-semibold text-fiesta-navy" : "text-black/65"}`}>
              <T k={`govb.stg.${s}`} /><span className="sr-only">: <T k={on ? "govb.listed" : "govb.notlisted"} /></span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Stat({ icon, label, value, hint }: { icon: KitIconName; label: string; value: string; hint?: string }) {
  return (
    <div className={`${card} flex items-start gap-3`}>
      <KitIcon name={icon} variant="badge" color={FIESTA.navy} className="h-11 w-11 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-black/65"><T k={label} /></p>
        <p className="font-serif text-2xl font-bold tabular-nums text-fiesta-navy">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-black/65"><T k={hint} /></p>}
      </div>
    </div>
  );
}

/** Text-first bar list: the numbers are the accessible equivalent of the bars. */
export function Bars({ title, rows }: { title: string; rows: { key: string; label: string; n: number; href?: string }[] }) {
  const t = useT();
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section className={card}>
      <h3 className="font-serif text-lg font-bold text-fiesta-navy"><T k={title} /></h3>
      {rows.length === 0 ? <p className="mt-3 text-sm text-black/65">–</p> : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <li key={r.key} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2 text-sm sm:grid-cols-[9rem_1fr_2.5rem]">
              <span className="truncate text-black/80">{r.href ? <Link href={r.href} className="inline-flex min-h-8 items-center underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-fiesta-blue">{t(r.label)}</Link> : t(r.label)}</span>
              <span className="h-3 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-orange" style={{ width: `${r.n ? Math.max((r.n / max) * 100, 2) : 0}%` }} /></span>
              <span className="text-right font-semibold tabular-nums text-fiesta-navy">{r.n.toLocaleString("en-PH")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Scan summary in the language of the page toggle. Falls back to the other language, then a note. */
export function DocSummary({ en, fil }: { en: string | null; fil: string | null }) {
  const lang = useLang();
  const s = lang === "en" ? en ?? fil : fil ?? en;
  return s ? <p className="text-black/80">{s}</p> : <p className="text-sm text-black/70"><T k="govb.unread" /></p>;
}

export const OfficialPdf = ({ url, label = "govb.openpdf" }: { url: string | null; label?: string }) =>
  url ? <a href={url} target="_blank" rel="noopener noreferrer" className={linkPill}><KitIcon name="doc" className="h-5 w-5" /><T k={label} /><span className="sr-only"> (<T k="govb.newtab" />)</span></a> : null;
