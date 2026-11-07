import { T } from "@/lib/i18n/i18n";
import { Bars, Stat, card } from "./GovProcBits";
import GovProcList from "./GovProcList";
import { abcTotal, countsByMonth, countsDesc, fmtMonth, funnel, phpShort, years } from "@/lib/gov-proc";
import { getCards, getDocs } from "@/lib/gov-proc-data";
import { getMunicipalities } from "@/lib/municipalities";
import Link from "next/link";

/** Procurement tab: totals, four charts, then the filterable list of project cards. Server component; only the list is client-side. */
export default function GovProcurement() {
  const cards = getCards(), docs = getDocs();
  const abc = abcTotal(cards);
  const read = docs.filter((d) => d.ocr).length;
  const towns = getMunicipalities();
  const name = (s: string) => towns.find((m) => m.slug === s)?.name ?? s;
  return (
    <div className="space-y-6">
      <p className={`${card} text-sm text-black/80`}><T k="govb.note" /> <Link href="/pamahalaan/mga-tala" className="font-semibold text-fiesta-blue underline underline-offset-2"><T k="govb.notes.link" /></Link></p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="road" label="govb.stat.projects" value={cards.length.toLocaleString("en-PH")} />
        <Stat icon="doc" label="govb.stat.docs" value={docs.length.toLocaleString("en-PH")} />
        <Stat icon="search" label="govb.stat.read" value={`${read.toLocaleString("en-PH")} / ${docs.length.toLocaleString("en-PH")}`} hint="govb.stat.readhint" />
        <Stat icon="budget" label="govb.stat.abc" value={abc.n ? phpShort(abc.total) : "–"} hint="govb.stat.abchint" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bars title="govb.chart.month" rows={countsByMonth(cards).map((m) => ({ key: m.key, label: fmtMonth(m.key), n: m.n }))} />
        <Bars title="govb.chart.funnel" rows={funnel(cards).map((f) => ({ key: f.stage, label: `govb.type.${f.stage}`, n: f.n }))} />
        <Bars title="govb.chart.town" rows={countsDesc(cards.map((c) => c.town)).map((t) => ({ key: t.key, label: name(t.key), n: t.n, href: `/proyekto?bayan=${t.key}` }))} />
        <Bars title="govb.chart.work" rows={countsDesc(cards.map((c) => c.work)).map((w) => ({ key: w.key, label: `govb.work.${w.key}`, n: w.n }))} />
      </div>
      <GovProcList cards={cards} towns={towns.map((m) => ({ v: m.slug, t: m.name }))} years={years(cards)} />
    </div>
  );
}
