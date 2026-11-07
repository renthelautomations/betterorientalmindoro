import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { TF,  } from "@/components/site/DynBits";
import { posKey } from "@/components/site/dynKeys";
import { surnameHolders, titleCase, type ProvinceSurnameRow, type SurnameRow, type Town } from "@/lib/dynasties";

type Row = SurnameRow | ProvinceSurnameRow;

const POS_DOT: Record<string, string> = { MAYOR: "bg-fiesta-navy", "VICE MAYOR": "bg-fiesta-orange", COUNCILOR: "bg-fiesta-blue" };

function Item({ r, max, towns, names }: { r: Row; max: number; towns: Town[]; names: Record<string, string> }) {
  const holders = surnameHolders(towns, r.surname);
  const byPos = (["MAYOR", "VICE MAYOR", "COUNCILOR"] as const).map((p) => [p, holders.filter((h) => h.position === p).length] as const).filter(([, n]) => n);
  return (
    <details className="group rounded-2xl bg-white shadow-sm ring-1 ring-black/5 open:shadow-md">
      <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 hover:bg-fiesta-cream/60 [&::-webkit-details-marker]:hidden rounded-2xl">
        <span className="flex items-center justify-between gap-3">
          <span className="font-serif text-xl font-bold text-fiesta-navy">{titleCase(r.surname)}</span>
          <span className="shrink-0 rounded-full bg-fiesta-orange/15 px-3 py-1 text-sm font-bold text-[#8a3a18]"><TF k="dyn.sur.wins" v={[r.seats]} /></span>
        </span>
        <span className="h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-orange" style={{ width: `${Math.max((r.seats / max) * 100, 6)}%` }} /></span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/70">
          <span className="font-semibold text-fiesta-navy"><TF k="dyn.sur.people" v={[r.people]} /></span>
          {byPos.map(([p, n]) => <span key={p} className="inline-flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${POS_DOT[p]}`} aria-hidden /><T k={posKey(p)} /> ×{n}</span>)}
          <svg viewBox="0 0 24 24" className="ml-auto h-4 w-4 shrink-0 text-fiesta-blue transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </summary>
      <div className="border-t border-black/10 px-4 pb-4 pt-3">
        <p className="text-xs text-black/65"><T k="dyn.sur.note" /></p>
        <ul className="mt-2 divide-y divide-black/10 text-sm">
          {holders.map((h) => (
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

/** Repeated surnames (2+ different people) as cards: wins, people, seats held; each opens in place to list its wins. Surname match only. No JS. */
export default function DynSurnames({ rows, towns, names }: { rows: Row[]; towns: Town[]; names: Record<string, string> }) {
  if (!rows.length) return <p className="text-sm text-black/70"><T k="dyn.sur.none" /></p>;
  const max = Math.max(...rows.map((r) => r.seats));
  return (
    <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => <Item key={r.surname} r={r} max={max} towns={towns} names={names} />)}
    </div>
  );
}
