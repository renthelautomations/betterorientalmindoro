import { describe, expect, it } from "vitest";
import { fmtInt, fmtPct, fmtPeso, getStats, iraDependency, popGrowth, DASH, getProvinceStats } from "./stats";

describe("getStats", () => {
  it("finds by slug", () => expect(getStats("baco")?.population.at(-1)?.year).toBe(2024));
  it("unknown slug is undefined", () => expect(getStats("atlantis")).toBeUndefined());
  it("province exists", () => expect(getProvinceStats().population.at(-1)?.value).toBe(919504));
});

describe("iraDependency", () => {
  it("is IRA / total income", () => expect(iraDependency(220, 400)).toBeCloseTo(0.55));
  it("guards missing and zero", () => {
    expect(iraDependency(null, 400)).toBeNull();
    expect(iraDependency(100, undefined)).toBeNull();
    expect(iraDependency(100, 0)).toBeNull();
  });
  it("zero IRA is a real zero", () => expect(iraDependency(0, 400)).toBe(0));
});

describe("popGrowth", () => {
  it("computes fraction between first and last", () => expect(popGrowth([{ value: 100 }, { value: 150 }])).toBeCloseTo(0.5));
  it("null with <2 points", () => expect(popGrowth([{ value: 1 }])).toBeNull());
});

describe("formatting", () => {
  it("percent", () => expect(fmtPct(0.5945)).toBe("59.5%"));
  it("dash for missing", () => {
    expect(fmtPct(null)).toBe(DASH);
    expect(fmtInt(undefined)).toBe(DASH);
    expect(fmtPeso(null)).toBe(DASH);
  });
  it("zero is not dash", () => expect(fmtInt(0)).toBe("0"));
  it("peso in millions", () => expect(fmtPeso(371329918.71)).toBe("₱371.33M"));
  it("peso in billions", () => expect(fmtPeso(1447994148)).toBe("₱1.45B"));
});
