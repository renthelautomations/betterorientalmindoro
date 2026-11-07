import type { Metadata } from "next";
import BayanFrame, { SeeAll } from "@/components/site/BayanFrame";
import { bayanParams, requireBayan } from "@/components/site/bayanData";
import Attribution from "@/components/dynasties/Attribution";
import HowToRead from "@/components/dynasties/HowToRead";
import OfficeholderTable from "@/components/dynasties/OfficeholderTable";
import SurnameTable from "@/components/dynasties/SurnameTable";
import { EmptyState } from "@/components/kit/Ui";
import { getTown, POSITIONS, POSITION_LABEL, sharedSurnames } from "@/lib/dynasties";
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
  return (
    <BayanFrame slug={slug} active="halalan">
      {!t ? <EmptyState title="Walang datos ng halalan">Wala pang datos ng halalan para sa {m.name} sa aming source.</EmptyState> : (
        <div className="max-w-3xl">
          <HowToRead />
          <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">PAULIT-ULIT NA APELYIDO</h2>
          <SurnameTable rows={sharedSurnames(t.contests)} />
          {POSITIONS.map((pos) => (
            <section key={pos}>
              <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">{POSITION_LABEL[pos].toUpperCase()} BAWAT HALALAN</h2>
              <OfficeholderTable contests={t.contests} position={pos} />
            </section>
          ))}
          <SeeAll href={`/dynasties/${slug}`}>Buong pahina ng halalan sa {m.name}</SeeAll>
          <Attribution />
        </div>
      )}
    </BayanFrame>
  );
}
