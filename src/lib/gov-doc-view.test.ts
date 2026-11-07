import { describe, expect, it } from "vitest";
import { barPct, countBy, filterEos, fmtPeso, pageCount, pageSlice } from "./gov-doc-view";
import type { Eo } from "./gov";
import type { EoDoc } from "./gov-docs";

const eo = (n: number, year: number, title: string): Eo => ({ id: `eo-${year}-${n}`, number: n, suffix: null, year, label: `Executive Order No. ${n} Series of ${year}`, title, date: null, url: null });
const items = [eo(1, 2026, "REORGANIZING THE TWG"), eo(2, 2025, "CREATING A COUNCIL"), eo(3, 2025, "DECLARING A HOLIDAY")];
const docs = new Map<string, EoDoc>([["eo-2025-2", { id: "eo-2025-2", number: 2, year: 2025, summary: "Sets up a health council.", summaryFil: "x", topic: "health", signedDate: null, amends: [], repeals: [], keyPoints: [], pageCount: 1, confidence: "high", evidence: [] }]]);

describe("filterEos", () => {
  it("works with no summaries", () => {
    expect(filterEos(items, new Map(), { q: "holiday", year: "", topic: "" }).map((e) => e.id)).toEqual(["eo-2025-3"]);
    expect(filterEos(items, new Map(), { q: "", year: "2025", topic: "" })).toHaveLength(2);
    expect(filterEos(items, new Map(), { q: "", year: "", topic: "health" })).toEqual([]);
  });
  it("searches summaries and filters topic", () => {
    expect(filterEos(items, docs, { q: "health council", year: "", topic: "" })).toHaveLength(1);
    expect(filterEos(items, docs, { q: "", year: "", topic: "health" })).toHaveLength(1);
  });
});
describe("helpers", () => {
  it("pages", () => { expect(pageCount(0)).toBe(1); expect(pageCount(154)).toBe(16); expect(pageSlice([1, 2, 3], 2, 2)).toEqual([3]); });
  it("counts", () => expect(countBy([1, 2, 2], (n) => String(n))).toEqual([{ k: "2", n: 2 }, { k: "1", n: 1 }]));
  it("unknown amount is a dash and no bar, never zero", () => { expect(fmtPeso(null)).toBe("-"); expect(barPct(null, 10)).toBeNull(); expect(barPct(5, 10)).toBe(50); });
});
