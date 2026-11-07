export type SeatCell = { year: number; surname: string | null };
export type Run = { surname: string | null; from: number; to: number; count: number; tone: number };

/** Groups consecutive elections won by the same surname into runs, so "Marco 2013-2019" is one block. A missing record (null) is its own run. `tone` numbers each distinct surname 0,1,2... in order of first appearance, for colouring. */
export function runs(cells: SeatCell[]): Run[] {
  const tones = new Map<string, number>();
  const out: Run[] = [];
  for (const c of cells) {
    const last = out.at(-1);
    if (last && last.surname === c.surname) { last.to = c.year; last.count++; continue; }
    let tone = -1;
    if (c.surname) { if (!tones.has(c.surname)) tones.set(c.surname, tones.size); tone = tones.get(c.surname)!; }
    out.push({ surname: c.surname, from: c.year, to: c.year, count: 1, tone });
  }
  return out;
}

/** "2013" or "2013–2019". */
export const span = (r: Pick<Run, "from" | "to">) => (r.from === r.to ? String(r.from) : `${r.from}–${r.to}`);
