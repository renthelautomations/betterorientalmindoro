import { describe, expect, it } from "vitest";
import { eoFlags, eoShort, flagsForDoc, lgsfFlags, lgsfQuarter, resolveEoRef, DISCLAIMER } from "./gov-doc-flags";
import type { Eo, Report } from "./gov";

const eo = (number: number, year: number, suffix: string | null = null): Eo => ({ id: `eo-${year}-${number}${suffix ?? ""}`, number, suffix, year, label: `Executive Order No. ${number} Series of ${year}`, title: "T", date: null, url: null });
const rep = (id: string, date: string, title: string, kind: Report["kind"] = "lgsf"): Report => ({ id, date, title, kind, url: null });

describe("eo flags", () => {
  it("reports gaps inside a year's sequence, as info, with neutral wording", () => {
    const f = eoFlags([eo(1, 2025), eo(2, 2025), eo(5, 2025), eo(6, 2025), eo(9, 2025)]);
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ rule: "eo-number-gap", severity: "info", disclaimer: DISCLAIMER });
    expect(f[0].evidence[0].value).toBe("3-4, 7-8");
    expect(f[0].what).toContain("not listed");
    expect(flagsForDoc("eo-2025-2", f)).toHaveLength(1);
  });
  it("no gap flag for a complete year; letter suffix does not count as a gap", () => {
    expect(eoFlags([eo(1, 2024), eo(2, 2024), eo(2, 2024, "A"), eo(3, 2024)])).toEqual([]);
  });
  it("flags the same number+year listed twice for review", () => {
    const f = eoFlags([eo(1, 2024), { ...eo(1, 2024), id: "dup" }]);
    expect(f.map((x) => [x.rule, x.severity])).toEqual([["eo-duplicate", "review"]]);
    expect(f[0].evidence.map((e) => e.docId)).toEqual(["eo-2024-1", "dup"]);
  });
});

describe("lgsf", () => {
  it("reads the quarter from the title", () => {
    expect(lgsfQuarter("LGSF Report ... as of September 30, 2026")).toEqual({ year: 2026, q: 3 });
    expect(lgsfQuarter("LGSF Report ... as of June, 2026")).toEqual({ year: 2026, q: 2 });
    expect(lgsfQuarter("LGSF Report ... Quarter Ended March 31, 2026")).toEqual({ year: 2026, q: 1 });
    expect(lgsfQuarter("Supplemental budget no. 4")).toBeNull();
  });
  it("flags only ended quarters, relative to the data's own latest date", () => {
    const rs = [rep("a", "2026-01-13", "LGSF Quarter Ended December 31, 2025"), rep("b", "2026-08-01", "LGSF as of June, 2026"), rep("x", "2026-08-30", "Budget", "other")];
    const f = lgsfFlags(rs);
    expect(f.map((x) => x.id)).toEqual(["lgsf-quarter-not-listed:2026-Q1"]);
    expect(f[0].severity).toBe("info");
    expect(lgsfFlags([rs[0], rs[1], rep("c", "2026-10-06", "LGSF as of September 30, 2026"), rs[2]]).map((x) => x.id)).toEqual(["lgsf-quarter-not-listed:2026-Q1"]);
  });
  it("does not flag when the next quarter has not ended yet", () => {
    expect(lgsfFlags([rep("a", "2026-04-20", "LGSF Quarter Ended March 31, 2026")])).toEqual([]);
  });
});

describe("refs", () => {
  it("resolves labels to ids by number and year", () => {
    expect(resolveEoRef("Executive Order No. 59, Series of 2020", [eo(59, 2020)])).toBe("eo-2020-59");
    expect(resolveEoRef("Executive Order No. 59, Series of 2020", [eo(59, 2021)])).toBeNull();
  });
  it("short label", () => expect(eoShort(eo(61, 2026))).toBe("EO No. 61, s. 2026"));
});
