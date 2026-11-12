"use client";
import { useMemo, useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { FIESTA, PatternFill } from "@/components/kit/Patterns";
import type { Law } from "@/lib/laws";
import TownEmblem from "@/components/kit/TownEmblem";
import Dropdown from "./Dropdown";

const TONE: Record<string, string> = { "Republic Act": FIESTA.blue, Proclamation: FIESTA.orange, "Executive Order": FIESTA.green, "Presidential Decree": FIESTA.red, "Batas Pambansa": FIESTA.navy, "Commonwealth Act": FIESTA.yellow };
const label = "mb-1 block text-xs font-semibold uppercase tracking-widest text-black/60";

export default function LawList({ laws, towns }: { laws: Law[]; towns: { slug: string; name: string }[] }) {
  const t = useT();
  const [q, setQ] = useState(""), [town, setTown] = useState(""), [kind, setKind] = useState("");
  const kinds = useMemo(() => [...new Set(laws.map((l) => l.kind))], [laws]);
  const name = useMemo(() => new Map(towns.map((x) => [x.slug, x.name])), [towns]);
  const rows = useMemo(() => {
    const w = q.toLowerCase().split(/\s+/).filter(Boolean);
    return laws.filter((l) => (!town || (town === "_prov" ? !l.town : l.town === town)) && (!kind || l.kind === kind) && w.every((x) => `${l.ref} ${l.title} ${l.year}`.toLowerCase().includes(x)));
  }, [laws, q, town, kind]);
  return (
    <div>
      <div className="grid gap-4 rounded-3xl bg-fiesta-mint p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label htmlFor="law-q" className={label}><T k="law.search" /></label>
          <div className="relative">
            <KitIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fiesta-navy/60" />
            <input id="law-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} className="min-h-12 w-full rounded-2xl border-2 border-transparent bg-white pl-12 pr-4 text-base text-fiesta-navy shadow-sm outline-none transition focus:border-fiesta-blue" />
          </div>
        </div>
        <div className="min-w-0"><span id="law-town" className={label}><T k="law.town" /></span>
          <Dropdown ariaLabel={t("law.town")} value={town} onChange={setTown} options={[{ v: "", t: t("law.town.all") }, { v: "_prov", t: t("law.prov") }, ...towns.map((x) => ({ v: x.slug, t: x.name }))]} /></div>
        <div className="min-w-0"><span id="law-kind" className={label}><T k="law.kind" /></span>
          <Dropdown ariaLabel={t("law.kind")} value={kind} onChange={setKind} options={[{ v: "", t: t("law.kind.all") }, ...kinds.map((k) => ({ v: k, t: k }))]} /></div>
      </div>
      <p className="mt-4 text-sm font-semibold text-black/70" aria-live="polite">{rows.length} <T k="law.of" /> {laws.length} <T k="law.count" /></p>
      {rows.length ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {rows.map((l) => {
            const c = TONE[l.kind] ?? FIESTA.navy;
            return (
              <li key={l.id} className="group relative isolate flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative flex items-center justify-between gap-3 px-5 py-3" style={{ background: c }}>
                  <PatternFill variant="wave" colors={["#fff"]} opacity={0.16} />
                  <span className="relative text-sm font-bold tracking-wide" style={{ color: c === FIESTA.yellow ? FIESTA.navy : "#fff" }}>{l.ref}</span>
                  <span className="relative font-serif text-xl font-bold tabular-nums" style={{ color: c === FIESTA.yellow ? FIESTA.navy : "#fff" }}>{l.year}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {l.town && <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-fiesta-mint py-1 pl-1 pr-3 text-xs font-semibold text-fiesta-navy"><TownEmblem slug={l.town} name={name.get(l.town) ?? l.town} className="h-6 w-6 rounded-full" />{name.get(l.town)}</p>}
                  <p className="flex-1 font-serif text-lg font-semibold leading-snug text-fiesta-navy">{l.title}</p>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white transition group-hover:bg-fiesta-blue"><T k="law.open" /> ↗</a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : <p className="mt-4 rounded-2xl bg-white p-5 text-black/75 shadow-sm ring-1 ring-black/5"><T k="law.none" /></p>}
    </div>
  );
}
