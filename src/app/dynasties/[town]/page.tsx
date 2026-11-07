import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Attribution from "@/components/dynasties/Attribution";
import OfficeholderTable from "@/components/dynasties/OfficeholderTable";
import DynNote from "@/components/site/DynNote";
import DynTownViz from "@/components/site/DynTownViz";
import DynFinder from "@/components/site/DynFinder";
import DynSurnames from "@/components/site/DynSurnames";
import { WinnersGrid } from "@/components/site/DynGrid";
import WinnersViews from "@/components/site/WinnersViews";
import { townSeats } from "@/components/site/dynSeats";
import { TAccordion, TBreadcrumbs, TF, TPageTitle,  } from "@/components/site/DynBits";
import { posKey } from "@/components/site/dynKeys";
import { T } from "@/lib/i18n/i18n";
import { allWinners, getProvince, getTown, GRID_SEATS, sharedSurnames } from "@/lib/dynasties";
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
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TBreadcrumbs items={[{ label: "dyn.home", href: "/" }, { label: "dyn.crumb", href: "/dynasties" }, { label: m.name }]} />
      <div className="mt-4"><TPageTitle eyebrow="dyn.eyebrow.dyn" title={m.name} /></div>
      <p className="mt-4 max-w-2xl text-black/75"><TF k="dyn.town.intro" v={[years[0], years.at(-1) ?? ""]} /></p>
      <div className="mt-5"><DynFinder current={town} towns={names} years={years} rows={allWinners([t])} /></div>
      <div className="mt-5"><DynNote /></div>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70"><T k="dyn.glance.h" /></h2>
      <div className="mt-3"><DynTownViz contests={t.contests} years={years} /></div>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70"><T k="dyn.win.h" /></h2>
      <div className="mt-3"><WinnersViews single years={years} towns={[townSeats(town, m.name, t.contests, years)]} table={<WinnersGrid towns={[{ slug: town, name: m.name, contests: t.contests }]} years={years} caption="dyn.cap.town" town={m.name} />} /></div>
      <ul className="mt-6 grid gap-6 lg:grid-cols-2">
        {GRID_SEATS.map((pos) => (
          <li key={pos}><h3 className="text-sm font-semibold text-black/70"><TF k="dyn.holders" v={[posKey(pos)]} /></h3><OfficeholderTable contests={t.contests} position={pos} /></li>
        ))}
      </ul>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70"><T k="dyn.rep.town.h" /></h2>
      <p className="mb-3 mt-2 text-sm text-black/75"><T k="dyn.rep.town.p" /></p>
      <DynSurnames rows={sharedSurnames(t.contests)} towns={[t]} names={{ [town]: m.name }} />

      <div className="mt-10"><TAccordion items={[{ q: "dyn.councilors", a: <OfficeholderTable contests={t.contests} position="COUNCILOR" /> }]} /></div>
      <Attribution />
    </main>
  );
}
