import type { Metadata } from "next";
import { T } from "@/lib/i18n/i18n";
import { TBreadcrumbs, TPageTitle } from "@/components/site/DynBits";
import GovProcNotes from "@/components/site/GovProcNotes";
import { getAllFlags, getCards } from "@/lib/gov-proc-data";

export const metadata: Metadata = { title: "Notes to review | Mga tala na susuriin", description: "Automatic checks of the provincial procurement documents: what is checked, how, and what is worth a second look. Patterns to look at, not proof of anything." };

export default function MgaTala() {
  const titles = Object.fromEntries(getCards().map((c) => [c.refNo, c.title]));
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TBreadcrumbs items={[{ label: "dyn.home", href: "/" }, { label: "nav.gov", href: "/pamahalaan" }, { label: "govb.notes.title" }]} />
      <div className="mt-4"><TPageTitle eyebrow="govb.notes.eyebrow" title="govb.notes.title" /></div>
      <p className="mt-4 max-w-3xl text-black/75"><T k="govb.notes.lead" /></p>
      <div className="mt-8"><GovProcNotes flags={getAllFlags()} titles={titles} /></div>
    </main>
  );
}
