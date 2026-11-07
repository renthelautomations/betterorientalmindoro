import { fmtInt, fmtPeso, getStats, iraDependency, DASH } from "@/lib/stats";
import { T } from "@/lib/i18n/i18n";
import { R } from "@/components/site/FinanceBits";
import { StatCard, SourceNote, IncomeClass } from "./StatCard";
import PopTrend from "./PopTrend";

export default function MunicipalityStats({ slug, areaKm2, barangays }: { slug: string; areaKm2: number; barangays: number }) {
  const s = getStats(slug);
  if (!s) return null;
  const pop = s.population.filter((p) => p.year >= 2010);
  const latest = s.population.at(-1);
  const dep = iraDependency(s.ira?.value, s.revenue?.value);
  const fin = (d: typeof s.revenue) => (d ? <><T k="finance.year" /> {d.year}</> : <T k="town.nodata" />);
  return (
    <section>
      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60"><T k="finance.st.h" /></h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="town.pop" value={fmtInt(latest?.value)} note={latest ? `Census ${latest.year}` : undefined} />
        <StatCard label="finance.brgy" value={fmtInt(barangays)} />
        <StatCard label="finance.area" value={fmtInt(areaKm2)} />
        <StatCard label="finance.th.class" value={<IncomeClass value={s.incomeClass?.value} />} note={s.incomeClass ? <><T k="finance.year" /> {s.incomeClass.year}</> : undefined} />
      </div>
      <h3 className="mt-6 font-serif text-lg font-bold"><T k="town.pop.over" /></h3>
      <div className="mt-2 max-w-xl"><PopTrend points={pop} /></div>
      <SourceNote><R k="finance.st.popsrc" v={[<a key="w" className="underline" href={s.wikidata}>Wikidata</a>]} /></SourceNote>
      <h3 className="mt-6 font-serif text-lg font-bold"><T k="finance.st.fin" /></h3>
      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="finance.st.rev" value={fmtPeso(s.revenue?.value)} note={fin(s.revenue)} />
        <StatCard label="town.spend" value={fmtPeso(s.expenditure?.value)} note={fin(s.expenditure)} />
        <StatCard label="IRA SHARE" value={fmtPeso(s.ira?.value)} note={s.ira ? <><T k="finance.year" /> {s.ira.year}</> : <T k="finance.st.noopen" />} />
        <StatCard label="IRA DEPENDENCY" value={dep === null ? DASH : `${(dep * 100).toFixed(1)}%`} note={<T k="finance.st.irafrac" />} />
      </div>
      <SourceNote>
        <R k="finance.st.finsrc" v={[s.revenue ? <> · <a className="underline" href={s.wikidata}>Wikidata</a> · <T k="finance.st.retrieved" /> {s.revenue.retrievedAt}</> : null]} />
      </SourceNote>
    </section>
  );
}
