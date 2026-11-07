import { surnameOf, titleCase, winnersGrid, type Contest } from "@/lib/dynasties";
import type { TownSeats } from "./WinnersViews";

/** Seat/year/surname data WinnersViews wants, for one town. */
export const townSeats = (slug: string, name: string, contests: Contest[], years: number[]): TownSeats => ({
  slug, name,
  seats: winnersGrid(contests, years).rows.map((r) => ({ position: r.position, cells: r.cells.map((c) => ({ year: c.year, surname: c.winners[0] ? titleCase(surnameOf(c.winners[0].ballot) || c.winners[0].name) : null, full: c.winners.map((w) => titleCase(w.name)).join(", ") })) })),
});
