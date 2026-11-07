import type { Metadata } from "next";
import BayanFrame from "@/components/site/BayanFrame";
import { bayanParams, requireBayan } from "@/components/site/bayanData";
import { SourceNote } from "@/components/stats/StatCard";
import LineChart from "@/components/kit/LineChart";
import { StatCard } from "@/components/kit/Parts";
import { EmptyState } from "@/components/kit/Ui";
import { FIESTA } from "@/components/kit/Patterns";
import { getMunicipality } from "@/lib/municipalities";
import { DASH, fmtPct, fmtPeso, getStats, iraDependency, popGrowth } from "@/lib/stats";

export const generateStaticParams = bayanParams;

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]/datos">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipality(slug);
  return m ? { title: `Estatistika ng ${m.name}`, description: `Populasyon, klase ng kita at pananalapi ng ${m.name}.` } : { robots: { index: false } };
}

export default async function Datos({ params }: PageProps<"/bayan/[slug]/datos">) {
  const { slug } = await params;
  const m = requireBayan(slug);
  const s = getStats(slug);
  const pop = s?.population ?? [];
  const g = popGrowth(pop);
  const dep = iraDependency(s?.ira?.value, s?.revenue?.value);
  const yr = (d?: { year: number } | null) => (d ? `Taon ${d.year}` : "Walang datos");
  return (
    <BayanFrame slug={slug} active="datos">
      {!s ? <EmptyState title="Walang estatistika">Wala pang nakuhang estatistika para sa {m.name}.</EmptyState> : (
        <div className="space-y-12">
          <section aria-labelledby="pop-h">
            <h2 id="pop-h" className="mb-3 text-sm font-semibold tracking-widest text-black/60">POPULASYON</h2>
            <div className="max-w-2xl"><LineChart series={[{ name: m.name, points: pop.map((p) => ({ year: p.year, value: p.value })) }]} label="Bayan:" /></div>
            {g !== null && <p className="mt-2 text-sm text-black/70">Paglago {pop[0].year}–{pop.at(-1)!.year}: <b>{g >= 0 ? "+" : ""}{fmtPct(g)}</b></p>}
            <SourceNote>Source: PSA Census of Population (1990 hanggang 2020 CPH; 2024 POPCEN) via <a className="underline" href={s.wikidata}>Wikidata</a> (CC0), nakuha {pop.at(-1)?.retrievedAt ?? DASH}.</SourceNote>
          </section>
          <section aria-labelledby="class-h">
            <h2 id="class-h" className="mb-3 text-sm font-semibold tracking-widest text-black/60">KLASE NG KITA</h2>
            <p className="font-serif text-2xl font-bold text-fiesta-navy">{s.incomeClass?.value ?? DASH}</p>
            <SourceNote>{s.incomeClass ? <>Taon {s.incomeClass.year} ayon sa pinagmulan{s.incomeClass.citedAs ? ` (${s.incomeClass.citedAs})` : ""}; maaaring nagbago na ang klase. Source: BLGF via <a className="underline" href={s.wikidata}>Wikidata</a> (CC0).</> : "Walang datos."}</SourceNote>
          </section>
          <section aria-labelledby="fin-h">
            <h2 id="fin-h" className="mb-3 text-sm font-semibold tracking-widest text-black/60">PANANALAPI NG LGU</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="KITA" value={fmtPeso(s.revenue?.value)} hint={yr(s.revenue)} icon="budget" color={FIESTA.blue} />
              <StatCard label="GASTOS" value={fmtPeso(s.expenditure?.value)} hint={yr(s.expenditure)} icon="doc" color={FIESTA.navy} />
              <StatCard label="IRA SHARE" value={fmtPeso(s.ira?.value)} hint={s.ira ? yr(s.ira) : "Walang bukas na datos"} icon="bolt" color={FIESTA.red} />
              <StatCard label="IRA DEPENDENCY" value={dep === null ? DASH : fmtPct(dep)} hint="IRA ÷ kabuuang kita" icon="pin" color={FIESTA.orange} />
            </div>
            <SourceNote>Source: COA annual financial statements via <a className="underline" href={s.wikidata}>Wikidata</a> (CC0){s.revenue ? `, nakuha ${s.revenue.retrievedAt}` : ""}. Ang &quot;-&quot; ay nangangahulugang walang datos, hindi zero.</SourceNote>
          </section>
        </div>
      )}
    </BayanFrame>
  );
}
