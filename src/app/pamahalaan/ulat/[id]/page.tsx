import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { T } from "@/lib/i18n/i18n";
import { getReports } from "@/lib/gov";
import { getReportDoc } from "@/lib/gov-docs";
import { flagsForDoc } from "@/lib/gov-doc-flags";
import { fmtPeso, sortByDateDesc } from "@/lib/gov-doc-view";
import { fmtDate } from "@/lib/gov-doc-format";
import GovDocPage from "@/components/site/GovDocPage";
import { KindChip } from "@/components/site/GovDocBits";
import { CARD, KIND_LOOK } from "@/components/site/govDocLook";

export function generateStaticParams() {
  return getReports().items.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: PageProps<"/pamahalaan/ulat/[id]">): Promise<Metadata> {
  const { id } = await params;
  const r = getReports().items.find((x) => x.id === id);
  return r ? { title: r.title.slice(0, 70), description: r.title } : {};
}

export default async function ReportPage({ params }: PageProps<"/pamahalaan/ulat/[id]">) {
  const { id } = await params;
  const all = sortByDateDesc(getReports().items);
  const i = all.findIndex((x) => x.id === id);
  if (i < 0) notFound();
  const r = all[i];
  const d = getReportDoc(id);
  const look = KIND_LOOK[r.kind];
  // newest first: "next" in time is the entry before it in the list
  const nav = (x?: typeof r) => (x ? { href: `/pamahalaan/ulat/${x.id}`, label: x.title } : null);
  const row = "text-xs font-semibold tracking-widest text-black/65 uppercase";
  return (
    <GovDocPage
      crumbs={[{ label: "dyn.home", href: "/" }, { label: "nav.gov", href: "/pamahalaan" }, { label: r.title }]}
      band={{ color: look.color, icon: look.icon, eyebrow: <T k={`gova.kind.${r.kind}`} />, heading: fmtDate(r.date), side: <T k="gova.posted" /> }}
      title={r.title}
      summary={d ? { en: d.summary, fil: d.summaryFil } : null}
      pdf={r.url}
      evidence={d?.evidence} pageCount={d?.pageCount} confidence={d?.confidence}
      prev={nav(all[i + 1])} next={nav(all[i - 1])}
      flags={flagsForDoc(id)}
    >
      {d && (
        <section aria-labelledby="doc-facts" className={`${CARD} p-6`}>
          <h2 id="doc-facts" className="font-serif text-xl font-bold text-fiesta-navy"><T k="gova.facts.h" /></h2>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-fiesta-cream p-4">
              <dt className={row}>{d.amountLabel ?? <T k="gova.amount" />}</dt>
              <dd className="mt-1 font-serif text-2xl font-bold text-fiesta-navy tabular-nums">{fmtPeso(d.totalAmount)}</dd>
              <dd className="mt-1 text-xs text-black/65"><T k={d.totalAmount == null ? "gova.amount.unknown" : "gova.amount.printed"} /></dd>
            </div>
            <div className="rounded-xl bg-fiesta-cream p-4">
              <dt className={row}><T k="gova.period" /></dt><dd className="mt-1 font-semibold text-fiesta-navy">{d.period ?? "-"}</dd>
              <dt className={`${row} mt-3`}><T k="gova.fund" /></dt><dd className="mt-1 font-semibold text-fiesta-navy">{d.fundSource ?? "-"}</dd>
            </div>
          </dl>
          {d.purposes.length > 0 && (<><h3 className="mt-5 font-bold text-fiesta-navy"><T k="gova.purposes" /></h3><ul className="mt-1 list-disc space-y-1 pl-5 text-black/80">{d.purposes.map((p) => <li key={p}>{p}</li>)}</ul></>)}
          <p className="mt-4"><KindChip kind={r.kind} /></p>
        </section>
      )}
    </GovDocPage>
  );
}
