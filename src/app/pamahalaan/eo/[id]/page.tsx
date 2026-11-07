import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { T } from "@/lib/i18n/i18n";
import { getEo } from "@/lib/gov";
import { getEoDoc, getEoDocs } from "@/lib/gov-docs";
import { eoShort, flagsForDoc, resolveEoRef } from "@/lib/gov-doc-flags";
import { fmtDate } from "@/lib/gov-doc-format";
import GovDocPage, { type Related } from "@/components/site/GovDocPage";
import { TopicChip } from "@/components/site/GovDocBits";
import { TOPIC_LOOK } from "@/components/site/govDocLook";

export function generateStaticParams() {
  return getEo().items.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/pamahalaan/eo/[id]">): Promise<Metadata> {
  const { id } = await params;
  const e = getEo().items.find((x) => x.id === id);
  return e ? { title: eoShort(e), description: e.title ?? e.label } : {};
}

export default async function EoPage({ params }: PageProps<"/pamahalaan/eo/[id]">) {
  const { id } = await params;
  const eos = getEo().items;
  const e = eos.find((x) => x.id === id);
  if (!e) notFound();
  const d = getEoDoc(id);
  const look = TOPIC_LOOK[d?.topic ?? "other"];
  const key = (x: typeof e) => (x.year ?? 0) * 100000 + (x.number ?? 0) * 10 + (x.suffix ? x.suffix.charCodeAt(0) - 64 : 0);
  const sorted = [...eos].sort((a, b) => key(a) - key(b));
  const i = sorted.findIndex((x) => x.id === id);
  const nav = (x?: typeof e) => (x ? { href: `/pamahalaan/eo/${x.id}`, label: eoShort(x) } : null);
  const ref = (label: string) => { const rid = resolveEoRef(label, eos); return { label: rid ? eoShort(eos.find((x) => x.id === rid)!) : label, href: rid ? `/pamahalaan/eo/${rid}` : null }; };
  const by = (field: "amends" | "repeals") => getEoDocs().filter((o) => o.id !== id && o[field].some((l) => resolveEoRef(l, eos) === id)).map((o) => ({ label: eoShort(eos.find((x) => x.id === o.id) ?? { number: o.number, suffix: null, year: o.year, label: o.id }), href: `/pamahalaan/eo/${o.id}` }));
  const related: Related[] = [
    { heading: "gova.rel.amends", items: (d?.amends ?? []).map(ref) },
    { heading: "gova.rel.repeals", items: (d?.repeals ?? []).map(ref) },
    { heading: "gova.rel.amendedBy", items: by("amends") },
    { heading: "gova.rel.repealedBy", items: by("repeals") },
  ];
  return (
    <GovDocPage
      crumbs={[{ label: "dyn.home", href: "/" }, { label: "nav.gov", href: "/pamahalaan" }, { label: eoShort(e) }]}
      band={{ color: look.color, icon: look.icon, eyebrow: <T k="gova.eo.one" />, heading: eoShort(e), side: <>{d && <span className="mr-3"><TopicChip topic={d.topic} /></span>}<T k="gova.signed" />: {fmtDate(d?.signedDate ?? null)}</> }}
      title={e.title ?? e.label}
      summary={d ? { en: d.summary, fil: d.summaryFil } : null}
      points={d?.keyPoints}
      related={related}
      pdf={e.url}
      evidence={d?.evidence} pageCount={d?.pageCount} confidence={d?.confidence}
      prev={nav(sorted[i - 1])} next={nav(sorted[i + 1])}
      flags={flagsForDoc(id)}
    />
  );
}
