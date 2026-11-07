import type { Metadata } from "next";
import Link from "next/link";
import { SourceNote } from "@/components/stats/StatCard";
import CompareTowns from "@/components/kit/CompareTowns";
import PageTitle from "@/components/site/PageTitle";
import { BarChart } from "@/components/kit/Charts";
import Choropleth from "@/components/site/LinkChoropleth";
import LineChart from "@/components/kit/LineChart";
import { StatCard } from "@/components/kit/Parts";
import { Breadcrumbs } from "@/components/kit/Ui";
import { FIESTA } from "@/components/kit/Patterns";
import { getMunicipalities, getBarangays } from "@/lib/municipalities";
import { DASH, fmtInt, fmtPeso, getProvinceStats, getStats, popGrowth, fmtPct } from "@/lib/stats";

export const metadata: Metadata = { title: "Estatistika", description: "Populasyon, kita, at pananalapi ng Oriental Mindoro at ng 15 bayan at lungsod nito." };

const short = (c?: string) => c?.replace(/ (municipal|city|provincial) income class/, " klase") ?? DASH;

export default function Estatistika() {
  const prov = getProvinceStats();
  const rows = getMunicipalities().map((m) => {
    const s = getStats(m.slug);
    return { m, s, pop: s?.population.at(-1)?.value ?? null, brgy: getBarangays(m.pcode).length, rev: s?.revenue?.value ?? null };
  });
  const latest = prov.population.at(-1);
  const g = popGrowth(prov.population);
  const metrics = [
    { id: "pop", label: "Populasyon", unit: "population", fmt: fmtInt, val: (r: (typeof rows)[number]) => r.pop },
    { id: "laki", label: "Laki", unit: "area in km²", fmt: (n: number) => `${fmtInt(n)} km²`, val: (r: (typeof rows)[number]) => r.m.areaKm2 },
    { id: "kita", label: "Kita", unit: "LGU revenue", fmt: fmtPeso, val: (r: (typeof rows)[number]) => r.rev },
    { id: "brgy", label: "Barangay", unit: "barangay count", fmt: fmtInt, val: (r: (typeof rows)[number]) => r.brgy },
  ];
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Estatistika" }]} />
      <div className="mt-4"><PageTitle eyebrow="ESTATISTIKA" title="Estatistika ng Oriental Mindoro" /></div>
      <p className="mt-3 text-black/70">Populasyon, laki, at pananalapi ng lalawigan at ng bawat bayan. Ang &quot;-&quot; ay nangangahulugang walang datos.</p>

      <section aria-label="Sa numero" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="POPULASYON" value={fmtInt(latest?.value)} hint={latest ? `Census ${latest.year}` : "Walang datos"} icon="people" color={FIESTA.blue} />
        <StatCard label="BARANGAY" value={fmtInt(rows.reduce((a, r) => a + r.brgy, 0))} hint="Ayon sa boundary data" icon="pin" color={FIESTA.navy} />
        <StatCard label="LAKI (KM²)" value={fmtInt(rows.reduce((a, r) => a + r.m.areaKm2, 0))} hint="Kabuuan ng 15 LGU" icon="mountain" color={FIESTA.navy} />
        <StatCard label="KITA NG PROBINSYA" value={fmtPeso(prov.revenue?.value)} hint={prov.revenue ? `Taon ${prov.revenue.year}` : "Walang datos"} icon="budget" color={FIESTA.red} />
      </section>

      <section aria-labelledby="mapa-h" className="mt-12">
        <h2 id="mapa-h" className="text-sm font-semibold tracking-widest text-black/60">MAPA AT PINAKAMATAAS</h2>
        <p className="mt-1 text-sm text-black/70">Pumili ng sukatan. Pindutin ang bayan sa mapa para buksan ito.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {metrics.map((k, i) => <input key={k.id} type="radio" name="metric" id={`m-${k.id}`} defaultChecked={i === 0} aria-label={k.label} className={`peer/${k.id} sr-only`} />)}
          {metrics.map((k) => (
            <label key={k.id} htmlFor={`m-${k.id}`} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy/10 ${PEER_LABEL[k.id]}`}>{k.label}</label>
          ))}
          {metrics.map((k) => {
            const data = rows.map((r) => ({ r, v: k.val(r) }));
            const ranked = data.filter((d): d is { r: (typeof rows)[number]; v: number } => d.v != null).map((d) => ({ label: d.r.m.name, value: d.v, href: `/bayan/${d.r.m.slug}` })).sort((a, b) => b.value - a.value);
            return (
              <div key={k.id} className={`hidden basis-full pt-4 ${PEER_PANEL[k.id]}`}>
                <div className="grid gap-8 md:grid-cols-2">
                  <Choropleth rows={data.map(({ r, v }) => ({ pcode: r.m.pcode, name: r.m.name, value: v, href: `/bayan/${r.m.slug}` }))} format={k.fmt} unit={k.unit} />
                  <div>
                    <h3 className="mb-3 font-serif text-lg font-bold">Nangunguna: {k.label.toLowerCase()}</h3>
                    {ranked.length ? <BarChart rows={ranked.slice(0, 5)} format={k.fmt} /> : <p className="text-sm text-black/60">Walang datos.</p>}
                    {ranked.length > 5 && (
                      <details className="mt-4">
                        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2">Ipakita lahat ({ranked.length})</summary>
                        <div className="mt-2"><BarChart rows={ranked} format={k.fmt} /></div>
                      </details>
                    )}
                    {ranked.length < rows.length && <p className="mt-3 text-xs text-black/65">{rows.length - ranked.length} bayan ang walang datos at kulay-abo sa mapa.</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <SourceNote>Populasyon: PSA via Wikidata (CC0), pinakahuling census ng bawat bayan. Kita: COA financial statements via Wikidata (CC0); magkakaiba ang taon, tingnan ang Datos ng bawat bayan. Laki at barangay: NAMRIA/PSA boundaries via BetterGov Open Data (MIT).</SourceNote>
      </section>

      <section aria-labelledby="lago-h" className="mt-12">
        <h2 id="lago-h" className="text-sm font-semibold tracking-widest text-black/60">PAGLAGO NG POPULASYON, {prov.population[0]?.year} HANGGANG {latest?.year}</h2>
        <div className="mt-3 max-w-2xl"><LineChart series={[{ name: "Buong lalawigan", points: prov.population.map((p) => ({ year: p.year, value: p.value })) }, ...rows.filter((r) => r.s).map((r) => ({ name: r.m.name, points: r.s!.population.map((p) => ({ year: p.year, value: p.value })) }))]} label="Ipakita:" /></div>
        {g !== null && <p className="mt-2 text-sm text-black/70">Lalawigan {prov.population[0].year}–{latest!.year}: <b>{g >= 0 ? "+" : ""}{fmtPct(g)}</b></p>}
        <SourceNote>Source: PSA Census of Population at 2024 POPCEN via <a className="underline" href={prov.wikidata}>Wikidata</a> (CC0), nakuha {latest?.retrievedAt}.</SourceNote>
      </section>

      <section aria-labelledby="cmp-h" className="mt-12">
        <h2 id="cmp-h" className="text-sm font-semibold tracking-widest text-black/60">IHAMBING ANG DALAWANG BAYAN</h2>
        <div className="mt-3 max-w-3xl">
          <CompareTowns initial={["calapan-city", "baco"]} towns={rows.map((r) => ({ slug: r.m.slug, name: r.m.name }))} metrics={[
            { label: "metric.pop", values: Object.fromEntries(rows.map((r) => [r.m.slug, r.pop])) },
            { label: "metric.area", values: Object.fromEntries(rows.map((r) => [r.m.slug, r.m.areaKm2])) },
            { label: "metric.revenue", unit: "peso", values: Object.fromEntries(rows.map((r) => [r.m.slug, r.rev])) },
          ]} />
        </div>
        <SourceNote>Walang datos ay "-", hindi zero. Ang kita ay mula sa COA via Wikidata (CC0).</SourceNote>
      </section>

      <section aria-labelledby="rank-h" className="mt-12">
        <h2 id="rank-h" className="text-sm font-semibold tracking-widest text-black/60">LISTAHAN NG MGA BAYAN, PINAKAMARAMING POPULASYON MUNA</h2>
        <p className="mt-1 text-sm text-black/70">Pindutin ang pangalan para buksan ang pahina ng bayan.</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Populasyon, laki, barangay, kita at klase ng kita ng 15 bayan at lungsod</caption>
            <thead className="text-xs tracking-widest text-black/65">
              <tr><th scope="col" className="p-3">BAYAN</th><th scope="col" className="p-3 text-right">POPULASYON</th><th scope="col" className="p-3 text-right">LAKI (KM²)</th><th scope="col" className="p-3 text-right">BARANGAY</th><th scope="col" className="p-3 text-right">KITA</th><th scope="col" className="p-3">KLASE NG KITA</th></tr>
            </thead>
            <tbody>
              {[...rows].sort((a, b) => (b.pop ?? -1) - (a.pop ?? -1)).map((r) => (
                <tr key={r.m.slug} className="border-t border-black/10">
                  <th scope="row" className="p-3 font-semibold"><Link href={`/bayan/${r.m.slug}`} className="inline-flex min-h-11 items-center text-fiesta-blue underline">{r.m.name}</Link></th>
                  <td className="p-3 text-right tabular-nums">{fmtInt(r.pop)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtInt(r.m.areaKm2)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtInt(r.brgy)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtPeso(r.rev)}</td>
                  <td className="p-3">{short(r.s?.incomeClass?.value)}{r.s?.incomeClass ? ` (${r.s.incomeClass.year})` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>Klase ng kita: BLGF via Wikidata (CC0); ang taon ay nasa panaklong at maaaring nagbago na ang klase. Ang IRA share at IRA dependency ay hindi pa mailathala dahil walang bukas na dataset. Pananalapi ng bawat bayan: <Link href="/bayan" className="underline">Bayan</Link>.</SourceNote>
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
