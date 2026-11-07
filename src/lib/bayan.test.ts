import { describe, it, expect } from "vitest";
import { getBayanSummary } from "./bayan";
import { getMunicipalities } from "./municipalities";
import { getProjects } from "./projects";

describe("getBayanSummary", () => {
  it("calapan-city has municipal hotlines", () => expect(getBayanSummary("calapan-city")?.hotlineCount).toBeGreaterThan(0));
  it("baco has unknown hotline count (null, never 0)", () => expect(getBayanSummary("baco")?.hotlineCount).toBeNull());
  it("unknown slug is undefined", () => expect(getBayanSummary("atlantis")).toBeUndefined());
  it("projectCount only counts rows assigned to the slug", () => {
    for (const m of getMunicipalities()) {
      const s = getBayanSummary(m.slug)!;
      expect(s.projectCount).toBe(getProjects().filter((p) => p.municipality === m.slug).length);
      expect(getProjects(m.slug).some((p) => p.uncertain)).toBe(false);
    }
  });
  it("topSurnames has at most 3 and basic fields", () => {
    for (const m of getMunicipalities()) {
      const s = getBayanSummary(m.slug)!;
      expect(s.topSurnames.length).toBeLessThanOrEqual(3);
      expect(s.barangays).toBeGreaterThan(0);
      expect(s.pcode).toBe(m.pcode);
    }
  });
});
