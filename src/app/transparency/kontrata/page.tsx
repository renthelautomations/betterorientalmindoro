import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, Title } from "@/components/site/FinanceBits";
import KitIcon from "@/components/kit/KitIcon";
import TpAwards from "@/components/site/TpAwards";
import { T } from "@/lib/i18n/i18n";
import { getAggregates, getAwards } from "@/lib/philgeps";

export const metadata: Metadata = { title: "Mga kontrata sa Oriental Mindoro", description: "Mga award ng kontrata sa PhilGEPS na isinasagawa o binili sa Oriental Mindoro, 2023 hanggang 2025. Halagang inilathala, hindi beripikadong gastos." };

export default function Kontrata() {
  const awards = getAwards();
  const offices = [...new Set(getAggregates().topEntitiesByCount.map((e) => e.name))].slice(0, 30);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Crumbs items={[{ label: "finance.home", href: "/" }, { label: "nav.transparency", href: "/transparency" }, { label: "pp.list.h" }]} />
      <div className="mt-4"><Title eyebrow="tp.eyebrow" title="pp.list.h" /></div>
      <p className="mt-4 max-w-3xl text-black/75"><T k="pp.list.p" /></p>
      <p className="mt-2 max-w-3xl text-sm text-black/70"><T k="pp.note.p" /></p>
      <div className="mt-6"><TpAwards awards={awards} offices={offices} /></div>
      <p className="mt-8"><Link href="/transparency#pagbili" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-fiesta-blue underline underline-offset-2"><KitIcon name="arrow" className="h-4 w-4 rotate-180" /><T k="pp.l.back" /></Link></p>
    </main>
  );
}
