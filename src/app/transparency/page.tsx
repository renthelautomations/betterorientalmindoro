import type { Metadata } from "next";
import Link from "next/link";
import { Tabs } from "@/components/kit/Interactive";
import { Crumbs, Title } from "@/components/site/FinanceBits";
import KitIcon from "@/components/kit/KitIcon";
import MenuEmblem from "@/components/site/MenuEmblem";
import TpProcurement from "@/components/site/TpProcurement";
import TpTax from "@/components/site/TpTax";
import { T } from "@/lib/i18n/i18n";

export const metadata: Metadata = { title: "Transparency", description: "Mga kontrata ng gobyerno at nakolektang buwis sa Oriental Mindoro, mula sa mga bukas na datos ng BetterGov: PhilGEPS at BIR, kasama ang mga proyekto at badyet sa site na ito." };

const MORE = [
  { href: "/proyekto", k: "tp.more.dpwh", d: "tp.more.dpwh.d" },
  { href: "/badyet", k: "tp.more.budget", d: "tp.more.budget.d" },
  { href: "/badyet/redflags", k: "tp.more.red", d: "tp.more.red.d" },
  { href: "/pamahalaan", k: "tp.more.gov", d: "tp.more.gov.d" },
];

export default function Transparency() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Crumbs items={[{ label: "finance.home", href: "/" }, { label: "nav.transparency" }]} />
      <div className="mt-4"><Title eyebrow="tp.eyebrow" title="tp.title" /></div>
      <p className="mt-4 max-w-3xl text-black/75"><T k="tp.lead" /></p>
      <div className="mt-8">
        <Tabs tabs={[
          { id: "pagbili", label: "tp.tab.proc", panel: <TpProcurement /> },
          { id: "buwis", label: "tp.tab.tax", panel: <TpTax /> },
        ]} />
      </div>
      <section aria-labelledby="more" className="mt-14">
        <h2 id="more" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="tp.more.h" /></h2>
        <ul className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MORE.map((m, i) => (
            <li key={m.href}>
              <Link href={m.href} className="group flex h-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
                <MenuEmblem index={20 + i} />
                <span className="min-w-0 flex-1"><span className="block font-serif text-lg font-bold leading-tight text-fiesta-navy"><T k={m.k} /></span><span className="mt-0.5 line-clamp-2 block text-sm text-black/70"><T k={m.d} /></span></span>
                <KitIcon name="arrow" className="h-4 w-4 shrink-0 text-fiesta-blue transition group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
