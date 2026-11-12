import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { townOfficials } from "@/lib/officials";
import { EmptyState } from "@/components/kit/Ui";
import { Group, Lead, OfficialsSource, Person } from "./OfficialCards";

/** Town tab: mayor and vice mayor as lead cards, councilors as a grid, honest notes on what the source lacks. */
export default function TownOfficials({ slug, isCity }: { slug: string; isCity: boolean }) {
  const lead = [...townOfficials(slug, "mayor"), ...townOfficials(slug, "vice-mayor")];
  const council = townOfficials(slug, "councilor");
  if (!lead.length && !council.length) return <EmptyState title="off.none"><OfficialsSource /></EmptyState>;
  return (
    <div className="space-y-8">
      <ul className="grid gap-4 sm:grid-cols-2">{lead.map((o) => <Lead key={o.id} o={o} />)}</ul>
      {council.length > 0 && (
        <Group id="of-council" title={isCity ? "off.council.city" : "off.council.h"}>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{council.map((o) => <Person key={o.id} o={o} />)}</ul>
          {slug === "calapan-city" && <p className="mt-3 text-sm text-black/70"><T k="off.calapan" /></p>}
        </Group>
      )}
      <div className="rounded-2xl bg-fiesta-mint p-5"><p className="font-semibold text-fiesta-navy"><T k="off.brgy.h" /></p><p className="mt-1 text-sm text-black/75"><T k="off.brgy.p" /></p></div>
      <div className="space-y-2"><Link href="/mga-opisyal" className="inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2"><T k="off.all" /> →</Link><OfficialsSource /></div>
    </div>
  );
}
