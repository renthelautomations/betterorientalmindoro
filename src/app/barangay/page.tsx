import type { Metadata } from "next";
import Link from "next/link";
import TownEmblem from "@/components/kit/TownEmblem";
import { T } from "@/lib/i18n/i18n";
import { TPageHead } from "@/components/site/DynBits";
import { getTownBarangays, projectsIn } from "@/lib/barangays";
import BarangayCard from "@/components/site/BarangayCard";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Mga barangay", description: "Lahat ng 426 barangay ng Oriental Mindoro ayon sa bayan, may mapa at mga proyekto ng DPWH." };

export default function Barangays() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TPageHead crumbs={[{ label: "dyn.home", href: "/" }, { label: "brg.tab" }]} eyebrow="brg.eyebrow" title="brg.idx.title"><p><T k="brg.idx.lead" /></p></TPageHead>
      <p className="mt-4 rounded-2xl bg-fiesta-mint p-4 text-sm text-black/75"><T k="brg.idx.off" /></p>
      <div className="mt-8 space-y-6">
        {getMunicipalities().map((m) => {
          const list = getTownBarangays(m.slug);
          return (
            <section key={m.slug} aria-labelledby={`t-${m.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-4 bg-fiesta-mint px-5 py-4">
                <TownEmblem slug={m.slug} name={m.name} className="h-14 w-14 shrink-0" capital={m.slug === "calapan-city"} />
                <h2 id={`t-${m.slug}`} className="font-serif text-2xl font-bold text-fiesta-navy"><Link href={`/bayan/${m.slug}`} className="hover:underline">{m.name}</Link></h2>
                <span className="ml-auto rounded-full bg-fiesta-navy px-3 py-1 text-sm font-bold text-white">{list.length}</span>
              </div>
              <ul className="grid auto-rows-fr gap-2.5 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((b) => <li key={b.code}><BarangayCard b={b} projects={projectsIn(b).length} /></li>)}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
