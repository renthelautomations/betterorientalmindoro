"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { FIESTA, PatternFill } from "@/components/kit/Patterns";
import Dropdown from "@/components/site/Dropdown";
import { T, useT } from "@/lib/i18n/i18n";
import { fmtInt } from "@/lib/stats";
import type { BayanSummary } from "@/lib/bayan";

/** Large map beside one panel: a patterned strip, a town dropdown, a short list of the biggest towns, and the chosen town's summary. The plain town list under the page remains the keyboard/no-WebGL path. */
export default function BayanHub({ slugs, summaries }: { slugs: Record<string, string>; summaries: Record<string, BayanSummary> }) {
  const t = useT();
  const [sel, setSel] = useState<string | null>(null);
  const s = sel ? summaries[sel] : undefined;
  const values = Object.fromEntries(Object.entries(slugs).map(([pc, slug]) => [pc, summaries[slug]?.population ?? 0]));
  const all = useMemo(() => Object.values(summaries), [summaries]);
  const options = useMemo(() => [{ v: "", t: t("bayan.pick") }, ...[...all].sort((a, b) => a.name.localeCompare(b.name)).map((x) => ({ v: x.slug, t: x.name }))], [all, t]);
  const big = useMemo(() => all.filter((x) => x.population != null).sort((a, b) => b.population! - a.population!).slice(0, 5), [all]);
  const maxPop = big[0]?.population ?? 1;
  const row = (icon: KitIconName, color: string, k: string, v: string) => (
    <div className="flex items-center gap-3 py-2">
      <KitIcon name={icon} variant="badge" color={color} className="h-9 w-9 shrink-0" />
      <dt className="min-w-0 flex-1 text-sm text-black/70"><T k={k} /></dt>
      <dd className={`font-serif text-xl font-bold tabular-nums ${v === "-" ? "text-black/55" : "text-fiesta-navy"}`}>{v}</dd>
    </div>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="min-w-0"><MapLoader slugs={slugs} values={values} onSelect={setSel} selected={sel} /></div>
      <aside aria-live="polite" className="flex flex-col self-stretch overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="relative h-4 shrink-0 bg-fiesta-mint"><PatternFill variant="mahaltana" colors={[FIESTA.orange, FIESTA.blue, FIESTA.green, FIESTA.pink]} /></div>
        <div className="flex flex-1 flex-col p-5">
          <label htmlFor="bayan-jump" className="text-xs font-semibold tracking-widest text-black/65 uppercase"><T k="uxc.hub.jump" /></label>
          <Dropdown id="bayan-jump" className="mt-2" value={sel ?? ""} options={options} onChange={(v) => setSel(v || null)} />
          {s ? (
            <>
              <h2 className="mt-5 font-serif text-3xl font-bold text-fiesta-navy">{s.name}</h2>
              <dl className="mt-2 divide-y divide-black/5">
                {row("people", FIESTA.blue, "metric.pop", fmtInt(s.population))}
                {row("pin", FIESTA.navy, "bayan.hub.brgy", fmtInt(s.barangays))}
                {row("phone", FIESTA.red, "bayan.hub.hot", s.hotlineCount == null ? "-" : String(s.hotlineCount))}
                {row("road", FIESTA.orange, "metric.projects", s.projectCount ? fmtInt(s.projectCount) : "-")}
              </dl>
              {s.hotlineCount == null && <p className="mt-2 text-xs text-black/65"><T k="bayan.hub.nohot" /></p>}
              <Link href={`/bayan/${s.slug}`} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue"><T k="uxc.hub.cta" /><KitIcon name="arrow" className="h-4 w-4" /></Link>
            </>
          ) : (
            <p className="mt-4 text-sm text-black/70"><T k="uxc.hub.hint" /></p>
          )}
          <h3 className="mt-6 text-xs font-semibold tracking-widest text-black/65 uppercase"><T k="uxc.hub.big" /></h3>
          <ul className="mt-2 space-y-1">
            {big.map((x) => (
              <li key={x.slug}>
                <button type="button" onClick={() => setSel(x.slug)} aria-pressed={sel === x.slug} className={`block min-h-11 w-full rounded-xl px-3 py-1.5 text-left hover:bg-fiesta-mint ${sel === x.slug ? "bg-fiesta-mint" : ""}`}>
                  <span className="flex items-baseline justify-between gap-3 text-sm"><span className="font-semibold text-fiesta-navy">{x.name}</span><span className="tabular-nums text-black/70">{fmtInt(x.population)}</span></span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-blue" style={{ width: `${Math.max((x.population! / maxPop) * 100, 3)}%` }} /></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
