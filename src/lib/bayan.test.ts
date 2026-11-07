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

import { bayanMetrics, bayanRows } from "./bayan";
describe("bayanMetrics / bayanRows", () => {
  it("has the four metrics keyed by all 15 slugs, null (not 0) for missing data", () => {
    const ms = bayanMetrics();
    expect(ms.map((m) => m.label)).toEqual(["metric.pop", "metric.area", "metric.projects", "metric.revenue"]);
    for (const m of ms) expect(Object.keys(m.values)).toHaveLength(15);
    expect(ms[2].values["calapan-city"]).toBe(getProjects("calapan-city").length);
    for (const v of Object.values(ms[0].values)) expect(v === null || v > 0).toBe(true);
  });
  it("rows: one per town, kind matches isCity", () => {
    const rows = bayanRows();
    expect(rows).toHaveLength(15);
    expect(rows.find((r) => r.name === "Calapan City")?.kind).toBe("town.city");
    expect(rows.filter((r) => r.kind === "town.town")).toHaveLength(14);
  });
});
