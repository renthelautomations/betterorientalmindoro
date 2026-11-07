import SmartSearch from "@/components/site/SmartSearch";
import { getSearchItems } from "@/lib/search-index";
import SplitSticky from "@/components/site/SplitSticky";
import type { Metadata } from "next";
import Attribution from "@/components/dynasties/Attribution";
import DynNote from "@/components/site/DynNote";
import DynSwitch from "@/components/site/DynSwitch";
import DynSurnames from "@/components/site/DynSurnames";
import { WinnersGrid } from "@/components/site/DynGrid";
import { TBreadcrumbs, TF, TPageTitle } from "@/components/site/DynBits";
import { T } from "@/lib/i18n/i18n";
import Link from "next/link";
import { LinkNetwork } from "@/components/site/LinkNetwork";
import TownEmblem from "@/components/kit/TownEmblem";
import KitIcon from "@/components/kit/KitIcon";
import { getProvince, getTown, provinceSurnames, sharedSurnames, surnameNetwork, titleCase, type Town } from "@/lib/dynasties";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Dynasties", description: "Mga apelyidong paulit-ulit sa halalan ng Oriental Mindoro, 2001–2025." };

export default function Dynasties() {
  const p = getProvince();
  const towns = p.towns.map(getTown).filter((t): t is Town => !!t);
  const names = getMunicipalities().filter((m) => p.towns.includes(m.slug));
  const nameOf = Object.fromEntries(names.map((m) => [m.slug, m.name]));
  const gridTowns = names.map((m) => ({ slug: m.slug, name: m.name, contests: towns.find((t) => t.slug === m.slug)!.contests }));
  const years = p.elections.map((e) => e.year);
  const links = surnameNetwork(towns);
  const edges = links.map((l) => ({ a: l.a, b: l.b, weight: l.weight, surnames: l.surnames.map(titleCase).join(", ") }));
  const stat = (label: string, value: string) => <div className="rounded-2xl border border-black/10 bg-white p-3"><dt className="text-xs text-black/70"><T k={label} /></dt><dd className="mt-1 font-serif text-2xl font-bold text-fiesta-navy">{value}</dd></div>;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <TBreadcrumbs items={[{ label: "dyn.home", href: "/" }, { label: "dyn.crumb" }]} />
      <div className="mt-4"><TPageTitle eyebrow="dyn.eyebrow.dyn" title="dyn.title" /></div>
      <p className="mt-4 max-w-2xl text-black/75"><TF k="dyn.intro" v={[years[0], years.at(-1) ?? ""]} /></p>
      <div className="mt-6"><SmartSearch items={getSearchItems()} /></div>
      <div className="mt-5"><DynSwitch current={null} towns={names} /></div>
      <div className="mt-5"><DynNote /></div>

      <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
        {stat("dyn.stat.poverty", p.poverty != null ? `${p.poverty}%` : "-")}
        {stat("dyn.stat.elections", String(p.elections.length))}
        {stat("dyn.stat.towns", String(towns.length))}
      </dl>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70"><T k="dyn.net.h" /></h2>
      <p className="mb-3 mt-2 text-sm text-black/75"><T k="dyn.net.p" /></p>
      <SplitSticky side={<LinkNetwork nodes={towns.map((t) => ({ id: t.slug, label: nameOf[t.slug] }))} edges={edges} />}>
        <h3 className="mt-4 text-sm font-semibold text-black/70"><T k="dyn.net.pairs" /></h3>
        {links.length ? (
          <ul className="mt-2 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white text-sm">
            {links.map((l) => <li key={l.a + l.b} className="px-4 py-2"><b>{nameOf[l.a]}</b> <T k="dyn.and" /> <b>{nameOf[l.b]}</b>: {l.surnames.map(titleCase).join(", ")} ({l.weight})</li>)}
          </ul>
        ) : <p className="mt-2 text-sm text-black/70"><T k="dyn.net.none" /></p>}
      </SplitSticky>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70"><T k="dyn.rep.h" /></h2>
      <p className="mb-3 mt-2 text-sm text-black/75"><T k="dyn.rep.p" /></p>
      <DynSurnames rows={provinceSurnames(towns, 10)} towns={towns} names={nameOf} />

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70"><T k="dyn.win.h" /></h2>
      <p className="mb-3 mt-2 text-sm text-black/75"><T k="dyn.win.p" /></p>
      <WinnersGrid towns={gridTowns.slice(0, 5)} years={years} caption="dyn.cap.first" />
      <details className="mt-3">
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-fiesta-blue underline"><TF k="dyn.win.more" v={[gridTowns.length - 5]} /></summary>
        <div className="mt-2"><WinnersGrid towns={gridTowns.slice(5)} years={years} caption="dyn.cap.rest" /></div>
      </details>
      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/70"><T k="dyn.all.h" /></h2>
      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {names.map((m) => {
          const n = sharedSurnames(towns.find((t) => t.slug === m.slug)!.contests).length;
          return (
            <li key={m.slug}>
              <Link href={`/dynasties/${m.slug}`} className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:border-fiesta-navy/40 hover:shadow-md">
                <TownEmblem slug={m.slug} name={m.name} className="h-14 w-14 shrink-0" capital={m.slug === "calapan-city"} />
                <span className="min-w-0 flex-1"><span className="block font-serif text-lg font-bold text-fiesta-navy">{m.name}</span><span className="block text-xs text-black/65">{n ? <TF k="dyn.town.reps" v={[n]} /> : <T k="dyn.town.none" />}</span></span>
                <KitIcon name="arrow" className="h-5 w-5 shrink-0 text-black/30 transition group-hover:translate-x-0.5 group-hover:text-fiesta-navy" />
              </Link>
            </li>
          );
        })}
      </ul>
      <Attribution />
    </main>
  );
}
