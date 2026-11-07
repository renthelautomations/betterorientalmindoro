import { fmtInt, fmtPeso, getStats, iraDependency, DASH } from "@/lib/stats";
import { StatCard, SourceNote } from "./StatCard";
import PopTrend from "./PopTrend";

export default function MunicipalityStats({ slug, areaKm2, barangays }: { slug: string; areaKm2: number; barangays: number }) {
  const s = getStats(slug);
  if (!s) return null;
  const pop = s.population.filter((p) => p.year >= 2010);
  const latest = s.population.at(-1);
  const dep = iraDependency(s.ira?.value, s.revenue?.value);
  const fin = (d: typeof s.revenue) => (d ? `Taon ${d.year}` : "Walang datos");
  return (
    <section>
      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">ESTATISTIKA</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="POPULASYON" value={fmtInt(latest?.value)} note={latest ? `Census ${latest.year}` : undefined} />
        <StatCard label="BARANGAY" value={fmtInt(barangays)} />
        <StatCard label="LAKI (KM²)" value={fmtInt(areaKm2)} />
        <StatCard label="KLASE NG KITA" value={s.incomeClass?.value.replace(/ (municipal|city|provincial) income class/, " klase") ?? DASH} note={s.incomeClass ? `Taon ${s.incomeClass.year}` : undefined} />
      </div>
      <h3 className="mt-6 font-serif text-lg font-bold">Populasyon sa paglipas ng panahon</h3>
      <div className="mt-2 max-w-xl"><PopTrend points={pop} /></div>
      <SourceNote>Source: PSA Census of Population (2015, 2020 CPH; 2024 POPCEN) via <a className="underline" href={s.wikidata}>Wikidata</a>, CC0.</SourceNote>
      <h3 className="mt-6 font-serif text-lg font-bold">Pananalapi ng LGU</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="KITA (REVENUE)" value={fmtPeso(s.revenue?.value)} note={fin(s.revenue)} />
        <StatCard label="GASTOS" value={fmtPeso(s.expenditure?.value)} note={fin(s.expenditure)} />
        <StatCard label="IRA SHARE" value={fmtPeso(s.ira?.value)} note={s.ira ? `Taon ${s.ira.year}` : "Walang bukas na datos"} />
        <StatCard label="IRA DEPENDENCY" value={dep === null ? DASH : `${(dep * 100).toFixed(1)}%`} note="IRA ÷ kabuuang kita" />
      </div>
      <SourceNote>
        Source: COA annual financial statements (Wikidata, CC0){s.revenue ? <> · <a className="underline" href={s.wikidata}>Wikidata</a> · nakuha {s.revenue.retrievedAt}</> : null}. Ang &quot;-&quot; ay nangangahulugang walang datos, hindi zero.
      </SourceNote>
    </section>
  );
}
