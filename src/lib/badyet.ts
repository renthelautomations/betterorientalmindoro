import data from "@/data/badyet.json";
export { fmtPeso, DASH } from "@/lib/stats";

type Year = { fy: number; stage: string; stage_label: string; scope: string; php: number | null };
type Group = { label: string; sub: string; rows: number; php: number; unconfirmed_rows: number; unconfirmed_php: number };
export type Office = {
  id: string; name: string; kind_label: string; tier_text: string; co_served_districts: string[]; years_note: string; notes: string[]; projects_url: string;
  years: Year[];
  by_congress: { congress: number; gaa_php: number; years_counted: number[] }[];
  fy2027: {
    nep_php: number | null; hgab3_php: number | null; nep_records: number; hgab3_records: number; net_php: number;
    unconfirmed_rows: number; unconfirmed_php: number;
    office_change: { rows: number; nep_php: number; hgab3_php: number } | null;
    groups: Record<string, Group>;
  };
};
export type District = {
  id: string; label: string; url: string;
  representative: { name: string; seat: string; bill_count: number; profile_url: string };
  offices: Office[];
};
const all = data as unknown as { meta: { built_at: string; source_repo: string; source_commit: string; notice: string; representatives_note: string }; disclaimers: { title: string; body: string; url: string }[]; districts: District[] };

export const getBadyet = () => all;
export const getDistricts = () => all.districts;
export const getDistrict = (id: string) => all.districts.find((d) => d.id === id);

export const GROUP_ORDER = ["house_only", "nep_only", "unchanged", "increased", "decreased", "scope_review"] as const;
export const groupList = (o: Office) => GROUP_ORDER.map((key) => ({ key, ...o.fy2027.groups[key] }));

export const gaaYears = (o: Office) => o.years.filter((y) => y.stage === "gaa");

/** The two FY2027 versions, side by side. Deliberately no total. */
export const versions = (o: Office) => ({ nep: o.fy2027.nep_php, house: o.fy2027.hgab3_php });

/** House minus NEP; null unless both are known. */
export const netChange = (nep: number | null | undefined, house: number | null | undefined) =>
  typeof nep === "number" && typeof house === "number" ? house - nep : null;

/** Bar widths (0-100) for two amounts on ONE shared scale: each is its share of the larger, so the bars compare and are never added. */
export const shareScale = (nep: number | null | undefined, house: number | null | undefined) => {
  const a = typeof nep === "number" && nep > 0 ? nep : 0;
  const b = typeof house === "number" && house > 0 ? house : 0;
  const max = Math.max(a, b);
  return { nep: max ? (a / max) * 100 : 0, house: max ? (b / max) * 100 : 0 };
};

/** Display order of the proportion bar. Width = share of budget LINES (rows); pesos are shown as text only and never drive width. */
export const BAR_ORDER = ["unchanged", "increased", "house_only", "nep_only", "decreased", "scope_review"] as const;
export const proportionSegments = (o: Office) => {
  const gs = BAR_ORDER.map((key) => ({ key, ...o.fy2027.groups[key] }));
  const total = gs.reduce((a, x) => a + x.rows, 0);
  return gs.map((x) => ({ ...x, pct: total ? (x.rows / total) * 100 : 0 }));
};

/** URL segment for a district page: `1st` or `2nd`. */
export const DISTRICT_SLUGS = ["1st", "2nd"] as const;
export const districtBySlug = (s: string) => (DISTRICT_SLUGS.includes(s as "1st") ? getDistrict(`leg:oriental-mindoro:${s}`) : undefined);

export type Check =
  | { id: "totals"; level: "ok" | "flag" | "unknown"; diff: number | null }
  | { id: "projects"; level: "ok" | "flag"; nep: number; house: number }
  | { id: "unconfirmed"; level: "ok" | "flag"; rows: number; php: number };

/** Three plain checks on one office's FY2027 figures. A flag means the two versions differ or a match is uncertain: it is a pointer to look closer, never a finding about anyone. Unknown totals are "unknown", not a match. */
export function budgetChecks(o: Office): Check[] {
  const f = o.fy2027;
  const diff = netChange(f.nep_php, f.hgab3_php);
  return [
    { id: "totals", level: diff == null ? "unknown" : diff === 0 ? "ok" : "flag", diff },
    { id: "projects", level: f.nep_records === f.hgab3_records ? "ok" : "flag", nep: f.nep_records, house: f.hgab3_records },
    { id: "unconfirmed", level: f.unconfirmed_rows > 0 ? "flag" : "ok", rows: f.unconfirmed_rows, php: f.unconfirmed_php },
  ];
}
