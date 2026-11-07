import Link from "next/link";
import { surnameOf, titleCase, winnersGrid, type Contest } from "@/lib/dynasties";

export type GridTown = { slug: string; name: string; contests: Contest[] };
export const seatId = (position: string, year: number) => `${position.toLowerCase().replace(" ", "-")}-${year}`;

/** Year-by-seat winners. Real table: row headers are seat (and town), column headers are years; each cell links to the town view anchor. A dash means no record. */
export function WinnersGrid({ towns, years, caption }: { towns: GridTown[]; years: number[]; caption: string }) {
  return (
    <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-black/15 text-xs text-black/70">
            <th scope="col" className="sticky left-0 bg-white px-3 py-2 font-semibold">Bayan at puwesto</th>
            {years.map((y) => <th key={y} scope="col" className="px-2 py-2 font-semibold tabular-nums">{y}</th>)}
          </tr>
        </thead>
        <tbody>
          {towns.flatMap((t) => winnersGrid(t.contests, years).rows.map((r) => (
            <tr key={t.slug + r.position} className="border-b border-black/10 align-top last:border-0">
              <th scope="row" className="sticky left-0 bg-white px-3 py-2 font-medium"><span className="block">{t.name}</span><span className="text-xs font-normal text-black/70">{r.label}</span></th>
              {r.cells.map((c) => (
                <td key={c.year} className="px-2 py-2">
                  {c.winners.length === 0 ? <span aria-label={`${r.label} ${c.year}: walang datos`}>-</span> : (
                    <Link href={`/dynasties/${t.slug}#${seatId(r.position, c.year)}`} aria-label={`${r.label} ${c.year}, ${t.name}: ${c.winners.map((w) => titleCase(w.name)).join(", ")}`}
                      className="font-medium text-fiesta-blue underline decoration-black/20 underline-offset-2">
                      {surnameOf(c.winners[0].ballot) ? titleCase(surnameOf(c.winners[0].ballot)) : titleCase(c.winners[0].name)}
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          )))}
        </tbody>
      </table>
    </div>
  );
}
