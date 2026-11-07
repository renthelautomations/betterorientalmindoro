import { describe, it, expect } from "vitest";
import { getProjects, getProjectStats } from "./projects";
import { getMunicipalities } from "./municipalities";

describe("projects", () => {
  it("has rows with id and title", () => {
    const all = getProjects();
    expect(all.length).toBeGreaterThan(100);
    for (const p of all) {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
    }
  });
  it("assigns only valid municipality slugs", () => {
    const slugs = new Set(getMunicipalities().map((m) => m.slug));
    for (const p of getProjects()) if (p.municipality) expect(slugs.has(p.municipality)).toBe(true);
  });
  it("unknown slug returns an empty list", () => {
    expect(getProjects("unknown-slug")).toEqual([]);
  });
  it("province-level rows are not attributed to a municipality", () => {
    const all = getProjects();
    const assigned = all.filter((p) => p.municipality).length;
    expect(getProjectStats().total).toBe(all.length);
    expect(getProjectStats().assigned).toBe(assigned);
  });
  it("ids are unique", () => {
    const ids = getProjects().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
