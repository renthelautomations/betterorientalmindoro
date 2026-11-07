import { describe, expect, it } from "vitest";
import { fmtPeso, gaaYears, getDistrict, getDistricts, groupList, netChange, proportionSegments, versions, type Office } from "./badyet";

const g = (rows: number, php: number, unconfirmed_rows = 0, unconfirmed_php = 0) => ({ label: "x", sub: "y", rows, php, unconfirmed_rows, unconfirmed_php });
const office = {
  years: [
    { fy: 2026, stage: "gaa", stage_label: "Enacted (GAA)", scope: "", php: 794496000 },
    { fy: 2027, stage: "nep", stage_label: "NEP", scope: "", php: 887874000 },
  ],
  fy2027: {
    nep_php: 852997000, hgab3_php: 1002997000, nep_records: 93, hgab3_records: 112, net_php: 150000000, unconfirmed_rows: 10, unconfirmed_php: 50000000, office_change: null,
    groups: { house_only: g(40, 240000000, 10, 50000000), nep_only: g(21, 105000000), unchanged: g(70, 737997000), increased: g(2, 15000000), decreased: g(0, 0), scope_review: g(0, 0) },
  },
} as unknown as Office;

describe("fmtPeso", () => {
  it("formats M/B and dashes null", () => {
    expect(fmtPeso(852997000)).toBe("₱853.00M");
    expect(fmtPeso(2796380000)).toBe("₱2.80B");
    expect(fmtPeso(null)).toBe("-");
  });
});

describe("groups", () => {
  it("reads rows, php and unconfirmed in a fixed order", () => {
    const l = groupList(office);
    expect(l.map((x) => x.key)).toEqual(["house_only", "nep_only", "unchanged", "increased", "decreased", "scope_review"]);
    expect(l[0]).toMatchObject({ rows: 40, php: 240000000, unconfirmed_rows: 10, unconfirmed_php: 50000000 });
  });
});

describe("versions", () => {
  it("returns NEP and House separately, never a sum", () => {
    const v = versions(office);
    expect(v).toEqual({ nep: 852997000, house: 1002997000 });
    expect(Object.keys(v)).not.toContain("total");
  });
});

describe("netChange", () => {
  it("is house minus nep only when both present", () => {
    expect(netChange(10, 25)).toBe(15);
    expect(netChange(null, 25)).toBeNull();
    expect(netChange(10, null)).toBeNull();
    expect(netChange(0, 0)).toBe(0);
  });
});

describe("gaaYears", () => {
  it("keeps only enacted years", () => expect(gaaYears(office).map((y) => y.fy)).toEqual([2026]));
});

describe("lookup", () => {
  it("finds known and not unknown ids", () => {
    expect(getDistricts()).toHaveLength(2);
    expect(getDistrict("leg:oriental-mindoro:1st")?.offices[0].name).toBe("Mindoro Oriental DEO");
    expect(getDistrict("leg:nope")).toBeUndefined();
  });
});

describe("proportionSegments", () => {
  it("sizes segments by number of lines, never by peso", () => {
    const seg = proportionSegments(office);
    expect(seg.map((x) => x.key)).toEqual(["unchanged", "increased", "house_only", "nep_only", "decreased", "scope_review"]);
    const total = 40 + 21 + 70 + 2;
    expect(seg.find((x) => x.key === "unchanged")!.pct).toBeCloseTo((70 / total) * 100);
    expect(seg.find((x) => x.key === "house_only")!.pct).toBeCloseTo((40 / total) * 100);
    expect(seg.reduce((a, x) => a + x.pct, 0)).toBeCloseTo(100);
    expect(seg.find((x) => x.key === "house_only")).toMatchObject({ rows: 40, php: 240000000, unconfirmed_rows: 10 });
  });
  it("gives 0 widths when there are no lines", () => {
    const empty = { fy2027: { groups: Object.fromEntries(["house_only", "nep_only", "unchanged", "increased", "decreased", "scope_review"].map((k) => [k, g(0, 5)])) } } as unknown as Office;
    expect(proportionSegments(empty).every((x) => x.pct === 0)).toBe(true);
  });
});

describe("districtBySlug", () => {
  it("maps 1st/2nd to the district ids and rejects the rest", async () => {
    const { districtBySlug, DISTRICT_SLUGS } = await import("./badyet");
    expect(DISTRICT_SLUGS).toEqual(["1st", "2nd"]);
    expect(districtBySlug("1st")?.id).toBe("leg:oriental-mindoro:1st");
    expect(districtBySlug("2nd")?.id).toBe("leg:oriental-mindoro:2nd");
    expect(districtBySlug("3rd")).toBeUndefined();
    expect(districtBySlug("constructor")).toBeUndefined();
  });
});
