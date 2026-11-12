"use client";
import { useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import { pageWindow } from "@/lib/paging";

const base = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold";
const live = `${base} border-black/20 bg-white text-fiesta-navy hover:border-fiesta-navy`;
const off = `${base} border-black/10 bg-black/5 text-black/65`;

/** The same First / Previous / numbers / Next / Last / "go to page" pager as the projects page, for lists that page in the browser. */
export default function ClientPager({ page, last, onPage }: { page: number; last: number; onPage: (p: number) => void }) {
  const t = useT();
  const [go, setGo] = useState("");
  if (last <= 1) return null;
  const btn = (p: number, label: React.ReactNode, ok: boolean) => ok
    ? <button type="button" onClick={() => onPage(p)} className={live}>{label}</button>
    : <span className={off} aria-disabled="true">{label}</span>;
  return (
    <nav aria-label={t("proyekto.page.aria")} className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {btn(1, <>« <span className="ml-1 hidden sm:inline"><T k="proyekto.page.first" /></span></>, page > 1)}
      {btn(page - 1, <>‹ <span className="ml-1 hidden sm:inline"><T k="proyekto.page.prev" /></span></>, page > 1)}
      <ul className="flex flex-wrap items-center gap-1">
        {pageWindow(page, last).map((n, i) => n === "gap"
          ? <li key={`g${i}`} className="px-1 text-black/65" aria-hidden>…</li>
          : <li key={n}>{n === page ? <span aria-current="page" className={`${base} border-fiesta-navy bg-fiesta-navy text-white tabular-nums`}>{n}</span> : <button type="button" onClick={() => onPage(n)} className={`${live} tabular-nums`}>{n}</button>}</li>)}
      </ul>
      {btn(page + 1, <><span className="mr-1 hidden sm:inline"><T k="proyekto.page.next" /></span> ›</>, page < last)}
      {btn(last, <><span className="mr-1 hidden sm:inline"><T k="proyekto.page.last" /></span> »</>, page < last)}
      <form className="ml-2 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); const n = Math.min(Math.max(parseInt(go, 10) || 1, 1), last); onPage(n); setGo(""); }}>
        <label className="sr-only" htmlFor="law-pg">{t("proyekto.page.go")}</label>
        <input id="law-pg" type="number" inputMode="numeric" min={1} max={last} value={go} onChange={(e) => setGo(e.target.value)} placeholder={t("proyekto.page.of")} className="min-h-11 w-24 rounded-lg border border-black/25 bg-white px-3 text-sm" />
        <button className="min-h-11 rounded-lg bg-fiesta-navy px-4 text-sm font-semibold text-white hover:bg-fiesta-blue">{t("proyekto.page.gobtn")}</button>
        <span className="text-sm text-black/60">/ {last.toLocaleString("en-PH")}</span>
      </form>
    </nav>
  );
}
