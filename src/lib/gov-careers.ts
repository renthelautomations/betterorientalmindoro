// Pure filtering for the Jobs tab. `today` is "YYYY-MM-DD", supplied by the caller (client effect), never read here.
import { fold } from "./smart-search";
import type { Career } from "./gov";

export type Status = "open" | "closed" | "all";
const day = (s: string) => Date.parse(s + "T00:00:00Z") / 864e5;

/** Open means the deadline is today or later; no deadline is never treated as open. */
export const isOpen = (deadline: string | null, today: string) => !!deadline && deadline >= today;
export const daysLeft = (deadline: string, today: string) => Math.round(day(deadline) - day(today));

export function filterCareers(items: Career[], f: { status: Status; office: string; q: string; today: string }) {
  const needle = fold(f.q.trim());
  const base = items.filter((x) => (!f.office || x.office === f.office) && (!needle || fold(`${x.position} ${x.office ?? ""} ${x.itemNo ?? ""}`).includes(needle)));
  const open = base.filter((x) => isOpen(x.deadline, f.today));
  const closed = base.filter((x) => !isOpen(x.deadline, f.today));
  const rows = f.status === "open" ? open : f.status === "closed" ? closed : base;
  return { rows, counts: { open: open.length, closed: closed.length, all: base.length } };
}

export function pageOf<T>(xs: T[], page: number, size: number) {
  const last = Math.max(1, Math.ceil(xs.length / size));
  const p = Math.min(Math.max(1, page), last);
  return { rows: xs.slice((p - 1) * size, p * size), page: p, last };
}
