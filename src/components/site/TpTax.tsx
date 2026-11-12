import { T } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import TpMonthly from "./TpMonthly";
import { OM, YEARS, fmtM, fmtPct, getArea, getAreas, getBirMeta, growth, inRegion, monthly, rankInRegion, regionShare, series, shortArea, yearTotal, yoy } from "@/lib/bir";

const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5";

/** BIR collection in Oriental Mindoro: four headline numbers, by year, by month, and against the other MIMAROPA areas. */
export default function TpTax() {
  const om = getArea(OM)!;
  const meta = getBirMeta();
  const first = YEARS[0], last = YEARS.at(-1)!;
  const rank = rankInRegion(om, last);
  const sh = regionShare(om, last);
  const ser = series(om);
  const maxYear = Math.max(...ser.map((s) => s.value ?? 0), 1);
  const g = yoy(om);
  const peers = getAreas().filter((a) => inRegion(a)).sort((a, b) => (yearTotal(b, last) ?? -1) - (yearTotal(a, last) ?? -1));
  const maxPeer = Math.max(...peers.map((a) => yearTotal(a, last) ?? 0), 1);
  const months = Object.fromEntries(YEARS.map((y) => [String(y), monthly(om, y)]));
  const stats: { l: React.ReactNode; v: string; h: string }[] = [
    { l: <TF k="tax.s.latest" v={[last]} />, v: fmtM(yearTotal(om, last)), h: "tax.s.latest.h" },
    { l: <TF k="tax.s.growth" v={[first, last]} />, v: fmtPct(growth(om, first, last)), h: "tax.s.growth.h" },
    { l: <TF k="tax.s.share" v={[last]} />, v: sh == null ? "-" : `${sh.toFixed(1)}%`, h: "tax.s.share.h" },
    { l: <TF k="tax.s.rank" v={[last]} />, v: rank ? `#${rank.rank} / ${rank.of}` : "-", h: "tax.s.rank.h" },
  ];
  return (
    <div className="space-y-8">
      <section aria-labelledby="tax-note" className={`${card} bg-fiesta-cream`}>
        <h2 id="tax-note" className="font-serif text-xl font-bold text-fiesta-navy"><T k="tax.note.h" /></h2>
        <p className="mt-2 text-sm leading-relaxed text-black/80"><T k="tax.note.p" /></p>
      </section>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className={card}><dt className="text-xs font-semibold tracking-wide text-black/65 uppercase">{s.l}</dt><dd className="mt-1 font-serif text-3xl font-bold tabular-nums text-fiesta-navy">{s.v}</dd><p className="mt-1 text-xs text-black/65"><T k={s.h} /></p></div>
        ))}
      </dl>

      <section aria-labelledby="tax-year" className={card}>
        <h2 id="tax-year" className="font-serif text-xl font-bold text-fiesta-navy"><T k="tax.year.h" /></h2>
        <p className="mt-1 text-sm text-black/70"><T k="tax.year.p" /></p>
        <ul className="mt-5 flex h-56 items-end gap-3 sm:gap-6">
          {ser.map((s, i) => {
            const p = i > 0 ? g[i - 1].pct : null;
            return (
              <li key={s.year} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 text-center">
                <span className="text-xs font-bold tabular-nums text-fiesta-navy sm:text-sm">{fmtM(s.value)}</span>
                {s.value != null && <span aria-hidden className="w-full max-w-24 rounded-t-lg bg-fiesta-blue" style={{ height: `${Math.max((s.value / maxYear) * 68, 2)}%` }} />}
                <span className="border-t border-black/15 pt-1 text-sm font-semibold tabular-nums">{s.year}</span>
                <span className="text-xs text-black/70">{p == null ? "" : fmtPct(p)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="tax-month" className={card}>
        <h2 id="tax-month" className="font-serif text-xl font-bold text-fiesta-navy"><T k="tax.month.h" /></h2>
        <p className="mt-1 text-sm text-black/70"><T k="tax.month.p" /></p>
        <div className="mt-4"><TpMonthly years={YEARS} data={months} /></div>
      </section>

      <section aria-labelledby="tax-cmp" className={card}>
        <h2 id="tax-cmp" className="font-serif text-xl font-bold text-fiesta-navy"><T k="tax.cmp.h" /></h2>
        <p className="mt-1 text-sm text-black/70"><TF k="tax.cmp.p" v={[last, first]} /></p>
        <ul className="mt-4 space-y-3">
          {peers.map((a) => {
            const v = yearTotal(a, last), isOm = a.area === OM;
            return (
              <li key={a.area} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[11rem_1fr_auto]">
                <span className={`truncate ${isOm ? "font-bold text-fiesta-navy" : "font-medium"}`}>{shortArea(a.area)}</span>
                <span className="h-3 rounded-full bg-black/5" aria-hidden>{v != null && <span className={`block h-full rounded-full ${isOm ? "bg-fiesta-orange" : "bg-fiesta-blue"}`} style={{ width: `${(v / maxPeer) * 100}%` }} />}</span>
                <span className="whitespace-nowrap text-right tabular-nums"><b>{fmtM(v)}</b> <span className="ml-1 text-xs text-black/70">{fmtPct(growth(a, first, last))}</span></span>
              </li>
            );
          })}
        </ul>
      </section>

      <SourceNote><TF k="tax.src" v={[meta.fetchedAt]} /></SourceNote>
      <div className="flex flex-wrap gap-2">
        <SourceLink href={meta.dashboard} icon="compass"><T k="tax.l.dash" /></SourceLink>
        <SourceLink href={meta.source} icon="database"><T k="tax.l.data" /></SourceLink>
      </div>
    </div>
  );
}
