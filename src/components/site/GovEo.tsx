"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { T, useLang, useT } from "@/lib/i18n/i18n";
import { eoYears, getEo } from "@/lib/gov";
import { getEoDocs, type EoDoc } from "@/lib/gov-docs";
import { eoShort } from "@/lib/gov-doc-flags";
import { filterEos, pageCount, pageSlice, topicCounts } from "@/lib/gov-doc-view";
import Dropdown from "./Dropdown";
import { Badge, BarList, Pills, SearchPill, StatePager, SummaryNote, TopicChip } from "./GovDocBits";
import { CARD, TOPICS, TOPIC_LOOK } from "./govDocLook";

const snip = (s: string) => (s.length > 190 ? s.slice(0, 187).trimEnd() + "..." : s);
const shortRef = (l: string) => l.replace(/Executive Order/i, "EO").replace(/,?\s*Series of/i, ", s.");

/** Executive orders: search, year and topic filters, 10 per page, and two small charts. Works with no summaries (topic filter and chart appear once some exist). */
export default function GovEo() {
  const t = useT();
  const fil = useLang() === "fil";
  const items = getEo().items;
  const docs = useMemo(() => new Map<string, EoDoc>(getEoDocs().map((d) => [d.id, d])), []);
  const [q, setQ] = useState(""); const [year, setYear] = useState(""); const [topic, setTopic] = useState(""); const [page, setPage] = useState(1);
  const years = eoYears(items);
  const rows = filterEos(items, docs, { q, year, topic });
  const last = pageCount(rows.length);
  const cur = Math.min(page, last);
  const topics = topicCounts(items, docs);
  const set = <V,>(f: (v: V) => void) => (v: V) => { f(v); setPage(1); };
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="eo-yr" className={`${CARD} p-5`}>
          <h2 id="eo-yr" className="font-serif text-lg font-bold text-fiesta-navy"><T k="gova.eo.perYear" /></h2>
          <div className="mt-3"><BarList aria={t("gova.eo.perYear")} rows={years.map((y) => ({ key: String(y.year), label: String(y.year), value: y.n, text: String(y.n), color: "#2b4fa3" }))} /></div>
        </section>
        <section aria-labelledby="eo-tp" className={`${CARD} p-5`}>
          <h2 id="eo-tp" className="font-serif text-lg font-bold text-fiesta-navy"><T k="gova.eo.perTopic" /></h2>
          <div className="mt-3">{topics.length ? <BarList aria={t("gova.eo.perTopic")} rows={topics.map((x) => ({ key: x.k, label: t(`gova.topic.${x.k}`), value: x.n, text: String(x.n), color: TOPIC_LOOK[x.k].color }))} /> : <SummaryNote />}</div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-60 flex-1"><SearchPill value={q} onChange={set(setQ)} label={t("gova.eo.search")} /></div>
        {topics.length > 0 && <Dropdown ariaLabel={t("gova.eo.topic")} className="w-56" value={topic} onChange={set(setTopic)} options={[{ v: "", t: t("gova.eo.allTopics") }, ...TOPICS.filter((x) => topics.some((c) => c.k === x)).map((x) => ({ v: x, t: t(`gova.topic.${x}`) }))]} />}
      </div>
      <Pills label={t("gova.eo.year")} value={year} onChange={set(setYear)} options={[{ v: "", t: t("gova.all") }, ...years.map((y) => ({ v: String(y.year), t: String(y.year) }))]} />
      <p role="status" className="text-sm text-black/70">{rows.length.toLocaleString("en-PH")} <T k="gova.eo.count" /></p>

      {rows.length === 0 ? <p className={`${CARD} p-6 text-sm text-black/70`}><T k="gova.eo.none" /></p> : (
        <ul className="grid gap-4">
          {pageSlice(rows, cur).map((e) => {
            const d = docs.get(e.id);
            const look = TOPIC_LOOK[d?.topic ?? "other"];
            return (
              <li key={e.id} className={`${CARD} relative flex gap-4 p-5 hover:shadow-md`}>
                <Badge icon={look.icon} color={look.color} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold tracking-widest text-black/65 uppercase">{eoShort(e)}</p>
                  <h3 className="mt-0.5 font-serif text-lg font-bold leading-snug text-fiesta-navy">
                    <Link href={`/pamahalaan/eo/${e.id}`} className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-fiesta-blue">{e.title ?? e.label}</Link>
                  </h3>
                  {d ? <p className="mt-2 text-sm text-black/75">{snip(fil ? d.summaryFil : d.summary)}</p> : <p className="mt-2 text-sm text-black/65"><T k="gova.summary.coming" /></p>}
                  {d && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <TopicChip topic={d.topic} />
                      {d.amends.map((l) => <span key={`a${l}`} className="inline-flex items-center rounded-full bg-fiesta-navy/5 px-2.5 py-1 text-xs font-semibold text-fiesta-navy"><T k="gova.chip.amends" />&nbsp;{shortRef(l)}</span>)}
                      {d.repeals.map((l) => <span key={`r${l}`} className="inline-flex items-center rounded-full bg-fiesta-navy/5 px-2.5 py-1 text-xs font-semibold text-fiesta-navy"><T k="gova.chip.repeals" />&nbsp;{shortRef(l)}</span>)}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <StatePager page={cur} last={last} onPage={(p) => { setPage(p); }} />
    </div>
  );
}
