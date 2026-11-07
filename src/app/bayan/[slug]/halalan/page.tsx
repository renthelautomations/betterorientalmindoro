import type { Metadata } from "next";
import BayanFrame, { SeeAll } from "@/components/site/BayanFrame";
import { bayanParams, requireBayan } from "@/components/site/bayanData";
import Attribution from "@/components/dynasties/Attribution";
import DynNote from "@/components/site/DynNote";
import DynSurnames from "@/components/site/DynSurnames";
import { WinnersGrid } from "@/components/site/DynGrid";
import OfficeholderTable from "@/components/dynasties/OfficeholderTable";
import { Accordion, EmptyState } from "@/components/kit/Ui";
import { getProvince, getTown, GRID_SEATS, POSITION_LABEL, sharedSurnames } from "@/lib/dynasties";
import { getMunicipality } from "@/lib/municipalities";

export const generateStaticParams = bayanParams;

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]/halalan">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipality(slug);
  return m ? { title: `Halalan sa ${m.name}`, description: `Mga nahalal na opisyal at paulit-ulit na apelyido sa ${m.name}.` } : { robots: { index: false } };
}

export default async function Halalan({ params }: PageProps<"/bayan/[slug]/halalan">) {
  const { slug } = await params;
  const m = requireBayan(slug);
  const t = getTown(slug);
  const years = getProvince().elections.map((e) => e.year);
  return (
    <BayanFrame slug={slug} active="halalan">
      {!t ? <EmptyState title="Walang datos ng halalan">Wala pang datos ng halalan para sa {m.name} sa aming source.</EmptyState> : (
        <div className="max-w-3xl">
          <DynNote />
          <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70">MAYOR AT VICE MAYOR BAWAT HALALAN</h2>
          <div className="mt-3"><WinnersGrid towns={[{ slug, name: m.name, contests: t.contests }]} years={years} caption={`Mga nanalong mayor at vice mayor ng ${m.name} ayon sa taon ng halalan`} /></div>
          <ul className="mt-4 space-y-5">
            {GRID_SEATS.map((pos) => (
              <li key={pos}><h3 className="text-sm font-semibold text-black/70">{POSITION_LABEL[pos]}: buong pangalan at partido</h3><OfficeholderTable contests={t.contests} position={pos} /></li>
            ))}
          </ul>
          <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70">PAULIT-ULIT NA APELYIDO</h2>
          <div className="mt-3"><DynSurnames rows={sharedSurnames(t.contests)} towns={[t]} names={{ [slug]: m.name }} /></div>
          <div className="mt-10"><Accordion items={[{ q: "Mga konsehal bawat halalan", a: <OfficeholderTable contests={t.contests} position="COUNCILOR" /> }]} /></div>
          <SeeAll href={`/dynasties/${slug}`}>Buong pahina ng halalan sa {m.name}</SeeAll>
          <Attribution />
        </div>
      )}
    </BayanFrame>
  );
}
