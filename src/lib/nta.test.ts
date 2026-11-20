import { describe, expect, it } from "vitest";
import { NTA_YEARS, amount, getLgus, getProvince, ntaChange } from "./nta";

describe("nta", () => {
  it("has the province, Calapan and 14 towns for every year", () => {
    const l = getLgus();
    expect(l).toHaveLength(15);
    expect(getProvince().name).toBe("Oriental Mindoro");
    for (const x of [getProvince(), ...l]) for (const y of NTA_YEARS) expect(amount(x, y)).toBeGreaterThan(0);
  });
  it("change is a percent and null when a year is missing", () => {
    const p = getProvince();
    expect(ntaChange(p, 2026, 2027)).toBeCloseTo(10.8, 1);
    expect(ntaChange(p, 1999, 2027)).toBeNull();
  });
});
