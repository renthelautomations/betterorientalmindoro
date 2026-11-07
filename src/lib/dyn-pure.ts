import { hit, toks } from "./fuzzy";

// Pure helpers with no file access, safe to import from client components.
export const surnameOf = (ballot: string) => ballot.split(",")[0].trim();
export const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s,.-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());

export const seatId = (position: string, year: number) => `${position.toLowerCase().replace(" ", "-")}-${year}`;

/** Compact row for client-side search: [town slug, year, position, name, ballot surname, party]. */
export type WinnerRow = [string, number, string, string, string, string];
/** Winners whose name matches every query word (prefix, one typo allowed), narrowed by optional year and position. Newest first. */
export function findWinners(rows: WinnerRow[], q: string, year?: number, position?: string): WinnerRow[] {
  const qt = toks(q);
  return rows
    .filter((r) => (!year || r[1] === year) && (!position || r[2] === position) && qt.every((t) => toks(r[3] + " " + r[4]).some((w) => hit(w, t))))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]) || a[3].localeCompare(b[3]));
}
