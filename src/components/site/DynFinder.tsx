"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n/i18n";
import { findWinners, seatId, titleCase, type WinnerRow } from "@/lib/dyn-pure";
import Dropdown from "./Dropdown";

const SEATS = ["MAYOR", "VICE MAYOR", "COUNCILOR"];

/** Search by surname or name plus dropdown filters (town, year, seat). The town dropdown opens that town's page; year and seat narrow the results below. */
export default function DynFinder({ current, towns, years, rows }: { current: string | null; towns: { slug: string; name: string }[]; years: number[]; rows: WinnerRow[] }) {
  const t = useT();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [seat, setSeat] = useState("");
  const nameOf = useMemo(() => Object.fromEntries(towns.map((x) => [x.slug, x.name])), [towns]);
  const active = q.trim() !== "" || year !== "" || seat !== "";
  const results = useMemo(() => (active ? findWinners(rows, q, year ? Number(year) : undefined, seat || undefined) : []), [rows, q, year, seat, active]);
  const label = (txt: string, id: string) => <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-widest text-black/60">{txt}</label>;
  return (
    <div>
      <label htmlFor="dyn-q" className="sr-only">{t("dyn.find.ph")}</label>
      <input id="dyn-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("dyn.find.ph")} autoComplete="off"
        className="min-h-12 w-full max-w-2xl rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-base outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>{label(t("dyn.find.town"), "dyn-town")}
          <Dropdown id="dyn-town" value={current ?? ""} onChange={(v) => router.push(v ? `/dynasties/${v}` : "/dynasties")} options={[{ v: "", t: t("dyn.province") }, ...towns.map((x) => ({ v: x.slug, t: x.name }))]} /></div>
        <div>{label(t("dyn.find.year"), "dyn-year")}
          <Dropdown id="dyn-year" value={year} onChange={setYear} options={[{ v: "", t: t("dyn.find.any") }, ...[...years].reverse().map((y) => ({ v: String(y), t: String(y) }))]} /></div>
        <div>{label(t("dyn.find.seat"), "dyn-seat")}
          <Dropdown id="dyn-seat" value={seat} onChange={setSeat} options={[{ v: "", t: t("dyn.find.any") }, ...SEATS.map((s) => ({ v: s, t: t(`dyn.seat.${s}`) }))]} /></div>
      </div>
      {active && (
        <div className="mt-5" aria-live="polite">
          <p className="flex flex-wrap items-center gap-3 text-sm text-black/70">{results.length} {t("dyn.find.found")}
            <button type="button" onClick={() => { setQ(""); setYear(""); setSeat(""); }} className="min-h-9 font-semibold text-fiesta-blue underline">{t("dyn.find.clear")}</button></p>
          {results.length ? (
            <ul className="mt-3 max-h-96 divide-y divide-black/5 overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-sm">
              {results.map((r, i) => (
                <li key={i}>
                  <Link href={`/dynasties/${r[0]}${r[2] === "COUNCILOR" ? "" : `#${seatId(r[2], r[1])}`}`} className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-fiesta-cream">
                    <span className="w-14 shrink-0 rounded-lg bg-fiesta-navy py-1 text-center font-serif text-sm font-bold tabular-nums text-white">{r[1]}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-fiesta-navy">{titleCase(r[3])}</span><span className="block truncate text-xs text-black/60">{t(`dyn.seat.${r[2]}`)} · {nameOf[r[0]] ?? r[0]}</span></span>
                    {r[5] && r[5] !== "IND" && <span className="shrink-0 rounded-full bg-fiesta-blue/10 px-2 py-0.5 text-[11px] font-semibold text-fiesta-blue">{r[5]}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 rounded-2xl bg-black/5 p-5 text-sm text-black/70">{t("dyn.find.none")}</p>}
        </div>
      )}
    </div>
  );
}
