import { getOfficials, type Official } from "@/lib/gov";
import { T } from "@/lib/i18n/i18n";
import { Avatar } from "./OfficialCards";
import { PatternFill, FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import GovOfficeList from "./GovOfficeList";
import GovCrossCheck from "./GovCrossCheck";

/** Person card: name and position exactly as published. No photo, no party. */
const Person = ({ o }: { o: Official }) => (
  <li className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
    <Avatar name={o.name ?? ""} className="h-12 w-12 text-base" />
    <div className="min-w-0"><p className="font-semibold leading-snug text-fiesta-navy">{o.name}</p><p className="mt-1 inline-flex rounded-full bg-fiesta-mint px-2.5 py-0.5 text-xs font-semibold text-fiesta-navy">{o.position}</p></div>
  </li>
);

const Lead = ({ o, tone }: { o: Official; tone: string }) => (
  <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
    <div className="relative isolate h-20" style={{ background: tone }}><PatternFill variant="wave" colors={["#fff"]} opacity={0.18} /></div>
    <div className="-mt-7 px-5 pb-5"><Avatar name={o.name ?? ""} color={tone} className="h-14 w-14 border-4 border-white text-lg" />
      <p className="mt-2 font-serif text-2xl font-bold leading-snug text-fiesta-navy">{o.name}</p><p className="mt-1 text-sm font-semibold tracking-wide text-black/70">{o.position}</p></div>
  </li>
);

/** Officials tab: executive, SP members and sectoral reps as cards; offices and heads as a searchable list; then the figures cross-check. */
export default function GovOfficials() {
  const ds = getOfficials();
  const by = (...k: Official["kind"][]) => ds.items.filter((o) => k.includes(o.kind));
  const gov = by("governor"), vice = by("vice-governor"), sp = [...by("board-member"), ...by("sp-secretary")], sect = by("sectoral");
  return (
    <div className="space-y-10">
      <p className="max-w-3xl text-sm text-black/70"><T k="govc.of.lead" /></p>
      <section aria-labelledby="gv-exec">
        <h2 id="gv-exec" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="govc.of.exec" /></h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {gov.map((o) => <Lead key={o.id} o={o} tone={FIESTA.blue} />)}
          {vice.map((o) => <Lead key={o.id} o={o} tone={FIESTA_DEEP.green} />)}
        </ul>
      </section>
      <section aria-labelledby="gv-sp">
        <h2 id="gv-sp" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="govc.of.sp" /></h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sp.map((o) => <Person key={o.id} o={o} />)}</ul>
        {sect.length > 0 && <>
          <h3 className="mt-6 text-sm font-semibold tracking-widest text-black/65 uppercase"><T k="govc.of.sectoral" /></h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sect.map((o) => <Person key={o.id} o={o} />)}</ul>
        </>}
      </section>
      <section aria-labelledby="gv-off">
        <h2 id="gv-off" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="govc.of.offices" /></h2>
        <div className="mt-4"><GovOfficeList items={by("office", "department-head")} /></div>
        <p className="mt-3 text-xs text-black/65">
          <T k="govc.of.src" />: <a href="https://ormindoro.gov.ph/department-heads/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center underline">ormindoro.gov.ph/department-heads</a>{" · "}
          <a href="https://ormindoro.gov.ph/contact-us/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center underline">ormindoro.gov.ph/contact-us</a>
        </p>
      </section>
      <GovCrossCheck />
    </div>
  );
}
