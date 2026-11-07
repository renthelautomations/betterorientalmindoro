import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Attribution from "@/components/dynasties/Attribution";
import OfficeholderTable from "@/components/dynasties/OfficeholderTable";
import DynNote from "@/components/site/DynNote";
import DynSwitch from "@/components/site/DynSwitch";
import DynSurnames from "@/components/site/DynSurnames";
import { WinnersGrid } from "@/components/site/DynGrid";
import { Accordion, Breadcrumbs } from "@/components/kit/Ui";
import PageTitle from "@/components/site/PageTitle";
import { getProvince, getTown, GRID_SEATS, POSITION_LABEL, sharedSurnames } from "@/lib/dynasties";
import { getMunicipalities, getMunicipality } from "@/lib/municipalities";

export function generateStaticParams() {
  return getProvince().towns.map((town) => ({ town }));
}

export async function generateMetadata({ params }: PageProps<"/dynasties/[town]">): Promise<Metadata> {
  const { town } = await params;
  const m = getMunicipality(town);
  return m ? { title: `Dynasties: ${m.name}` } : {};
}

export default async function TownDynasties({ params }: PageProps<"/dynasties/[town]">) {
  const { town } = await params;
  const m = getMunicipality(town);
  const t = getTown(town);
  if (!m || !t) notFound();
  const p = getProvince();
  const names = getMunicipalities().filter((x) => p.towns.includes(x.slug));
  const years = p.elections.map((e) => e.year);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dinastiya", href: "/dynasties" }, { label: m.name }]} />
      <div className="mt-4"><PageTitle eyebrow="DINASTIYA" title={m.name} /></div>
      <p className="mt-4 max-w-2xl text-black/75">Mga nahalal na opisyal at paulit-ulit na apelyido, {years[0]}–{years.at(-1)}.</p>
      <div className="mt-5"><DynSwitch current={town} towns={names} /></div>
      <div className="mt-5"><DynNote /></div>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70">MAYOR AT VICE MAYOR BAWAT HALALAN</h2>
      <div className="mt-3"><WinnersGrid towns={[{ slug: town, name: m.name, contests: t.contests }]} years={years} caption={`Mga nanalong mayor at vice mayor ng ${m.name} ayon sa taon ng halalan`} /></div>
      <ul className="mt-4 space-y-5">
        {GRID_SEATS.map((pos) => (
          <li key={pos}><h3 className="text-sm font-semibold text-black/70">{POSITION_LABEL[pos]}: buong pangalan at partido</h3><OfficeholderTable contests={t.contests} position={pos} /></li>
        ))}
      </ul>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70">PAULIT-ULIT NA APELYIDO</h2>
      <p className="mb-3 mt-2 text-sm text-black/75">Apelyidong hawak ng dalawa o higit pang magkaibang tao sa mga nanalo (lahat ng taon). Pindutin ang isa para makita ang mga panalo.</p>
      <DynSurnames rows={sharedSurnames(t.contests)} towns={[t]} names={{ [town]: m.name }} />

      <div className="mt-10"><Accordion items={[{ q: "Mga konsehal bawat halalan", a: <OfficeholderTable contests={t.contests} position="COUNCILOR" /> }]} /></div>
      <Attribution />
    </main>
  );
}
