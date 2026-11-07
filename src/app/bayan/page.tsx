import type { Metadata } from "next";
import Link from "next/link";
import BayanHub from "@/components/site/BayanHub";
import LinkChoropleth from "@/components/site/LinkChoropleth";
import { BayanCrumbs, BayanTitle, BayanTable } from "@/components/site/BayanBits";
import { T } from "@/lib/i18n/i18n";
import { BarChart } from "@/components/kit/Charts";
import CompareTowns from "@/components/kit/CompareTowns";
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
      <BayanCrumbs items={[{ label: "bayan.home", href: "/" }, { label: "nav.towns" }]} />
      <div className="mt-4"><BayanTitle eyebrow="bayan.eyebrow" title="bayan.title" /></div>
      <p className="mt-4 text-black/70"><T k="bayan.lead" /></p>
      <div className="mt-6"><BayanHub slugs={slugs} summaries={summaries} /></div>

      <section aria-labelledby="pop" className="mt-14">
        <h2 id="pop" className={h2}><T k="bayan.pop.h" /></h2>
        <div className="grid gap-8 md:grid-cols-2">
          <BarChart rows={list.filter((m) => pop(m.slug) != null).map((m) => ({ label: m.name, value: pop(m.slug)!, href: `/bayan/${m.slug}` }))} format={fmtInt} highlight="Calapan City" />
          <LinkChoropleth rows={list.map((m) => ({ pcode: m.pcode, name: m.name, value: pop(m.slug) ?? null, href: `/bayan/${m.slug}` }))} format={fmtInt} ariaKey="bayan.map.aria" />
        </div>
      </section>

      <section aria-labelledby="table" className="mt-14">
        <h2 id="table" className={h2}><T k="bayan.table.h" /></h2>
        <BayanTable rows={bayanRows()} />
        <p className="mt-2 text-xs text-black/65"><T k="bayan.dash" /></p>
      </section>

      <section aria-labelledby="compare" className="mt-14">
        <h2 id="compare" className={h2}><T k="bayan.compare.h" /></h2>
        <CompareTowns initial={["naujan", "pinamalayan"]} towns={list.map((t) => ({ slug: t.slug, name: t.name }))} metrics={bayanMetrics()} />
        <p className="mt-3 text-xs text-black/65"><T k="bayan.compare.note" /></p>
      </section>

      <h2 className="mt-14 text-sm font-semibold tracking-widest text-black/60"><T k="bayan.all" /></h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {list.map((m) => (
          <li key={m.slug}><Link href={`/bayan/${m.slug}`} className="flex min-h-11 items-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium hover:border-black/30">{m.name}</Link></li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-black/65"><T k="bayan.source" /></p>
    </main>
  );
}
