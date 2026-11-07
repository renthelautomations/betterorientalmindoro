"use client";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import TownEmblem from "@/components/kit/TownEmblem";
import { IncomeClass } from "@/components/stats/StatCard";
import { T, useT } from "@/lib/i18n/i18n";
import { fmtInt, fmtPeso } from "@/lib/stats";

export type TownRow = { slug: string; name: string; pop: number | null; area: number; brgy: number; rev: number | null; cls?: string; clsYear?: number };
type Key = "pop" | "area" | "rev" | "brgy";
const SORTS: [Key, string][] = [["pop", "metric.pop"], ["area", "finance.area"], ["rev", "metric.revenue"], ["brgy", "finance.brgy"]];
const COLOR: Record<Key, string> = { pop: "bg-fiesta-blue", area: "bg-fiesta-green", rev: "bg-fiesta-orange", brgy: "bg-fiesta-navy" };

/** Town list as cards: population as the headline with a bar against the biggest town, area, barangays and revenue as small bars. Sortable by any of the four. A dash means no figure, never zero. The table stays as a second view. */
export default function TownCards({ rows, table }: { rows: TownRow[]; table: ReactNode }) {
  const t = useT();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [by, setBy] = useState<Key>("pop");
  const max = useMemo(() => ({ pop: Math.max(...rows.map((r) => r.pop ?? 0), 1), area: Math.max(...rows.map((r) => r.area), 1), rev: Math.max(...rows.map((r) => r.rev ?? 0), 1), brgy: Math.max(...rows.map((r) => r.brgy), 1) }), [rows]);
  const sorted = useMemo(() => [...rows].sort((a, b) => (b[by] ?? -1) - (a[by] ?? -1)), [rows, by]);
  const popRank = useMemo(() => new Map([...rows].filter((r) => r.pop != null).sort((a, b) => b.pop! - a.pop!).map((r, i) => [r.slug, i + 1])), [rows]);
  const pill = (on: boolean) => `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;
  const fmt: Record<Key, (n: number | null) => string> = { pop: fmtInt, area: (n) => (n == null ? "–" : `${fmtInt(n)} km²`), rev: fmtPeso, brgy: fmtInt };
  const lab: Record<Key, string> = { pop: "metric.pop", area: "finance.area", rev: "metric.revenue", brgy: "finance.brgy" };
  const mini = (r: TownRow, k: Exclude<Key, "pop">) => {
    const v = r[k];
    return (
      <div className="min-w-0">
        <dt className="truncate text-[11px] font-semibold tracking-wide text-black/65 uppercase"><T k={lab[k]} /></dt>
        <dd className="mt-0.5 text-sm font-bold tabular-nums text-fiesta-navy">{fmt[k](v)}</dd>
        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/5" aria-hidden>{v != null && <span className={`block h-full rounded-full ${COLOR[k]}`} style={{ width: `${Math.max((v / max[k]) * 100, 3)}%` }} />}</span>
      </div>
    );
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={t("dyn.view.label")} className="inline-flex rounded-full bg-fiesta-navy/5 p-0.5">
          {([["cards", "est.view.cards"], ["table", "dyn.view.table"]] as const).map(([v, k]) => <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={pill(view === v)}>{t(k)}</button>)}
        </div>
        {view === "cards" && (
          <div role="group" aria-label={t("est.sort")} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-black/65">{t("est.sort")}</span>
            {SORTS.map(([k, l]) => <button key={k} type="button" aria-pressed={by === k} onClick={() => setBy(k)} className={`min-h-9 rounded-full border-2 px-3 font-semibold ${by === k ? "border-fiesta-navy bg-fiesta-navy text-white" : "border-fiesta-navy/20 text-fiesta-navy hover:border-fiesta-navy"}`}>{t(l)}</button>)}
          </div>
        )}
      </div>

      <ul hidden={view !== "cards"} className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((r) => (
          <li key={r.slug} className="h-full">
            <Link href={`/bayan/${r.slug}`} className="group flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
              <span className="flex items-center gap-3">
                <TownEmblem slug={r.slug} name="" className="h-12 w-12 shrink-0 rounded-xl" capital={r.slug === "calapan-city"} />
                <span className="min-w-0 flex-1"><span className="block font-serif text-xl font-bold leading-tight text-fiesta-navy">{r.name}</span><span className="block text-xs text-black/65"><IncomeClass value={r.cls} />{r.clsYear ? ` (${r.clsYear})` : ""}</span></span>
                {popRank.has(r.slug) && <span className="shrink-0 rounded-full bg-fiesta-mint px-2.5 py-1 text-xs font-bold text-fiesta-navy tabular-nums" title={t("est.rank.of")}>#{popRank.get(r.slug)}</span>}
              </span>
              <span className="block">
                <span className="text-[11px] font-semibold tracking-wide text-black/65 uppercase"><T k="metric.pop" /></span>
                <span className="mt-0.5 block font-serif text-3xl font-bold tabular-nums text-fiesta-navy">{fmtInt(r.pop)}</span>
                <span className="mt-1.5 block h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden>{r.pop != null && <span className={`block h-full rounded-full ${COLOR.pop}`} style={{ width: `${Math.max((r.pop / max.pop) * 100, 2)}%` }} />}</span>
              </span>
              <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-black/10 pt-3">{mini(r, "area")}{mini(r, "brgy")}{mini(r, "rev")}</dl>
            </Link>
          </li>
        ))}
      </ul>
      <div hidden={view !== "table"} className="mt-4">{table}</div>
    </div>
  );
}
