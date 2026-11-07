import type { Metadata } from "next";
import { DistrictCard, BadyetNotes, NO_SPEND } from "@/components/site/BadyetDistrict";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import { Accordion, Breadcrumbs } from "@/components/kit/Ui";
import PageTitle from "@/components/site/PageTitle";
import { DISTRICT_SLUGS, getBadyet, getDistricts } from "@/lib/badyet";

export const metadata: Metadata = { title: "Badyet", description: "Budget ng DPWH sa dalawang distrito ng Oriental Mindoro: enacted na budget 2020-2026 at paghahambing ng NEP at House bill para sa 2027." };

const date = (s: string) => s.slice(0, 10);
const HEADS = ["Unang distrito", "Ikalawang distrito"];

// /badyet#d2 (old single-page anchor) simply lands on this page, where both district cards are visible.
export default function Badyet() {
  const { meta } = getBadyet();
  const districts = getDistricts();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Badyet" }]} />
      <div className="mt-4"><PageTitle eyebrow="BADYET" title="Badyet ng Oriental Mindoro" /></div>
      <p className="mt-4 max-w-2xl text-black/75">
        Ang halaga ng DPWH district engineering office sa bawat distrito ng kongreso: ang enacted na budget mula 2020 hanggang 2026, at ang dalawang bersyon ng 2027 budget. Mga kabuuang halaga lang ito, wala pang listahan ng proyekto.
      </p>
      <p className="mt-3 font-semibold">{NO_SPEND}</p>

      <div id="d1" className="mt-8 grid gap-5 md:grid-cols-2">
        {districts.map((d, i) => <div key={d.id} id={i === 1 ? "d2" : undefined} className="scroll-mt-28"><DistrictCard d={d} slug={DISTRICT_SLUGS[i]} h={HEADS[i].toLowerCase()} /></div>)}
      </div>

      <div className="mt-8"><Accordion items={[{ q: "Mga paalala at paliwanag", a: <BadyetNotes districts={districts} /> }]} /></div>

      <SourceNote>
        Data mula sa BetterGov Budget API, kinuha noong {date(meta.built_at)}. Hindi nakasaad ang lisensya sa API response. Portrait at pangalan ng kinatawan: House of Representatives of the Philippines. Malaya at hindi opisyal ang pahinang ito (independent and unofficial); hindi ito ang talaan ng budget department.
      </SourceNote>
      <div className="mt-3 flex flex-wrap gap-2">
        <SourceLink href="https://budget.bettergov.ph/docs" icon="database">BetterGov Budget API</SourceLink>
        <SourceLink href={meta.source_repo} icon="github">Source repo</SourceLink>
        <SourceLink href="https://budget.bettergov.ph/docs" icon="book">Dokumentasyon</SourceLink>
        <SourceLink href="https://lgu.bettergov.ph/BUDGET_GUIDE.html" icon="compass">Gabay</SourceLink>
      </div>
    </main>
  );
}
