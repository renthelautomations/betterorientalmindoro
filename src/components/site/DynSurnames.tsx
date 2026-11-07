import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { TF,  } from "@/components/site/DynBits";
import { posKey } from "@/components/site/dynKeys";
import { surnameHolders, titleCase, type ProvinceSurnameRow, type SurnameRow, type Town } from "@/lib/dynasties";

type Row = SurnameRow | ProvinceSurnameRow;

function Item({ r, max, towns, names }: { r: Row; max: number; towns: Town[]; names: Record<string, string> }) {
  return (
    <details className="group">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-4 py-2.5 hover:bg-fiesta-cream [&::-webkit-details-marker]:hidden">
        <span className="w-28 shrink-0 font-serif text-lg font-bold text-fiesta-navy sm:w-36">{titleCase(r.surname)}</span>
        <span className="h-2.5 min-w-8 flex-1 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-orange" style={{ width: `${(r.seats / max) * 100}%` }} /></span>
        <span className="shrink-0 text-right text-xs leading-tight text-black/70"><b className="block text-sm text-fiesta-navy"><TF k="dyn.sur.wins" v={[r.seats]} /></b><TF k="dyn.sur.people" v={[r.people]} /></span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-fiesta-blue transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      </summary>
      <div className="bg-fiesta-cream px-4 pb-4 pt-2">
        <p className="text-xs text-black/65"><T k="dyn.sur.note" /></p>
        <ul className="mt-2 divide-y divide-black/10 text-sm">
          {surnameHolders(towns, r.surname).map((h) => (
            <li key={`${h.town}-${h.year}-${h.position}-${h.id}`} className="flex flex-wrap items-baseline gap-x-3 py-1.5">
              <span className="w-10 font-semibold tabular-nums">{h.year}</span>
              <span className="font-medium">{titleCase(h.name)}</span>
              <span className="text-black/65"><T k={posKey(h.position)} /> · <Link className="text-fiesta-blue underline" href={`/dynasties/${h.town}`}>{names[h.town] ?? h.town}</Link></span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/** Repeated surnames (2+ different people): ranked bars, each expands in place to list its wins. Surname match only. No JS. */
export default function DynSurnames({ rows, towns, names }: { rows: Row[]; towns: Town[]; names: Record<string, string> }) {
  if (!rows.length) return <p className="text-sm text-black/70"><T k="dyn.sur.none" /></p>;
  const max = Math.max(...rows.map((r) => r.seats));
  return (
    <div className="divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      {rows.map((r) => <Item key={r.surname} r={r} max={max} towns={towns} names={names} />)}
    </div>
  );
}
