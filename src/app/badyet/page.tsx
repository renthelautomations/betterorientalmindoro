import SmartSearch from "@/components/site/SmartSearch";
import { getSearchItems } from "@/lib/search-index";
import type { Metadata } from "next";
import { DistrictCard, BadyetNotes, NoSpendBanner } from "@/components/site/BadyetDistrict";
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
        {districts.map((d, i) => <div key={d.id} id={i === 1 ? "d2" : undefined} className="scroll-mt-28 h-full"><DistrictCard d={d} slug={DISTRICT_SLUGS[i]} h={HEADS[i]} /></div>)}
      </div>

      <div className="mt-8"><Acc q="finance.notes.q"><BadyetNotes districts={districts} /></Acc></div>

      <SourceNote>
        <R k="finance.b.src" v={[date(meta.built_at)]} />
      </SourceNote>
      <div className="mt-3 flex flex-wrap gap-2">
        <SourceLink href="https://budget.bettergov.ph/docs" icon="database">BetterGov Budget API</SourceLink>
        <SourceLink href={meta.source_repo} icon="github">Source repo</SourceLink>
        <SourceLink href="https://budget.bettergov.ph/docs" icon="book"><T k="finance.l.docs" /></SourceLink>
        <SourceLink href="https://lgu.bettergov.ph/BUDGET_GUIDE.html" icon="compass"><T k="finance.l.guide" /></SourceLink>
      </div>
    </main>
  );
}
