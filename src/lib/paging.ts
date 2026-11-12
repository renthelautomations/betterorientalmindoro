/** Page numbers to show in a pager: first, last, and two either side of the current page; "gap" marks skipped runs. */
export function pageWindow(cur: number, last: number): (number | "gap")[] {
  const keep = [...new Set([1, last, ...[-2, -1, 0, 1, 2].map((d) => cur + d)])].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  return keep.flatMap((n, i) => (i > 0 && n - keep[i - 1] > 1 ? ["gap" as const, n] : [n]));
}
