import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { TPageHead } from "@/components/site/DynBits";
import { Group, Lead, OfficialsSource, Person } from "@/components/site/OfficialCards";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import TownEmblem from "@/components/kit/TownEmblem";
import { getMunicipalities } from "@/lib/municipalities";
import { provinceOfficials, townOfficials } from "@/lib/officials";

export const metadata: Metadata = { title: "Mga opisyal", description: "Mga kasalukuyang opisyal ng Oriental Mindoro: gobernador, kongresista, alkalde at iba pa." };

export default function Opisyal() {
  const lead = [...provinceOfficials("governor"), ...provinceOfficials("vice-governor")];
  const towns = getMunicipalities();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TPageHead crumbs={[{ label: "dyn.home", href: "/" }, { label: "off.tab" }]} eyebrow="off.eyebrow" title="off.title"><p><T k="off.lead" /></p></TPageHead>
      <div className="mt-8 space-y-10">
        <Group id="of-prov" title="off.prov.h"><ul className="mt-4 grid gap-4 sm:grid-cols-2">{lead.map((o) => <Lead key={o.id} o={o} />)}</ul></Group>
        <Group id="of-house" title="off.house.h"><ul className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">{provinceOfficials("house").map((o) => <Person key={o.id} o={o} tone={FIESTA_DEEP.green} />)}</ul></Group>
        <Group id="of-board" title="off.board.h"><ul className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">{(() => { const b = provinceOfficials("board"); const m = Math.max(...b.map((x) => x.votes ?? 0), 1); return b.map((o) => <Person key={o.id} o={o} max={m} tone={FIESTA.blue} />); })()}</ul></Group>
        <Group id="of-towns" title="off.towns.h">
          <p className="mt-1 text-sm text-black/70"><T k="off.town.pick" /></p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {towns.map((m) => (
              <li key={m.slug}>
                <Link href={`/bayan/${m.slug}#opisyal`} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
                  <div className="flex items-center gap-4 bg-fiesta-mint px-5 py-4">
                    <TownEmblem slug={m.slug} name={m.name} className="h-14 w-14 shrink-0" capital={m.slug === "calapan-city"} />
                    <p className="font-serif text-xl font-bold text-fiesta-navy group-hover:underline">{m.name}</p>
                  </div>
                  <dl className="flex-1 space-y-3 p-5">
                    <div><dt className="text-xs font-semibold tracking-widest text-fiesta-blue"><T k="off.col.mayor" /></dt><dd className="mt-0.5 font-semibold text-fiesta-navy">{townOfficials(m.slug, "mayor")[0]?.name ?? "-"}</dd></div>
                    <div><dt className="text-xs font-semibold tracking-widest text-fiesta-green"><T k="off.col.vice" /></dt><dd className="mt-0.5 text-black/80">{townOfficials(m.slug, "vice-mayor")[0]?.name ?? "-"}</dd></div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </Group>
        <OfficialsSource />
      </div>
    </main>
  );
}
