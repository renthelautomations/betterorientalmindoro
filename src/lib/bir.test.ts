import { describe, it, expect } from "vitest";
import { fmtM, fmtPct, OM, YEARS, getArea, getAreas, getBirMeta, growth, inRegion, monthly, rankInRegion, regionShare, series, shortArea, yoy, yearTotal, type Area } from "./bir";

const a = (area: string, totals: Record<string, number | null>, region = "R"): Area => ({ region, area, totals });
describe("growth / yoy / series", () => {
  it("computes percent growth and refuses to guess", () => {
    const x = a("x", { "2020": 100, "2021": 150, "2022": null });
    expect(growth(x, 2020, 2021)).toBe(50);
    expect(growth(x, 2021, 2022)).toBeNull();
    expect(growth(a("z", { "2020": 0, "2021": 5 }), 2020, 2021)).toBeNull();
  });
  it("series keeps nulls as null", () => expect(series(a("x", { "2020": 1 }), [2020, 2021])).toEqual([{ year: 2020, value: 1 }, { year: 2021, value: null }]));
});
describe("regionShare / rankInRegion", () => {
  const all = [a("p", { "2024": 300 }), a("q", { "2024": 100 }), a("r", { "2024": null }), a("s", { "2024": 600 }, "other")];
  it("share counts only areas of the same region with a figure", () => expect(regionShare(all[0], 2024, all)).toBe(75));
  it("rank is within the region and skips missing", () => { expect(rankInRegion(all[1], 2024, all)).toEqual({ rank: 2, of: 2 }); expect(rankInRegion(all[2], 2024, all)).toBeNull(); });
});
describe("real data", () => {
  it("Oriental Mindoro has every year, matching the BetterGov dashboard for 2020 and 2024", () => {
    const om = getArea(OM)!;
    expect(YEARS.every((y) => yearTotal(om, y) != null)).toBe(true);
    expect(yearTotal(om, 2020)).toBeCloseTo(1547.78, 2);
    expect(yearTotal(om, 2024)).toBeCloseTo(2765.53, 2);
  });
  it("monthly values add up to the year total and Oriental Mindoro is ranked within MIMAROPA", () => {
    const om = getArea(OM)!;
    expect(monthly(om, 2024).reduce((s: number, v) => s + (v ?? 0), 0)).toBeCloseTo(yearTotal(om, 2024)!, 1);
    expect(rankInRegion(om, 2024)!.of).toBe(getAreas().filter((x) => inRegion(x)).length);
    expect(yoy(om)).toHaveLength(YEARS.length - 1);
  });
  it("is CC0 and states its unit", () => { expect(getBirMeta().license).toMatch(/CC0/); expect(getBirMeta().unit).toMatch(/million/); expect(shortArea("Palawan (includes City of Puerto Princesa)")).toBe("Palawan"); });
});
describe("formatting", () => {
  it("shows millions as B or M and null as a dash", () => { expect(fmtM(2765.53)).toBe("₱2.77B"); expect(fmtM(628.44)).toBe("₱628.4M"); expect(fmtM(null)).toBe("-"); });
  it("signs percentages", () => { expect(fmtPct(78.7)).toBe("+78.7%"); expect(fmtPct(-3)).toBe("-3.0%"); expect(fmtPct(null)).toBe("-"); });
});
