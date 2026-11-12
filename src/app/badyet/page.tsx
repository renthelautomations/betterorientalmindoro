import SmartSearch from "@/components/site/SmartSearch";
import { getSearchItems } from "@/lib/search-index";
import type { Metadata } from "next";
import { DistrictCard, BadyetNotes, NoSpendBanner } from "@/components/site/BadyetDistrict";
import Link from "next/link";
import KitIcon from "@/components/kit/KitIcon";
import { FlagSvg } from "@/components/site/RedFlagsBits";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import { Acc, Crumbs, R, Title } from "@/components/site/FinanceBits";
import { T } from "@/lib/i18n/i18n";
import { DISTRICT_SLUGS, getBadyet, getDistricts } from "@/lib/badyet";

export const metadata: Metadata = { title: "Badyet", description: "Budget ng DPWH sa dalawang distrito ng Oriental Mindoro: enacted na budget 2020-2026 at paghahambing ng NEP at House bill para sa 2027." };

const date = (s: string) => s.slice(0, 10);
const HEADS = ["finance.d1", "finance.d2"];

// /badyet#d2 (old single-page anchor) simply lands on this page, where both district cards are visible.
export default function Badyet() {
  const { meta } = getBadyet();
  const districts = getDistricts();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Crumbs items={[{ label: "finance.home", href: "/" }, { label: "nav.budget" }]} />
      <div className="mt-4"><Title eyebrow="finance.b.eyebrow" title="finance.b.title" /></div>
      <p className="mt-4 max-w-3xl text-black/75"><T k="finance.b.lead" /></p>
      <div className="mt-6"><SmartSearch scope="badyet" items={getSearchItems("badyet")} /></div>
      <NoSpendBanner />

      <div id="d1" className="mt-6 grid gap-5 md:grid-cols-2 md:gap-6">
        {districts.map((d, i) => <div key={d.id} id={i === 1 ? "d2" : undefined} className="scroll-mt-28 h-full"><DistrictCard d={d} slug={DISTRICT_SLUGS[i]} h={HEADS[i]} i={i} /></div>)}
      </div>

      <Link href="/badyet/redflags" className="group mt-8 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fdf0d5] text-[#7a4a00]"><FlagSvg className="h-6 w-6" /></span>
        <span className="min-w-0 flex-1"><span className="block font-serif text-xl font-bold text-fiesta-navy"><T k="rf.cta" /></span><span className="block text-sm text-black/70"><T k="rf.cta.p" /></span></span>
        <KitIcon name="arrow" className="h-5 w-5 shrink-0 text-fiesta-blue transition group-hover:translate-x-1" />
      </Link>

      <div className="mt-8"><Acc q="finance.notes.q"><BadyetNotes districts={districts} /></Acc></div>

      <SourceNote>
        <R k="finance.b.src" v={[date(meta.built_at)]} />
      </SourceNote>
      <div className="mt-3 flex flex-wrap gap-2">
        <SourceLink href="https://budget.bettergov.ph/docs" icon="database">BetterGov Budget API</SourceLink>
        <SourceLink href={meta.source_repo} icon="github">Source repo</SourceLink>
        <SourceLink href="https://budget.bettergov.ph/docs" icon="book"><T k="finance.l.docs" /></SourceLink>
        <SourceLink href="https://budget.bettergov.ph/docs#mcp" icon="compass"><T k="rf.l.mcp" /></SourceLink>
        <SourceLink href="https://lgu.bettergov.ph/BUDGET_GUIDE.html" icon="compass"><T k="finance.l.guide" /></SourceLink>
      </div>
    </main>
  );
}
