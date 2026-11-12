import { describe, expect, it } from "vitest";
import { filterAwards, getAggregates, getAwards, getMeta, norm, paginate, topN, yearlySeries, type Award } from "./philgeps";

const mk = (o: Partial<Award>): Award => ({
  id: 1, year: 2024, awardDate: "2024-03-01", bidRef: "b", awardRef: "a", title: "Road repair", category: "Infrastructure",
  entity: "PROVINCE OF ORIENTAL MINDORO", area: "Oriental Mindoro", awardee: "ACME BUILDERS", amount: 100, status: "Awarded",
  matchBy: "both", items: 1, ...o,
});
const sample = [
  mk({ id: 1, amount: 100 }),
  mk({ id: 2, year: 2023, awardDate: "2023-01-01", amount: 50, awardee: "Piña Trading", entity: "CITY GOVERNMENT OF CALAPAN" }),
  mk({ id: 3, year: 2023, awardDate: "2023-02-01", amount: null, awardee: "ACME BUILDERS" }),
  mk({ id: 4, year: null, awardDate: null, amount: 7, category: null }),
];

describe("norm", () => {
  it("strips accents and case", () => expect(norm("PIÑA Café")).toBe("pina cafe"));
});

describe("yearlySeries", () => {
  it("groups by year, skips null year, ignores null amounts", () => {
    expect(yearlySeries(sample)).toEqual([
      { year: 2023, awards: 2, amount: 50 },
      { year: 2024, awards: 1, amount: 100 },
    ]);
  });
});

describe("topN", () => {
  it("ranks by amount", () => {
    const t = topN(sample, "awardee", 5, "amount");
    expect(t[0]).toEqual({ name: "ACME BUILDERS", awards: 3, amount: 107 });
  });
  it("ranks by count and limits", () => {
    const t = topN(sample, "awardee", 1, "count");
    expect(t).toHaveLength(1);
    expect(t[0].name).toBe("ACME BUILDERS");
  });
  it("skips null names", () => expect(topN(sample, "category", 5, "count").map((x) => x.name)).toEqual(["Infrastructure"]));
});

describe("filterAwards", () => {
  it("by year", () => expect(filterAwards(sample, { year: 2023 }).map((a) => a.id)).toEqual([2, 3]));
  it("accent-insensitive awardee", () => expect(filterAwards(sample, { awardee: "pina" }).map((a) => a.id)).toEqual([2]));
  it("entity substring", () => expect(filterAwards(sample, { entity: "calapan" })).toHaveLength(1));
  it("q searches title/entity/awardee", () => {
    expect(filterAwards(sample, { q: "PIÑA" })).toHaveLength(1);
    expect(filterAwards(sample, { q: "road" })).toHaveLength(4);
  });
  it("empty filter returns all", () => expect(filterAwards(sample, {})).toHaveLength(4));
  it("category", () => expect(filterAwards(sample, { category: "infra" })).toHaveLength(3));
});

describe("paginate", () => {
  const xs = Array.from({ length: 25 }, (_, i) => i);
  it("slices", () => expect(paginate(xs, 2, 10)).toEqual({ items: xs.slice(10, 20), page: 2, pages: 3, total: 25 }));
  it("clamps page", () => expect(paginate(xs, 99, 10).page).toBe(3));
  it("empty", () => expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pages: 1, total: 0 }));
});

describe("real data integrity", () => {
  const awards = getAwards();
  it("non-empty", () => expect(awards.length).toBeGreaterThan(1000));
  it("every award has id, entity and a finite-or-null amount", () => {
    for (const a of awards) {
      expect(a.id).toBeGreaterThan(0);
      expect(a.entity).toBeTruthy();
      expect(a.amount === null || Number.isFinite(a.amount)).toBe(true);
    }
  });
  it("no award appears twice", () => {
    expect(new Set(awards.map((a) => a.id)).size).toBe(awards.length);
    expect(new Set(awards.map((a) => `${a.awardRef}|${a.awardee}|${a.amount}`)).size).toBe(awards.length);
  });
  it("years are plausible and match awardDate", () => {
    for (const a of awards) {
      if (a.awardDate) expect(a.year).toBe(Number(a.awardDate.slice(0, 4)));
      if (a.year !== null) expect(a.year).toBeGreaterThanOrEqual(2000);
      if (a.year !== null) expect(a.year).toBeLessThanOrEqual(2025);
    }
  });
  it("matchBy is a known rule", () => {
    for (const a of awards) expect(["delivery", "entity", "both"]).toContain(a.matchBy);
  });
  it("no private-person fields anywhere", () => {
    const keys = (o: unknown): string[] => (o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => [k, ...keys(v)]) : []);
    const all = [...keys(awards[0]), ...keys(getAggregates()), ...keys(getMeta())];
    expect(all.filter((k) => /created_by|contact/i.test(k))).toEqual([]);
  });
  it("aggregates cover all awards and meta explains the cut", () => {
    const g = getAggregates();
    expect(g.total.awards).toBe(getMeta().counts.distinctAwardsAfterDedupe);
    expect(g.byYear.reduce((s, y) => s + y.awards, 0) + g.undated.awards).toBe(g.total.awards);
    expect(getMeta().counts.awardsKeptInAwardsJson).toBe(awards.length);
    expect(g.topEntitiesByAmount).toHaveLength(25);
    expect(getMeta().caveats.length).toBeGreaterThan(3);
  });
});
