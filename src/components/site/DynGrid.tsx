import Link from "next/link";
import { surnameOf, titleCase, winnersGrid, type Contest } from "@/lib/dynasties";

export type GridTown = { slug: string; name: string; contests: Contest[] };
export const seatId = (position: string, year: number) => `${position.toLowerCase().replace(" ", "-")}-${year}`;

const sn = (w: { ballot: string; name: string }) => titleCase(surnameOf(w.ballot) || w.name);

/** Year-by-seat winners. Row headers are town + seat, column headers are years. A tinted cell repeats the surname of the previous election for the same seat; a dash means no record. */
export function WinnersGrid({ towns, years, caption }: { towns: GridTown[]; years: number[]; caption: string }) {
  return (
    <div>
      <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-fiesta-navy text-xs text-white">
              <th scope="col" className="sticky left-0 z-10 bg-fiesta-navy px-4 py-3 font-semibold">Bayan at puwesto</th>
              {years.map((y) => <th key={y} scope="col" className="px-2 py-3 font-semibold tabular-nums">{y}</th>)}
            </tr>
          </thead>
          <tbody>
            {towns.map((t, ti) => winnersGrid(t.contests, years).rows.map((r, ri) => (
              <tr key={t.slug + r.position} className={`align-middle ${ri === 1 ? "border-b-2 border-black/10" : "border-b border-black/5"} ${ti % 2 ? "bg-fiesta-cream/60" : "bg-white"}`}>
                <th scope="row" className={`sticky left-0 z-10 px-4 py-2.5 font-medium ${ti % 2 ? "bg-fiesta-cream" : "bg-white"}`}>
                  {ri === 0 ? <span className="block font-serif text-base font-bold text-fiesta-navy">{t.name}</span> : <span className="block" aria-hidden />}
                  <span className="text-xs font-normal text-black/65">{r.label}</span>
                </th>
                {r.cells.map((c, i) => {
                  const prev = i > 0 ? r.cells[i - 1].winners[0] : undefined;
                  const w = c.winners[0];
                  const same = !!(w && prev && sn(w) === sn(prev));
                  return (
                    <td key={c.year} className="px-1.5 py-1.5">
                      {!w ? <span className="px-2 text-black/30" aria-label={`${r.label} ${c.year}: walang datos`}>–</span> : (
                        <Link href={`/dynasties/${t.slug}#${seatId(r.position, c.year)}`} title={c.winners.map((x) => titleCase(x.name)).join(", ")}
                          aria-label={`${r.label} ${c.year}, ${t.name}: ${c.winners.map((x) => titleCase(x.name)).join(", ")}`}
                          className={`block rounded-lg px-2 py-1.5 font-medium transition hover:bg-fiesta-navy hover:text-white ${same ? "bg-fiesta-orange/15 text-fiesta-orange-deep" : "text-fiesta-navy"}`}>
                          {sn(w)}
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 flex items-center gap-2 text-xs text-black/65"><span className="inline-block h-3 w-3 rounded bg-fiesta-orange/25" aria-hidden />Parehong apelyido sa nakaraang halalan. Pindutin ang pangalan para sa buong tala.</p>
    </div>
  );
}
