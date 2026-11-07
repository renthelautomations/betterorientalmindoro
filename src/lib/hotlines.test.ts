import { describe, it, expect } from "vitest";
import { getHotlines, groupByCategory, hotlinesForBayan } from "./hotlines";
import { getMunicipalities } from "./municipalities";

describe("hotlines", () => {
  const all = getHotlines();
  it("has entries", () => expect(all.length).toBeGreaterThan(10));
  it("every row has source, verifiedAt, a digit in the number and a unique id", () => {
    for (const h of all) {
      expect(h.source).toMatch(/^https?:\/\//);
      expect(h.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(h.number).toMatch(/\d/);
    }
    expect(new Set(all.map((h) => h.id)).size).toBe(all.length);
  });
  it("scopes are province or a valid municipality slug", () => {
    const slugs = new Set(getMunicipalities().map((m) => m.slug));
    for (const h of all) expect(h.scope === "province" || slugs.has(h.scope)).toBe(true);
  });
  it("unknown scope returns empty; groupByCategory keeps only present categories", () => {
    expect(getHotlines("nope")).toEqual([]);
    const g = groupByCategory(getHotlines("province"));
    expect(Object.keys(g).length).toBeGreaterThan(0);
    for (const rows of Object.values(g)) expect(rows.length).toBeGreaterThan(0);
  });
  it("hotlinesForBayan: local rows plus province fallback, empty local for a bayan with none", () => {
    const r = hotlinesForBayan("calapan-city");
    expect(r.local.length).toBeGreaterThan(0);
    expect(r.local.every((h) => h.scope === "calapan-city")).toBe(true);
    expect(r.province).toEqual(getHotlines("province"));
    expect(hotlinesForBayan("baco").local).toEqual([]);
    expect(hotlinesForBayan(undefined).local).toEqual([]);
    expect(hotlinesForBayan("not-a-town").local).toEqual([]);
  });
});

import { officeOf, searchHotlines } from "./hotlines";
describe("smart search", () => {
  const all = getHotlines();
  const town = (s: string) => (s === "calapan-city" ? "Calapan City" : s);
  it("office from name", () => {
    expect(officeOf("Calapan City Police Station")).toBe("police");
    expect(officeOf("BFP Calapan City")).toBe("fire");
    expect(officeOf("Philippine Coast Guard - Calapan Station")).toBe("coastguard");
    expect(officeOf("Calapan City DRRM Office")).toBe("drrm");
  });
  it("Filipino word finds the right office", () => {
    expect(searchHotlines(all, "sunog", town).every((h) => officeOf(h.name) === "fire")).toBe(true);
    expect(searchHotlines(all, "baha", town).length).toBeGreaterThan(0);
  });
  it("tolerates one typo and combines town + office", () => {
    expect(searchHotlines(all, "polise", town).length).toBeGreaterThan(0);
    const r = searchHotlines(all, "pulis calapan", town);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((h) => h.scope === "calapan-city")).toBe(true);
  });
  it("nonsense and empty give nothing", () => {
    expect(searchHotlines(all, "zzzzqq", town)).toEqual([]);
    expect(searchHotlines(all, "  ", town)).toEqual([]);
  });
});
