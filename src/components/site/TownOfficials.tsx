import Link from "next/link";
import { FIESTA_DEEP } from "@/components/kit/Patterns";
import { T } from "@/lib/i18n/i18n";
import { townOfficials } from "@/lib/officials";
import { getMunicipality } from "@/lib/municipalities";
import { getProjects } from "@/lib/projects";
import { fmtPeso } from "@/lib/stats";
import { TF } from "./DynBits";
import { getCommittees } from "@/lib/committees";
import { Avatar } from "./OfficialCards";
import { FIESTA } from "@/components/kit/Patterns";
import { EmptyState } from "@/components/kit/Ui";
import { Group, Lead, OfficialsSource, Person } from "./OfficialCards";

/** Town tab: mayor and vice mayor as lead cards, councilors as a grid, honest notes on what the source lacks. */
export default function TownOfficials({ slug, isCity }: { slug: string; isCity: boolean }) {
  const lead = [...townOfficials(slug, "mayor"), ...townOfficials(slug, "vice-mayor")];
  const council = townOfficials(slug, "councilor");
  if (!lead.length && !council.length) return <EmptyState title="off.none"><OfficialsSource /></EmptyState>;
  const town = getMunicipality(slug)?.name ?? slug;
  const since = getProjects(slug).filter((p) => p.start && p.start >= "2025-06-30");
  return (
    <div className="space-y-8">
      <ul className="grid gap-4 sm:grid-cols-2">{lead.map((o) => <Lead key={o.id} o={o} />)}</ul>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold tracking-widest text-fiesta-blue uppercase"><T k="off.proj" /></p>
        <p className="mt-1 font-semibold text-fiesta-navy">{since.length ? <TF k="off.proj.n" v={[since.length, town, fmtPeso(since.reduce((a, p) => a + (p.cost ?? 0), 0))]} /> : <T k="off.proj.none" />}</p>
        <p className="mt-1 text-sm text-black/70"><T k="off.proj.note" /></p>
      </div>
      {council.length > 0 && (
        <Group id="of-council" title={isCity ? "off.council.city" : "off.council.h"}>
          <ul className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">{council.map((o) => <Person key={o.id} o={o} tone={FIESTA_DEEP.sky} max={Math.max(...council.map((x) => x.votes ?? 0), 1)} />)}</ul>
          {slug === "calapan-city" && <p className="mt-3 text-sm text-black/70"><T k="off.calapan" /></p>}
        </Group>
      )}
      {getCommittees(slug) && (() => { const c = getCommittees(slug)!; return (
        <Group id="of-committees" title="off.comm.h">
          <p className="mt-1 text-sm text-black/70"><T k="off.comm.p" /></p>
          <ul className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.members.map((m) => (
              <li key={m.name} className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-3"><Avatar name={m.name} color={FIESTA.navy} className="h-10 w-10 text-sm" /><p className="font-serif text-base font-bold leading-tight text-fiesta-navy">{m.name}</p></div>
                <ul className="mt-3 flex flex-wrap gap-1.5">{m.committees.map((x) => <li key={x} className="rounded-full bg-fiesta-mint px-2.5 py-1 text-xs font-medium text-fiesta-navy">{x}</li>)}</ul>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-black/65"><a href={c.source.split(" ")[0]} rel="noopener" className="font-semibold text-fiesta-blue underline underline-offset-2"><T k="common.source" /></a> · <T k="off.comm.src" /> {c.fetchedAt}</p>
        </Group>
      ); })()}
      <div className="rounded-2xl bg-fiesta-mint p-5"><p className="font-semibold text-fiesta-navy"><T k="off.brgy.h" /></p><p className="mt-1 text-sm text-black/75"><T k="off.brgy.p" /></p></div>
      <div className="space-y-2"><Link href="/mga-opisyal" className="inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2"><T k="off.all" /> →</Link><OfficialsSource /></div>
    </div>
  );
}
