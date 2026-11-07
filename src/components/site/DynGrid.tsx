import { DynCellLink, DynRegion, TF } from "@/components/site/DynBits";
import { posKey } from "@/components/site/dynKeys";
import { T } from "@/lib/i18n/i18n";
import { surnameOf, titleCase, winnersGrid, type Contest } from "@/lib/dynasties";

export type GridTown = { slug: string; name: string; contests: Contest[] };
export const seatId = (position: string, year: number) => `${position.toLowerCase().replace(" ", "-")}-${year}`;

/** Year-by-seat winners. Real table: row headers are seat (and town), column headers are years; each cell links to the town view anchor. A dash means no record. */
export function WinnersGrid({ towns, years, caption, town }: { towns: GridTown[]; years: number[]; caption: string; town?: string }) {
  return (
    <DynRegion k={caption} v={town ? [town] : undefined}>
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only"><TF k={caption} v={town ? [town] : undefined} /></caption>
        <thead>
          <tr className="border-b border-black/15 text-xs text-black/70">
            <th scope="col" className="sticky left-0 bg-white px-3 py-2 font-semibold"><T k="dyn.grid.col" /></th>
            {years.map((y) => <th key={y} scope="col" className="px-2 py-2 font-semibold tabular-nums">{y}</th>)}
          </tr>
        </thead>
        <tbody>
          {towns.flatMap((t) => winnersGrid(t.contests, years).rows.map((r) => (
            <tr key={t.slug + r.position} className="border-b border-black/10 align-top last:border-0">
              <th scope="row" className="sticky left-0 bg-white px-3 py-2 font-medium"><span className="block">{t.name}</span><span className="text-xs font-normal text-black/70"><T k={posKey(r.position)} /></span></th>
              {r.cells.map((c) => (
                <td key={c.year} className="px-2 py-2">
                  {c.winners.length === 0 ? <span><span aria-hidden>-</span><span className="sr-only"><TF k="dyn.grid.nodata" v={[posKey(r.position), c.year]} /></span></span> : (
                    <DynCellLink href={`/dynasties/${t.slug}#${seatId(r.position, c.year)}`} seat={posKey(r.position)} year={c.year} town={t.name} names={c.winners.map((w) => titleCase(w.name)).join(", ")}>
                      {surnameOf(c.winners[0].ballot) ? titleCase(surnameOf(c.winners[0].ballot)) : titleCase(c.winners[0].name)}
                    </DynCellLink>
                  )}
                </td>
              ))}
            </tr>
          )))}
        </tbody>
      </table>
    </DynRegion>
  );
}
