import type { Metadata } from "next";
import { Tabs } from "@/components/kit/Interactive";
import { TBreadcrumbs, TPageTitle } from "@/components/site/DynBits";
import { T } from "@/lib/i18n/i18n";
import GovOfficials from "@/components/site/GovOfficials";
import GovEo from "@/components/site/GovEo";
import GovProcurement from "@/components/site/GovProcurement";
import GovReports from "@/components/site/GovReports";
import GovCareers from "@/components/site/GovCareers";
import GovInvestment from "@/components/site/GovInvestment";

export const metadata: Metadata = { title: "Pamahalaan", description: "Mga opisyal, opisina, executive order, bidding, ulat pinansyal, trabaho at pamumuhunan ng Pamahalaang Panlalawigan ng Oriental Mindoro, may link sa opisyal na pinagmulan." };

export default function Pamahalaan() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TBreadcrumbs items={[{ label: "dyn.home", href: "/" }, { label: "nav.gov" }]} />
      <div className="mt-4"><TPageTitle eyebrow="gov.eyebrow" title="gov.title" /></div>
      <p className="mt-4 max-w-3xl text-black/75"><T k="gov.lead" /></p>
      <p className="mt-2 max-w-3xl text-sm text-black/65"><T k="gov.note" /></p>
      <div className="mt-8">
        <Tabs tabs={[
          { id: "opisyal", label: "gov.tab.officials", panel: <GovOfficials /> },
          { id: "eo", label: "gov.tab.eo", panel: <GovEo /> },
          { id: "bidding", label: "gov.tab.bids", panel: <GovProcurement /> },
          { id: "ulat", label: "gov.tab.reports", panel: <GovReports /> },
          { id: "trabaho", label: "gov.tab.jobs", panel: <GovCareers /> },
          { id: "mamuhunan", label: "gov.tab.invest", panel: <GovInvestment /> },
        ]} />
      </div>
    </main>
  );
}
