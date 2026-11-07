import type { Metadata } from "next";
import Attribution from "@/components/dynasties/Attribution";
import DynNote from "@/components/site/DynNote";
import DynSwitch from "@/components/site/DynSwitch";
import DynSurnames from "@/components/site/DynSurnames";
import { WinnersGrid } from "@/components/site/DynGrid";
import { Breadcrumbs } from "@/components/kit/Ui";
import PageTitle from "@/components/site/PageTitle";
import { getProvince, getTown, provinceSurnames, type Town } from "@/lib/dynasties";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Dynasties", description: "Mga apelyidong paulit-ulit sa halalan ng Oriental Mindoro, 2001–2025." };

export default function Dynasties() {
  const p = getProvince();
  const towns = p.towns.map(getTown).filter((t): t is Town => !!t);
  const names = getMunicipalities().filter((m) => p.towns.includes(m.slug));
  const nameOf = Object.fromEntries(names.map((m) => [m.slug, m.name]));
  const gridTowns = names.map((m) => ({ slug: m.slug, name: m.name, contests: towns.find((t) => t.slug === m.slug)!.contests }));
  const years = p.elections.map((e) => e.year);
  const stat = (label: string, value: string) => <div className="rounded-2xl border border-black/10 bg-white p-3"><dt className="text-xs text-black/70">{label}</dt><dd className="mt-1 font-serif text-2xl font-bold text-fiesta-navy">{value}</dd></div>;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Datos", href: "/datos" }, { label: "Dinastiya" }]} />
      <div className="mt-4"><PageTitle eyebrow="DINASTIYA" title="Mga dinastiya sa halalan" /></div>
      <p className="mt-4 max-w-2xl text-black/75">Sino ang nahalal bilang mayor at vice mayor sa bawat bayan ng Oriental Mindoro, at aling mga apelyido ang paulit-ulit sa talaan mula {years[0]} hanggang {years.at(-1)}.</p>
      <div className="mt-5"><DynSwitch current={null} towns={names} /></div>
      <div className="mt-5"><DynNote /></div>

      <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
        {stat("Poverty incidence (PSA)", p.poverty != null ? `${p.poverty}%` : "-")}
        {stat("Halalan na saklaw", String(p.elections.length))}
        {stat("Bayan", String(towns.length))}
      </dl>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70">PAULIT-ULIT NA APELYIDO SA LALAWIGAN</h2>
      <p className="mb-3 mt-2 text-sm text-black/75">Apelyidong hawak ng dalawa o higit pang magkaibang tao, lahat ng taon at lokal na posisyon. Apelyido lang ang batayan. Pindutin ang isa para makita ang mga panalo.</p>
      <DynSurnames rows={provinceSurnames(towns, 10)} towns={towns} names={nameOf} />

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70">MAYOR AT VICE MAYOR BAWAT HALALAN</h2>
      <p className="mb-3 mt-2 text-sm text-black/75">Apelyido ng nanalo; pindutin para sa buong pangalan sa pahina ng bayan.</p>
      <WinnersGrid towns={gridTowns.slice(0, 5)} years={years} caption="Mga nanalong mayor at vice mayor, unang limang bayan, ayon sa taon ng halalan" />
      <details className="mt-3">
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-fiesta-blue underline">Ipakita pa ang {gridTowns.length - 5} bayan</summary>
        <div className="mt-2"><WinnersGrid towns={gridTowns.slice(5)} years={years} caption="Mga nanalong mayor at vice mayor, iba pang bayan, ayon sa taon ng halalan" /></div>
      </details>
      <Attribution />
    </main>
  );
}
