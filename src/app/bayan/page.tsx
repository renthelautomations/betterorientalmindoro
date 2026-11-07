import type { Metadata } from "next";
import Link from "next/link";
import BayanHub from "@/components/site/BayanHub";
import { Breadcrumbs } from "@/components/kit/Ui";
import { getBayanSummary, type BayanSummary } from "@/lib/bayan";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Bayan", description: "Ang 14 na bayan at 1 lungsod ng Oriental Mindoro: populasyon, barangay, tulong, proyekto at halalan." };

export default function Bayan() {
  const list = getMunicipalities();
  const slugs = Object.fromEntries(list.map((m) => [m.pcode, m.slug]));
  const summaries = Object.fromEntries(list.map((m) => [m.slug, getBayanSummary(m.slug)!])) as Record<string, BayanSummary>;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bayan" }]} />
      <h1 className="mt-4 font-serif text-3xl font-bold md:text-4xl">Mga bayan at lungsod</h1>
      <p className="mt-2 text-black/70">14 bayan at 1 lungsod ng Oriental Mindoro. Ituro o pindutin ang mapa, o pumili sa listahan.</p>
      <div className="mt-6"><BayanHub slugs={slugs} summaries={summaries} /></div>
      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">LAHAT NG BAYAN</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {list.map((m) => (
          <li key={m.slug}><Link href={`/bayan/${m.slug}`} className="flex min-h-11 items-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium hover:border-black/30">{m.name}</Link></li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-black/65">Source: NAMRIA/PSA boundaries via BetterGov Open Data (MIT); populasyon: PSA via Wikidata (CC0). Ang &quot;-&quot; ay nangangahulugang walang datos, hindi zero.</p>
    </main>
  );
}
