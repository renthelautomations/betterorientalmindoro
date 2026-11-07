import SmartSearch from "@/components/site/SmartSearch";
import { getSearchItems } from "@/lib/search-index";
import SplitSticky from "@/components/site/SplitSticky";
import type { Metadata } from "next";
import Link from "next/link";
import { SourceNote, IncomeClass } from "@/components/stats/StatCard";
import { Crumbs, FinStat, MetricRadio, R, Sec, Title } from "@/components/site/FinanceBits";
import { T } from "@/lib/i18n/i18n";
import CompareTowns from "@/components/kit/CompareTowns";
import { BarChart } from "@/components/kit/Charts";
import Choropleth from "@/components/site/LinkChoropleth";
import LineChart from "@/components/kit/LineChart";
import { FIESTA } from "@/components/kit/Patterns";
import { getMunicipalities, getBarangays } from "@/lib/municipalities";
import { fmtInt, fmtPeso, getProvinceStats, getStats, popGrowth, fmtPct } from "@/lib/stats";

export const metadata: Metadata = { title: "Estatistika", description: "Populasyon, kita, at pananalapi ng Oriental Mindoro at ng 15 bayan at lungsod nito." };

export default function Estatistika() {
  const prov = getProvinceStats();
  const rows = getMunicipalities().map((m) => {
    const s = getStats(m.slug);
    return { m, s, pop: s?.population.at(-1)?.value ?? null, brgy: getBarangays(m.pcode).length, rev: s?.revenue?.value ?? null };
  });
  const latest = prov.population.at(-1);
  const g = popGrowth(prov.population);
  const metrics = [
    { id: "pop", label: "metric.pop", fmt: fmtInt, val: (r: (typeof rows)[number]) => r.pop },
    { id: "laki", label: "finance.m.size", fmt: (n: number) => `${fmtInt(n)} km²`, val: (r: (typeof rows)[number]) => r.m.areaKm2 },
    { id: "kita", label: "metric.revenue", fmt: fmtPeso, val: (r: (typeof rows)[number]) => r.rev },
    { id: "brgy", label: "finance.m.brgy", fmt: fmtInt, val: (r: (typeof rows)[number]) => r.brgy },
  ];
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Crumbs items={[{ label: "finance.home", href: "/" }, { label: "nav.stats" }]} />
      <div className="mt-4"><Title eyebrow="finance.est.eyebrow" title="finance.est.title" /></div>
      <p className="mt-3 text-black/70"><T k="finance.est.lead" /></p>
      <div className="mt-6"><SmartSearch items={getSearchItems()} /></div>

      <Sec k="finance.est.numbers" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinStat label="town.pop" value={fmtInt(latest?.value)} hint={latest ? `Census ${latest.year}` : <T k="town.nodata" />} icon="people" color={FIESTA.blue} />
        <FinStat label="finance.brgy" value={fmtInt(rows.reduce((a, r) => a + r.brgy, 0))} hint={<T k="finance.brgy.hint" />} icon="pin" color={FIESTA.navy} />
        <FinStat label="finance.area" value={fmtInt(rows.reduce((a, r) => a + r.m.areaKm2, 0))} hint={<T k="finance.area.hint" />} icon="mountain" color={FIESTA.navy} />
        <FinStat label="finance.prov.rev" value={fmtPeso(prov.revenue?.value)} hint={prov.revenue ? <><T k="finance.year" /> {prov.revenue.year}</> : <T k="town.nodata" />} icon="budget" color={FIESTA.red} />
      </Sec>

      <section aria-labelledby="mapa-h" className="mt-12">
        <h2 id="mapa-h" className="text-sm font-semibold tracking-widest text-black/60"><T k="finance.map.h" /></h2>
        <p className="mt-1 text-sm text-black/70"><T k="finance.map.p" /></p>
        <div className="mt-4 flex flex-wrap gap-2">
          {metrics.map((k, i) => <MetricRadio key={k.id} id={k.id} checked={i === 0} label={k.label} className={`peer/${k.id} sr-only`} />)}
          {metrics.map((k) => (
            <label key={k.id} htmlFor={`m-${k.id}`} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy/10 ${PEER_LABEL[k.id]}`}><T k={k.label} /></label>
          ))}
          {metrics.map((k) => {
            const data = rows.map((r) => ({ r, v: k.val(r) }));
            const ranked = data.filter((d): d is { r: (typeof rows)[number]; v: number } => d.v != null).map((d) => ({ label: d.r.m.name, value: d.v, href: `/bayan/${d.r.m.slug}` })).sort((a, b) => b.value - a.value);
            return (
              <div key={k.id} className={`hidden basis-full pt-4 ${PEER_PANEL[k.id]}`}>
                <SplitSticky side={<Choropleth rows={data.map(({ r, v }) => ({ pcode: r.m.pcode, name: r.m.name, value: v, href: `/bayan/${r.m.slug}` }))} format={k.fmt} unit={k.label} />}>
                  <div>
                    <h3 className="mb-3 font-serif text-lg font-bold"><T k="finance.top" /> <span className="lowercase"><T k={k.label} /></span></h3>
                    {ranked.length ? <BarChart rows={ranked} format={k.fmt} /> : <p className="text-sm text-black/60"><T k="finance.nodata.p" /></p>}
                    {ranked.length < rows.length && <p className="mt-3 text-xs text-black/65"><R k={`finance.map.${rows.length - ranked.length === 1 ? "nd1" : "ndN"}`} v={[rows.length - ranked.length]} /></p>}
                  </div>
                </SplitSticky>
              </div>
            );
          })}
        </div>
        <SourceNote><T k="finance.map.src" /></SourceNote>
      </section>

      <div className="mt-12 grid items-start gap-x-8 gap-y-12 lg:grid-cols-2">
      <section aria-labelledby="lago-h" className="min-w-0">
        <h2 id="lago-h" className="text-sm font-semibold tracking-widest text-black/60"><R k="finance.growth.h" v={[prov.population[0]?.year, latest?.year]} /></h2>
        <div className="mt-3"><LineChart series={[{ name: "town.province", points: prov.population.map((p) => ({ year: p.year, value: p.value })) }, ...rows.filter((r) => r.s).map((r) => ({ name: r.m.name, points: r.s!.population.map((p) => ({ year: p.year, value: p.value })) }))]} label="finance.show" /></div>
        {g !== null && <p className="mt-2 text-sm text-black/70"><R k="finance.prov.growth" v={[prov.population[0].year, latest!.year]} /> <b>{g >= 0 ? "+" : ""}{fmtPct(g)}</b></p>}
        <SourceNote><R k="finance.growth.src" v={[<a key="w" className="underline" href={prov.wikidata}>Wikidata</a>, latest?.retrievedAt]} /></SourceNote>
      </section>

      <section aria-labelledby="cmp-h" className="min-w-0">
        <h2 id="cmp-h" className="text-sm font-semibold tracking-widest text-black/60"><T k="finance.cmp.h" /></h2>
        <div className="mt-3">
          <CompareTowns initial={["calapan-city", "baco"]} towns={rows.map((r) => ({ slug: r.m.slug, name: r.m.name }))} metrics={[
            { label: "metric.pop", values: Object.fromEntries(rows.map((r) => [r.m.slug, r.pop])) },
            { label: "metric.area", values: Object.fromEntries(rows.map((r) => [r.m.slug, r.m.areaKm2])) },
            { label: "metric.revenue", unit: "peso", values: Object.fromEntries(rows.map((r) => [r.m.slug, r.rev])) },
          ]} />
        </div>
        <SourceNote><T k="finance.cmp.note" /></SourceNote>
      </section>
      </div>

      <section aria-labelledby="rank-h" className="mt-12">
        <h2 id="rank-h" className="text-sm font-semibold tracking-widest text-black/60"><T k="finance.rank.h" /></h2>
        <p className="mt-1 text-sm text-black/70"><T k="finance.rank.p" /></p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only"><T k="finance.rank.cap" /></caption>
            <thead className="text-xs uppercase tracking-widest text-black/65">
              <tr><th scope="col" className="p-3"><T k="town.town" /></th><th scope="col" className="p-3 text-right"><T k="metric.pop" /></th><th scope="col" className="p-3 text-right"><T k="finance.area" /></th><th scope="col" className="p-3 text-right"><T k="finance.brgy" /></th><th scope="col" className="p-3 text-right"><T k="metric.revenue" /></th><th scope="col" className="p-3"><T k="finance.th.class" /></th></tr>
            </thead>
            <tbody>
              {[...rows].sort((a, b) => (b.pop ?? -1) - (a.pop ?? -1)).map((r) => (
                <tr key={r.m.slug} className="border-t border-black/10">
                  <th scope="row" className="p-3 font-semibold"><Link href={`/bayan/${r.m.slug}`} className="inline-flex min-h-11 items-center text-fiesta-blue underline">{r.m.name}</Link></th>
                  <td className="p-3 text-right tabular-nums">{fmtInt(r.pop)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtInt(r.m.areaKm2)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtInt(r.brgy)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtPeso(r.rev)}</td>
                  <td className="p-3"><IncomeClass value={r.s?.incomeClass?.value} />{r.s?.incomeClass ? ` (${r.s.incomeClass.year})` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote><R k="finance.rank.src" v={[<Link key="b" href="/bayan" className="underline"><T k="nav.towns" /></Link>]} /></SourceNote>
      </section>
    </main>
  );
}

// Tailwind needs the full class strings, so the four peer names are spelled out.
const PEER_LABEL: Record<string, string> = {
  pop: "peer-checked/pop:bg-fiesta-navy peer-checked/pop:text-white peer-focus-visible/pop:ring-4 peer-focus-visible/pop:ring-fiesta-orange",
  laki: "peer-checked/laki:bg-fiesta-navy peer-checked/laki:text-white peer-focus-visible/laki:ring-4 peer-focus-visible/laki:ring-fiesta-orange",
  kita: "peer-checked/kita:bg-fiesta-navy peer-checked/kita:text-white peer-focus-visible/kita:ring-4 peer-focus-visible/kita:ring-fiesta-orange",
  brgy: "peer-checked/brgy:bg-fiesta-navy peer-checked/brgy:text-white peer-focus-visible/brgy:ring-4 peer-focus-visible/brgy:ring-fiesta-orange",
};
const PEER_PANEL: Record<string, string> = {
  pop: "peer-checked/pop:block", laki: "peer-checked/laki:block", kita: "peer-checked/kita:block", brgy: "peer-checked/brgy:block",
};
