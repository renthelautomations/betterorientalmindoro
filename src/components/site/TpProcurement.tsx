import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";
import KitIcon from "@/components/kit/KitIcon";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import TpTop from "./TpTop";
import { AwardCard } from "./TpAwards";
import { fmtPeso } from "@/lib/stats";
import { getAggregates, getAwards } from "@/lib/philgeps";

const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5";
const short = (v: number) => (v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${Math.round(v / 1e6)}M` : `${Math.round(v / 1e3)}K`);

/** Procurement in Oriental Mindoro from the open PhilGEPS data: totals, by year, by method, top offices, businesses and categories, and the biggest recent awards. */
export default function TpProcurement() {
  const a = getAggregates();
  const years = a.byYear;
  const first = years[0].year, last = years.at(-1)!.year;
  const lastY = years.at(-1)!;
  const maxAmt = Math.max(...years.map((y) => y.amount), 1);
  const pb = a.procurementModes.find((m) => /public bidding/i.test(m.name));
  const recent = getAwards().filter((x) => x.amount != null).sort((p, q) => q.amount! - p.amount!).slice(0, 10);
  const detail = a.meta.counts.awardsKeptInAwardsJson;
  const stats: { l: React.ReactNode; v: string; h: React.ReactNode }[] = [
    { l: <T k="pp.s.awards" />, v: a.total.awards.toLocaleString("en-PH"), h: <TF k="pp.s.awards.h" v={[first, last]} /> },
    { l: <T k="pp.s.amount" />, v: fmtPeso(a.total.amount), h: <T k="pp.s.amount.h" /> },
    { l: <TF k="pp.s.latest" v={[last]} />, v: lastY.awards.toLocaleString("en-PH"), h: <T k="pp.s.latest.h" /> },
    { l: <T k="pp.s.mode" />, v: pb ? `${(pb.share * 100).toFixed(1)}%` : "-", h: <T k="pp.s.mode.h" /> },
  ];
  return (
    <div className="space-y-8">
      <section aria-labelledby="pp-note" className={`${card} bg-fiesta-cream`}>
        <h2 id="pp-note" className="font-serif text-xl font-bold text-fiesta-navy"><T k="pp.note.h" /></h2>
        <p className="mt-2 text-sm leading-relaxed text-black/80"><T k="pp.note.p" /></p>
      </section>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => <div key={i} className={card}><dt className="text-xs font-semibold tracking-wide text-black/65 uppercase">{s.l}</dt><dd className="mt-1 font-serif text-3xl font-bold tabular-nums text-fiesta-navy">{s.v}</dd><p className="mt-1 text-xs text-black/65">{s.h}</p></div>)}
      </dl>

      <section aria-labelledby="pp-year" className={card}>
        <h2 id="pp-year" className="font-serif text-xl font-bold text-fiesta-navy"><T k="pp.year.h" /></h2>
        <p className="mt-1 max-w-3xl text-sm text-black/70"><T k="pp.year.p" /></p>
        <div className="mt-4 overflow-x-auto pb-2">
          <ul className="flex h-60 min-w-[40rem] items-end gap-1.5">
            {years.map((y) => (
              <li key={y.year} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 text-center" title={`${y.year}: ${fmtPeso(y.amount)}, ${y.awards.toLocaleString("en-PH")} awards`}>
                <span className="text-[10px] font-semibold tabular-nums text-fiesta-navy">{short(y.amount)}</span>
                <span aria-hidden className="w-full rounded-t-md bg-fiesta-blue" style={{ height: `${Math.max((y.amount / maxAmt) * 70, 2)}%` }} />
                <span className="border-t border-black/15 pt-1 text-[10px] tabular-nums text-black/75">{String(y.year).slice(2)}</span>
                <span className="text-[10px] tabular-nums text-black/65">{y.awards.toLocaleString("en-PH")}</span>
              </li>
            ))}
          </ul>
        </div>
        {a.undated.awards > 0 && <p className="mt-2 text-xs text-black/70"><TF k="pp.undated" v={[a.undated.awards.toLocaleString("en-PH"), fmtPeso(a.undated.amount)]} /></p>}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <TpTop title="pp.top.ent" byAmount={a.topEntitiesByAmount} byCount={a.topEntitiesByCount} />
        <TpTop title="pp.top.awd" byAmount={a.topAwardeesByAmount} byCount={a.topAwardeesByCount} note="pp.top.awd.n" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <TpTop title="pp.top.cat" byAmount={a.topCategories} />
        <section aria-labelledby="pp-mode" className={card}>
          <h3 id="pp-mode" className="font-serif text-lg font-bold text-fiesta-navy"><T k="pp.mode.h" /></h3>
          <p className="mt-1 text-sm text-black/70"><T k="pp.mode.p" /></p>
          <ul className="mt-4 space-y-3">
            {a.procurementModes.slice(0, 7).map((m) => (
              <li key={m.name}>
                <p className="flex items-baseline justify-between gap-3 text-sm"><span className="font-medium text-fiesta-navy">{m.name}</span><span className="shrink-0 font-semibold tabular-nums">{(m.share * 100).toFixed(1)}%</span></p>
                <span className="mt-1 block h-2.5 rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-orange" style={{ width: `${m.share * 100}%` }} /></span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="pp-recent" className={card}>
        <h2 id="pp-recent" className="font-serif text-xl font-bold text-fiesta-navy"><T k="pp.recent.h" /></h2>
        <p className="mt-1 text-sm text-black/70"><T k="pp.recent.p" /></p>
        <ul className="mt-4 grid auto-rows-fr gap-3 md:grid-cols-2">{recent.map((r) => <li key={r.id}><AwardCard a={r} /></li>)}</ul>
        <p className="mt-5"><Link href="/transparency/kontrata" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue"><TF k="pp.browse" v={[detail.toLocaleString("en-PH")]} /><KitIcon name="arrow" className="h-4 w-4" /></Link></p>
      </section>

      <SourceNote><TF k="pp.src" v={[a.meta.dataset, a.meta.builtAt.slice(0, 10)]} /></SourceNote>
      <div className="flex flex-wrap gap-2">
        <SourceLink href="https://philgeps.bettergov.ph" icon="compass"><T k="pp.l.dash" /></SourceLink>
        <SourceLink href={`https://huggingface.co/datasets/${a.meta.dataset}`} icon="database"><T k="pp.l.data" /></SourceLink>
      </div>
    </div>
  );
}
