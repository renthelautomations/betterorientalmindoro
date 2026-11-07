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

import { titleTown, assignTown } from "./dpwh-assign.mjs";

describe("dpwh assignment", () => {
  it("finds the town named in a title", () => {
    expect(titleTown("TAGUMPAY RIVER CONTROL, NAUJAN, ORIENTAL MINDORO")).toBe("naujan");
    expect(titleTown("ROAD, PUERTO GALERA")).toBe("puerto-galera");
    expect(titleTown("BRIDGE, SAN TEODORO")).toBe("san-teodoro");
    expect(titleTown("CITY ROAD, CALAPAN CITY")).toBe("calapan-city");
    expect(titleTown("PLAIN ROAD")).toBeUndefined();
  });
  it("coordinates and title agreeing assigns; disagreeing marks uncertain", () => {
    expect(assignTown({ xy: "naujan", title: "naujan", deo: true })).toEqual({ municipality: "naujan" });
    expect(assignTown({ xy: "calapan-city", title: "naujan", deo: true })).toEqual({ municipality: undefined, uncertain: true });
  });
  it("xy only, or title only from the Mindoro Oriental DEO", () => {
    expect(assignTown({ xy: "roxas", title: undefined, deo: false })).toEqual({ municipality: "roxas" });
    expect(assignTown({ xy: undefined, title: "gloria", deo: true })).toEqual({ municipality: "gloria" });
    expect(assignTown({ xy: undefined, title: "gloria", deo: false })).toEqual({ municipality: undefined });
  });
  it("no assigned row names a different town in its title (real data)", () => {
    const bad = getProjects().filter((p) => p.municipality && titleTown(p.title) && titleTown(p.title) !== p.municipality);
    expect(bad.map((p) => p.id)).toEqual([]);
  });
});

import { filterProjects, countsByYear, countsByStatus } from "./projects";

describe("project helpers", () => {
  const rows = getProjects();
  it("filters by bayan; rows without a municipality never match", () => {
    const baco = filterProjects(rows, { bayan: "baco" });
    expect(baco.length).toBeGreaterThan(0);
    expect(baco.every((p) => p.municipality === "baco")).toBe(true);
    expect(filterProjects(rows, { bayan: "nope" })).toEqual([]);
  });
  it("filters by year, status and text together", () => {
    const f = filterProjects(rows, { year: 2023, status: "Completed", q: "road" });
    expect(f.every((p) => p.year === 2023 && p.status === "Completed" && p.title.toLowerCase().includes("road"))).toBe(true);
  });
  it("aggregates keep every row", () => {
    expect(countsByYear(rows).reduce((n, [, c]) => n + c, 0)).toBe(rows.filter((p) => p.year != null).length);
    expect(countsByStatus(rows).reduce((n, [, c]) => n + c, 0)).toBe(rows.filter((p) => p.status).length);
  });
  it("carries coordinates and dates when the source has them", () => {
    expect(rows.some((p) => typeof p.lat === "number" && typeof p.lon === "number")).toBe(true);
    expect(rows.some((p) => p.start && p.end)).toBe(true);
  });
});
