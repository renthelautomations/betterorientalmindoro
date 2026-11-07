import { describe, it, expect } from "vitest";
import { getCategories, getCategory, getServices, getService, getLifeEvents, servicesForEvent } from "./services";

describe("services directory", () => {
  const all = getServices();
  const cats = getCategories();
  it("has categories and services", () => {
    expect(cats.length).toBeGreaterThanOrEqual(9);
    expect(all.length).toBeGreaterThan(10);
  });
  it("ids are unique and slug-safe", () => {
    expect(new Set(all.map((s) => s.id)).size).toBe(all.length);
    for (const s of all) expect(s.id).toMatch(/^[a-z0-9-]+$/);
  });
  it("category slugs are unique", () => expect(new Set(cats.map((c) => c.slug)).size).toBe(cats.length));
  it("every service has a valid category, https source, checkedAt and draft flag", () => {
    for (const s of all) {
      expect(getCategory(s.category), s.id).toBeDefined();
      expect(s.source, s.id).toMatch(/^https:\/\//);
      expect(s.checkedAt, s.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.draft, s.id).toBe(true);
    }
  });
  it("detail fields never empty arrays", () => {
    for (const s of all) for (const k of ["steps", "requirements"] as const) if (s[k]) expect(s[k]!.length, s.id + k).toBeGreaterThan(0);
  });
  it("life events reference real services", () => {
    for (const e of getLifeEvents()) {
      expect(e.serviceIds.length).toBeGreaterThan(0);
      expect(servicesForEvent(e.slug).length).toBe(e.serviceIds.length);
    }
  });
  it("unknown lookups return undefined", () => {
    expect(getCategory("nope")).toBeUndefined();
    expect(getService("health", "nope")).toBeUndefined();
    expect(getService("nope", "nope")).toBeUndefined();
    expect(servicesForEvent("nope")).toEqual([]);
  });
  it("service is only found under its own category", () => {
    const s = all[0];
    expect(getService(s.category, s.id)?.id).toBe(s.id);
    const other = cats.find((c) => c.slug !== s.category)!;
    expect(getService(other.slug, s.id)).toBeUndefined();
  });
});
