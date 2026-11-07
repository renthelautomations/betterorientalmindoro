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
