import type { Metadata } from "next";
import Link from "next/link";
import BayanHub from "@/components/site/BayanHub";
import LinkChoropleth from "@/components/site/LinkChoropleth";
import PageTitle from "@/components/site/PageTitle";
import { BarChart } from "@/components/kit/Charts";
import CompareTowns from "@/components/kit/CompareTowns";
import DataTable from "@/components/kit/DataTable";
import { Breadcrumbs } from "@/components/kit/Ui";
import { getBayanSummary, bayanMetrics, bayanRows, type BayanSummary } from "@/lib/bayan";
import { getMunicipalities } from "@/lib/municipalities";
import { fmtInt } from "@/lib/stats";

export const metadata: Metadata = { title: "Bayan", description: "Ang 14 na bayan at 1 lungsod ng Oriental Mindoro: populasyon, barangay, tulong, proyekto at halalan." };

const h2 = "mb-4 font-serif text-2xl font-bold";

export default function Bayan() {
  const list = getMunicipalities();
  const slugs = Object.fromEntries(list.map((m) => [m.pcode, m.slug]));
  const summaries = Object.fromEntries(list.map((m) => [m.slug, getBayanSummary(m.slug)!])) as Record<string, BayanSummary>;
  const pop = (slug: string) => summaries[slug].population;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bayan" }]} />
      <div className="mt-4"><PageTitle eyebrow="BAYAN" title="Mga bayan at lungsod" color="#8a3a18" /></div>
      <p className="mt-4 text-black/70">14 bayan at 1 lungsod ng Oriental Mindoro. Ituro o pindutin ang mapa, o pumili sa listahan sa ibaba.</p>
      <div className="mt-6"><BayanHub slugs={slugs} summaries={summaries} /></div>

      <section aria-labelledby="pop" className="mt-14">
        <h2 id="pop" className={h2}>Populasyon ng bawat bayan</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <BarChart rows={list.filter((m) => pop(m.slug) != null).map((m) => ({ label: m.name, value: pop(m.slug)!, href: `/bayan/${m.slug}` }))} format={fmtInt} highlight="Calapan City" />
          <LinkChoropleth rows={list.map((m) => ({ pcode: m.pcode, name: m.name, value: pop(m.slug) ?? null, href: `/bayan/${m.slug}` }))} format={fmtInt} unit="populasyon" />
        </div>
      </section>

      <section aria-labelledby="table" className="mt-14">
        <h2 id="table" className={h2}>Talaan ng 15 bayan</h2>
        <DataTable caption="Mga bayan at lungsod ng Oriental Mindoro" filterKey="name" rows={bayanRows()}
          cols={[{ key: "name", label: "table.name" }, { key: "kind", label: "table.kind" }, { key: "pop", label: "table.pop", align: "right", format: "int" }, { key: "trend", label: "table.trend", format: "spark" }, { key: "area", label: "table.area", align: "right", format: "int" }]} />
        <p className="mt-2 text-xs text-black/65">Ang &quot;-&quot; ay nangangahulugang walang datos, hindi zero.</p>
      </section>

      <section aria-labelledby="compare" className="mt-14">
        <h2 id="compare" className={h2}>Paghambingin ang dalawang bayan</h2>
        <CompareTowns initial={["naujan", "pinamalayan"]} towns={list.map((t) => ({ slug: t.slug, name: t.name }))} metrics={bayanMetrics()} />
        <p className="mt-3 text-xs text-black/65">Proyekto: bilang ng proyekto ng DPWH na natukoy ang bayan. Bawat hanay ay sinusukat sa mas malaki sa dalawa.</p>
      </section>

      <h2 className="mt-14 text-sm font-semibold tracking-widest text-black/60">LAHAT NG BAYAN</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {list.map((m) => (
          <li key={m.slug}><Link href={`/bayan/${m.slug}`} className="flex min-h-11 items-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium hover:border-black/30">{m.name}</Link></li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-black/65">Source: NAMRIA/PSA boundaries via BetterGov Open Data (MIT); populasyon: PSA via Wikidata (CC0).</p>
    </main>
  );
}
