import awardsFile from "@/data/philgeps/awards.json";
import aggregatesFile from "@/data/philgeps/aggregates.json";

// Open PhilGEPS procurement data, Oriental Mindoro slice (scripts/fetch-philgeps.py).
// Figures are what the exports publish, not verified spending; see Meta.caveats.

export type MatchBy = "delivery" | "entity" | "both";
export type Award = {
  id: number;
  year: number | null;
  awardDate: string | null;
  bidRef: string | null;
  awardRef: string;
  title: string | null;
  category: string | null;
  entity: string;
  area: string | null;
  awardee: string | null;
  amount: number | null;
  status: string | null;
  matchBy: MatchBy;
  items: number;
};
export type Ranked = { name: string; awards: number; amount: number };
export type Aggregates = {
  byYear: { year: number; awards: number; amount: number }[];
  undated: { awards: number; amount: number };
  topEntitiesByAmount: Ranked[];
  topEntitiesByCount: Ranked[];
  topAwardeesByAmount: Ranked[];
  topAwardeesByCount: Ranked[];
  topCategories: Ranked[];
  procurementModes: { name: string; awards: number; share: number }[];
  missing: { amount: number; awardee: number; awardDate: number; implausibleOrFlaggedDate: number };
  total: { awards: number; amount: number };
  meta: Meta;
};
export type Meta = {
  dataset: string;
  datasetSha: string | null;
  manifestBuiltAt: string;
  manifestPipelineCommit: string;
  sourceCommit: string;
  file: string;
  fileSha256: string;
  license: string;
  counts: {
    rawRowsMatched: number;
    rawRowsByRule: Record<string, number>;
    rowsWithAwardRef: number;
    distinctAwardRefs: number;
    lineItemsAfterRepublishDedupe: number;
    distinctAwardsAfterDedupe: number;
    awardsByRule: Record<string, number>;
    awardsKeptInAwardsJson: number;
  };
  awardsJson: string;
  matchDefinition: string;
  topEntitiesMatchedByAwards: { name: string; awards: number }[];
  topEntitiesMatchedByRows: { name: string; rows: number }[];
  caveats: string[];
  nulls: string;
  builtAt: string;
};

type Table = { f: string[]; d: Record<string, string[]>; r: (string | number | null)[][] };

let cache: Award[] | null = null;
/** Expand the compact table (dictionary-encoded strings, array rows) into Award objects. */
export function getAwards(): Award[] {
  if (cache) return cache;
  const t = awardsFile as unknown as Table;
  const col = Object.fromEntries(t.f.map((k, i) => [k, i]));
  const dec = (k: string, v: unknown) => (v === null || v === undefined ? null : t.d[k][v as number]);
  cache = t.r.map((r, i) => {
    const awardDate = r[col.awardDate] as string | null;
    return {
      id: i + 1,
      year: awardDate ? Number(awardDate.slice(0, 4)) : null,
      awardDate,
      bidRef: r[col.bidRef] as string | null,
      awardRef: r[col.awardRef] as string,
      title: r[col.title] as string | null,
      category: dec("category", r[col.category]),
      entity: dec("entity", r[col.entity]) as string,
      area: dec("area", r[col.area]),
      awardee: dec("awardee", r[col.awardee]),
      amount: r[col.amount] as number | null,
      status: dec("status", r[col.status]),
      matchBy: dec("matchBy", r[col.matchBy]) as MatchBy,
      items: (r[col.items] as number) ?? 1,
    };
  });
  return cache;
}
export const getAggregates = (): Aggregates => aggregatesFile as unknown as Aggregates;
export const getMeta = (): Meta => getAggregates().meta;

/** Lowercase, accent-stripped form used for matching. */
export const norm = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function yearlySeries(awards: Award[]): { year: number; awards: number; amount: number }[] {
  const m = new Map<number, { year: number; awards: number; amount: number }>();
  for (const a of awards) {
    if (a.year === null) continue;
    const y = m.get(a.year) ?? { year: a.year, awards: 0, amount: 0 };
    y.awards += 1;
    y.amount += a.amount ?? 0;
    m.set(a.year, y);
  }
  return [...m.values()].sort((a, b) => a.year - b.year);
}

export function topN(awards: Award[], field: "entity" | "awardee" | "category", n: number, by: "amount" | "count"): Ranked[] {
  const m = new Map<string, Ranked>();
  for (const a of awards) {
    const name = a[field];
    if (!name) continue;
    const r = m.get(name) ?? { name, awards: 0, amount: 0 };
    r.awards += 1;
    r.amount += a.amount ?? 0;
    m.set(name, r);
  }
  const key = by === "amount" ? "amount" : "awards";
  return [...m.values()].sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name)).slice(0, n);
}

export type AwardFilter = { year?: number; entity?: string; awardee?: string; category?: string; q?: string };
export function filterAwards(awards: Award[], f: AwardFilter): Award[] {
  const has = (v: string | null, needle?: string) => !needle || (v !== null && norm(v).includes(norm(needle)));
  return awards.filter(
    (a) =>
      (f.year === undefined || a.year === f.year) &&
      has(a.entity, f.entity) &&
      has(a.awardee, f.awardee) &&
      has(a.category, f.category) &&
      (!f.q || [a.title, a.entity, a.awardee, a.category, a.awardRef, a.bidRef].some((v) => has(v, f.q))),
  );
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const p = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return { items: items.slice((p - 1) * perPage, p * perPage), page: p, pages, total: items.length };
}
