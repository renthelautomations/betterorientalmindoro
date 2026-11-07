import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Winner = { id: string; name: string; ballot: string; party: string; votes: number | null };
export type Contest = { year: number; position: string; seats: number; candidates: number; uncontested: boolean; margin: number | null; winners: Winner[] };
export type Town = { slug: string; upstream: string[]; contests: Contest[] };
export type Province = { name: string; poverty: number | null; elections: { year: number; contests: number }[]; towns: string[]; vintage: string; source: string; license: string };
export type SurnameRow = { surname: string; seats: number; people: number; years: number[] };
export type ProvinceSurnameRow = SurnameRow & { towns: number };

const read = <T>(f: string): T => JSON.parse(readFileSync(join(process.cwd(), "src/data/dynasties", f), "utf8"));

export const getProvince = () => read<Province>("province.json");

export function getTown(slug: string): Town | undefined {
  if (!/^[a-z-]+$/.test(slug) || !getProvince().towns.includes(slug)) return undefined;
  return read<Town>(`${slug}.json`);
}

export const POSITIONS = ["MAYOR", "VICE MAYOR", "COUNCILOR"] as const;
export const POSITION_LABEL: Record<string, string> = { MAYOR: "Mayor", "VICE MAYOR": "Vice Mayor", COUNCILOR: "Councilors" };

export const surnameOf = (ballot: string) => ballot.split(",")[0].trim();

export const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s,.-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());

// Surnames held by 2+ different people, ranked by seats won. One person re-elected is NOT counted.
// ponytail: surname match only (no family verification); the pattern is a hint, never proof.
export function sharedSurnames(contests: Contest[]): SurnameRow[] {
  const acc = new Map<string, { seats: number; ids: Set<string>; years: Set<number> }>();
  for (const c of contests)
    for (const win of c.winners) {
      const s = surnameOf(win.ballot);
      if (!s) continue;
      const e = acc.get(s) ?? { seats: 0, ids: new Set(), years: new Set() };
      e.seats++;
      e.ids.add(win.id);
      e.years.add(c.year);
      acc.set(s, e);
    }
  return [...acc]
    .filter(([, e]) => e.ids.size >= 2)
    .map(([surname, e]) => ({ surname, seats: e.seats, people: e.ids.size, years: [...e.years].sort() }))
    .sort((a, b) => b.seats - a.seats || a.surname.localeCompare(b.surname));
}

// Same, province-wide: counts distinct people across all towns plus how many towns the surname appears in.
export function provinceSurnames(towns: Town[], limit = 10): ProvinceSurnameRow[] {
  const acc = new Map<string, { seats: number; ids: Set<string>; years: Set<number>; towns: Set<string> }>();
  for (const t of towns)
    for (const c of t.contests)
      for (const win of c.winners) {
        const s = surnameOf(win.ballot);
        if (!s) continue;
        const e = acc.get(s) ?? { seats: 0, ids: new Set(), years: new Set(), towns: new Set() };
        e.seats++;
        e.ids.add(win.id);
        e.years.add(c.year);
        e.towns.add(t.slug);
        acc.set(s, e);
      }
  return [...acc]
    .filter(([, e]) => e.ids.size >= 2)
    .map(([surname, e]) => ({ surname, seats: e.seats, people: e.ids.size, towns: e.towns.size, years: [...e.years].sort() }))
    .sort((a, b) => b.seats - a.seats || a.surname.localeCompare(b.surname))
    .slice(0, limit);
}

export const GRID_SEATS = ["MAYOR", "VICE MAYOR"] as const;

/** Winners by seat (mayor, vice mayor) and election year. Empty winners = no record in source (render a dash). */
export function winnersGrid(contests: Contest[], years?: number[]) {
  const ys = years ?? [...new Set(contests.map((c) => c.year))].sort((a, b) => a - b);
  return {
    years: ys,
    rows: GRID_SEATS.map((position) => ({
      position,
      label: POSITION_LABEL[position],
      cells: ys.map((year) => ({ year, winners: contests.find((c) => c.year === year && c.position === position)?.winners ?? [] })),
    })),
  };
}

export type Holder = { town: string; year: number; position: string; id: string; name: string };

/** Every win under one surname (surname match only; a pattern, not proof of kinship). */
export function surnameHolders(towns: Town[], surname: string): Holder[] {
  const out: Holder[] = [];
  for (const t of towns)
    for (const c of t.contests)
      for (const win of c.winners) if (surnameOf(win.ballot) === surname) out.push({ town: t.slug, year: c.year, position: c.position, id: win.id, name: win.name });
  return out.sort((a, b) => b.year - a.year || a.town.localeCompare(b.town));
}

export type SurnameLink = { a: string; b: string; weight: number; surnames: string[] };

/** Towns linked when both have a surname held by 2+ different people (per town). weight = number of shared surnames. Surname match only, never proof. */
export function surnameNetwork(towns: Town[]): SurnameLink[] {
  const per = towns.map((t) => ({ slug: t.slug, set: new Set(sharedSurnames(t.contests).map((r) => r.surname)) }));
  const out: SurnameLink[] = [];
  for (let i = 0; i < per.length; i++)
    for (let j = i + 1; j < per.length; j++) {
      const surnames = [...per[i].set].filter((s) => per[j].set.has(s)).sort();
      if (surnames.length) out.push({ a: per[i].slug, b: per[j].slug, weight: surnames.length, surnames });
    }
  return out.sort((x, y) => y.weight - x.weight || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));
}
