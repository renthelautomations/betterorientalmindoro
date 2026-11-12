import type { Metadata } from "next";
import { T } from "@/lib/i18n/i18n";
import { TPageHead } from "@/components/site/DynBits";
import LawList from "@/components/site/LawList";
import { getLaws, LAWS_SOURCE } from "@/lib/laws";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Mga batas", description: "Mga batas, executive order at proklamasyon na tumutukoy sa Oriental Mindoro o sa isa sa mga bayan nito, may link sa Lawphil." };

export default function Batas() {
  const towns = getMunicipalities().map((m) => ({ slug: m.slug, name: m.name }));
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TPageHead crumbs={[{ label: "dyn.home", href: "/" }, { label: "law.tab" }]} eyebrow="law.eyebrow" title="law.title"><p><T k="law.lead" /></p></TPageHead>
      <div className="mt-8"><LawList laws={getLaws()} towns={towns} /></div>
      <p className="mt-6 text-sm text-black/70"><T k="law.note" /></p>
      <p className="mt-2 text-xs text-black/65"><T k="law.src" /> <a href={LAWS_SOURCE.sourceUrl} className="font-semibold text-fiesta-blue underline underline-offset-2">data.bettergov.ph</a></p>
    </main>
  );
}
