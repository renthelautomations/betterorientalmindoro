import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { TPageHead } from "@/components/site/DynBits";
import { Group, Lead, OfficialsSource, Person } from "@/components/site/OfficialCards";
import { getMunicipalities } from "@/lib/municipalities";
import { provinceOfficials, townOfficials } from "@/lib/officials";

export const metadata: Metadata = { title: "Mga opisyal", description: "Mga kasalukuyang opisyal ng Oriental Mindoro: gobernador, kongresista, alkalde at iba pa." };

export default function Opisyal() {
  const lead = [...provinceOfficials("governor"), ...provinceOfficials("vice-governor")];
  const towns = getMunicipalities();
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <TPageHead crumbs={[{ label: "dyn.home", href: "/" }, { label: "off.tab" }]} eyebrow="off.eyebrow" title="off.title"><p><T k="off.lead" /></p></TPageHead>
      <div className="mt-8 space-y-10">
        <Group id="of-prov" title="off.prov.h"><ul className="mt-4 grid gap-4 sm:grid-cols-2">{lead.map((o) => <Lead key={o.id} o={o} />)}</ul></Group>
        <Group id="of-house" title="off.house.h"><ul className="mt-4 grid gap-3 sm:grid-cols-2">{provinceOfficials("house").map((o) => <Person key={o.id} o={o} />)}</ul></Group>
        <Group id="of-board" title="off.board.h"><ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{provinceOfficials("board").map((o) => <Person key={o.id} o={o} />)}</ul></Group>
        <Group id="of-towns" title="off.towns.h">
          <p className="mt-1 text-sm text-black/70"><T k="off.town.pick" /></p>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead><tr className="border-b border-black/10 text-xs tracking-widest text-black/65"><th scope="col" className="p-4"><T k="off.col.town" /></th><th scope="col" className="p-4"><T k="off.col.mayor" /></th><th scope="col" className="p-4"><T k="off.col.vice" /></th></tr></thead>
              <tbody>{towns.map((m) => (
                <tr key={m.slug} className="border-b border-black/5 last:border-0">
                  <th scope="row" className="p-4 font-semibold"><Link href={`/bayan/${m.slug}#opisyal`} className="text-fiesta-blue underline underline-offset-2">{m.name}</Link></th>
                  <td className="p-4">{townOfficials(m.slug, "mayor")[0]?.name ?? "-"}</td>
                  <td className="p-4">{townOfficials(m.slug, "vice-mayor")[0]?.name ?? "-"}</td>
                </tr>))}</tbody>
            </table>
          </div>
        </Group>
        <OfficialsSource />
      </div>
    </main>
  );
}
