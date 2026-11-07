export type Holder = { town: string; year: number; position: string; id: string; name: string };
export const SEATS = ["MAYOR", "VICE MAYOR", "COUNCILOR"] as const;
export type Seat = (typeof SEATS)[number];

/** Everything the expanded surname card draws, computed from the wins of one surname. */
export function surnameStory(holders: Holder[]) {
  const years = [...new Set(holders.map((h) => h.year))].sort((a, b) => a - b);
  const byYear = years.map((year) => ({ year, ...Object.fromEntries(SEATS.map((s) => [s, holders.filter((h) => h.year === year && h.position === s).length])) as Record<Seat, number> }));
  const towns = new Map<string, number>();
  for (const h of holders) towns.set(h.town, (towns.get(h.town) ?? 0) + 1);
  const byTown = [...towns].map(([town, n]) => ({ town, n })).sort((a, b) => b.n - a.n || a.town.localeCompare(b.town));
  const people = new Map<string, { id: string; name: string; wins: Holder[] }>();
  for (const h of holders) { const p = people.get(h.id) ?? { id: h.id, name: h.name, wins: [] }; p.wins.push(h); people.set(h.id, p); }
  const list = [...people.values()].map((p) => ({ ...p, wins: [...p.wins].sort((a, b) => a.year - b.year) })).sort((a, b) => b.wins.length - a.wins.length || a.name.localeCompare(b.name));
  return { byYear, maxYear: Math.max(1, ...byYear.map((y) => SEATS.reduce((s, k) => s + y[k], 0))), byTown, people: list };
}
