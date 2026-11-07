import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { TF,  } from "@/components/site/DynBits";
import { posKey } from "@/components/site/dynKeys";
import { surnameHolders, titleCase, type ProvinceSurnameRow, type SurnameRow, type Town } from "@/lib/dynasties";

const sid = (s: string) => `s-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

function Chip({ r }: { r: SurnameRow | ProvinceSurnameRow }) {
  return (
    <Link href={`#${sid(r.surname)}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/20 bg-white px-4 text-sm hover:border-fiesta-navy">
      <span className="font-semibold text-fiesta-navy">{titleCase(r.surname)}</span>
      <span className="text-black/70"><TF k="dyn.chip" v={[r.people, r.seats]} /></span>
    </Link>
  );
}

/** Repeated surname (2+ different people) chips, max 5 then see-all. Each chip opens that surname's wins below (CSS :target, no JS). Surname match only. */
export default function DynSurnames({ rows, towns, names }: { rows: (SurnameRow | ProvinceSurnameRow)[]; towns: Town[]; names: Record<string, string> }) {
  if (!rows.length) return <p className="text-sm text-black/70"><T k="dyn.sur.none" /></p>;
  return (
    <div>
      <ul className="flex flex-wrap gap-2">{rows.slice(0, 5).map((r) => <li key={r.surname}><Chip r={r} /></li>)}</ul>
      {rows.length > 5 && (
        <details className="mt-3 text-sm">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-fiesta-blue underline"><TF k="dyn.sur.more" v={[rows.length - 5]} /></summary>
          <ul className="mt-2 flex flex-wrap gap-2">{rows.slice(5).map((r) => <li key={r.surname}><Chip r={r} /></li>)}</ul>
        </details>
      )}
      {rows.map((r) => (
        <section key={r.surname} id={sid(r.surname)} aria-labelledby={`${sid(r.surname)}-h`} className="mt-4 hidden scroll-mt-28 rounded-2xl border border-fiesta-navy/30 bg-fiesta-cream p-4 target:block">
          <h3 id={`${sid(r.surname)}-h`} className="font-serif text-lg font-bold"><span className="sr-only"><T k="dyn.sur.winsof" /> </span>{titleCase(r.surname)}</h3>
          <p className="text-xs text-black/70"><T k="dyn.sur.note" /></p>
          <ul className="mt-2 divide-y divide-black/10 text-sm">
            {surnameHolders(towns, r.surname).map((h) => (
              <li key={`${h.town}-${h.year}-${h.position}-${h.id}`} className="py-1.5">
                <span className="tabular-nums font-semibold">{h.year}</span> · {titleCase(h.name)} · <T k={posKey(h.position)} />, <Link className="text-fiesta-blue underline" href={`/dynasties/${h.town}`}>{names[h.town] ?? h.town}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
