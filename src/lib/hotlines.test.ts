import { describe, it, expect } from "vitest";
import { getHotlines, groupByCategory } from "./hotlines";
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
});
