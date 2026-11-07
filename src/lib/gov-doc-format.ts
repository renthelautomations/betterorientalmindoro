/** "2026-11-04" -> "Nov 4, 2026" (UTC, so server and browser agree); null -> "-". */
export const fmtDate = (d: string | null) => (d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "-");
