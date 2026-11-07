import type { Metadata } from "next";
import Link from "next/link";
import PopTrend from "@/components/stats/PopTrend";
import { SourceNote, StatCard } from "@/components/stats/StatCard";
import { getMunicipalities, getBarangays } from "@/lib/municipalities";
import { DASH, fmtInt, fmtPeso, getProvinceStats, getStats } from "@/lib/stats";

export const metadata: Metadata = { title: "Estatistika", description: "Populasyon, kita, at pananalapi ng Oriental Mindoro at ng 15 bayan at lungsod nito." };

const short = (c?: string) => c?.replace(/ (municipal|city|provincial) income class/, "") ?? DASH;

export default function Estatistika() {
  const prov = getProvinceStats();
  const rows = getMunicipalities().map((m) => ({ m, s: getStats(m.slug), brgy: getBarangays(m.pcode).length }));
  const totalArea = rows.reduce((a, r) => a + r.m.areaKm2, 0);
  const totalBrgy = rows.reduce((a, r) => a + r.brgy, 0);
  const latest = prov.population.at(-1);
  const maxPop = Math.max(...rows.map((r) => r.s?.population.at(-1)?.value ?? 0), 1);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Estatistika ng Oriental Mindoro</h1>
      <p className="mt-2 text-black/70">Populasyon, laki, at pananalapi ng lalawigan at ng bawat bayan. Ang &quot;-&quot; ay nangangahulugang walang datos.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="POPULASYON" value={fmtInt(latest?.value)} note={latest ? `Census ${latest.year}` : undefined} />
        <StatCard label="BARANGAY" value={fmtInt(totalBrgy)} note="Ayon sa boundary data" />
        <StatCard label="LAKI (KM²)" value={fmtInt(totalArea)} note="Kabuuan ng 15 LGU" />
        <StatCard label="KITA NG PROBINSYA" value={fmtPeso(prov.revenue?.value)} note={prov.revenue ? `Taon ${prov.revenue.year}` : undefined} />
      </div>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">POPULASYON NG LALAWIGAN</h2>
      <div className="mt-3 max-w-xl"><PopTrend points={prov.population} /></div>
      <SourceNote>Source: PSA Census of Population at 2024 POPCEN via <a className="underline" href={prov.wikidata}>Wikidata</a> (CC0), nakuha {latest?.retrievedAt}.</SourceNote>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">BAWAT BAYAN AT LUNGSOD</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">Estatistika ng mga bayan at lungsod ng Oriental Mindoro</caption>
          <thead>
            <tr className="border-b border-black/20 text-left text-xs tracking-widest text-black/60">
              <th scope="col" className="py-2 pr-3">BAYAN</th>
              <th scope="col" className="py-2 pr-3">POPULASYON 2024</th>
              <th scope="col" className="py-2 pr-3 text-right">BRGY</th>
              <th scope="col" className="py-2 pr-3 text-right">KM²</th>
              <th scope="col" className="py-2 pr-3">KLASE</th>
              <th scope="col" className="py-2 text-right">KITA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, s, brgy }) => {
              const p = s?.population.at(-1)?.value;
              return (
                <tr key={m.slug} className="border-b border-black/10">
                  <th scope="row" className="py-2 pr-3 text-left font-normal"><Link href={`/bayan/${m.slug}`} className="underline">{m.name}</Link></th>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-16 tabular-nums">{fmtInt(p)}</span>
                      <span className="h-2 flex-1 rounded-sm bg-black/5" aria-hidden><span className="block h-2 rounded-sm bg-[#1b2a4a]" style={{ width: `${((p ?? 0) / maxPop) * 100}%` }} /></span>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmtInt(brgy)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmtInt(m.areaKm2)}</td>
                  <td className="py-2 pr-3">{short(s?.incomeClass?.value)}</td>
                  <td className="py-2 text-right tabular-nums">{fmtPeso(s?.revenue?.value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SourceNote>
        Populasyon: PSA via Wikidata (CC0). Klase at kita: BLGF/COA financial statements via Wikidata (CC0), taong 2024 kung available. Ang IRA share at IRA dependency ay hindi pa mailathala dahil walang bukas na dataset na nakuha; ipapakita ito kapag may mapagkukunan. Lugar at barangay: NAMRIA/PSA boundaries via BetterGov Open Data.
      </SourceNote>
    </main>
  );
}
