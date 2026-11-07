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

import { cleanTitle, topCategories } from "./projects";

describe("cleanTitle", () => {
  it("sentence-cases but keeps codes and abbreviations", () => {
    expect(cleanTitle("CONSTRUCTION OF RC BRIDGE ALONG CALAPAN SOUTH ROAD K0103+000 - K0104+500, GAA 2025")).toBe(
      "Construction of RC bridge along Calapan south road K0103+000 - K0104+500, GAA 2025",
    );
  });
  it("keeps DPWH, roman numerals, bridge codes and dotted initials", () => {
    expect(cleanTitle("DPWH PHASE II CONCEPCION BR. (B00048MR) E.S.L.")).toBe("DPWH phase II concepcion br. (B00048MR) E.S.L.");
  });
  it("capitalises our place names", () => {
    expect(cleanTitle("ROAD, BRGY. METOLZA, NAUJAN, ORIENTAL MINDORO")).toBe("Road, brgy. metolza, Naujan, Oriental Mindoro");
    expect(cleanTitle("BRIDGE, PUERTO GALERA AND SAN TEODORO")).toBe("Bridge, Puerto Galera and San Teodoro");
    expect(cleanTitle("POLAR ROAD")).toBe("Polar road");
  });
  it("is stable on empty and already-clean input", () => {
    expect(cleanTitle("")).toBe("");
    expect(cleanTitle("Road")).toBe("Road");
  });
});

describe("topCategories", () => {
  it("returns the n most common categories", () => {
    const rows = [{ category: "A" }, { category: "B" }, { category: "B" }, {}] as never[];
    expect(topCategories(rows, 1)).toEqual(["B"]);
  });
});

import { hubHref, durationDays } from "./projects";

describe("hubHref", () => {
  it("keeps only set params and drops page 1", () => {
    expect(hubHref({})).toBe("/proyekto");
    expect(hubHref({ bayan: "baco", taon: "2024", q: "", page: 1 })).toBe("/proyekto?bayan=baco&taon=2024");
    expect(hubHref({ q: "road a", page: 3 })).toBe("/proyekto?q=road+a&page=3");
  });
});

describe("durationDays", () => {
  it("counts days between two ISO dates", () => {
    expect(durationDays("2023-03-24", "2023-06-01")).toBe(69);
    expect(durationDays("2023-01-01", "2023-01-01")).toBe(0);
  });
});

import { costBy, topByCost, type Project } from "./projects";

describe("cost helpers", () => {
  const r: Project[] = [
    { id: "a", title: "A", cost: 300, status: "Completed" },
    { id: "b", title: "B", cost: 100, status: "Completed" },
    { id: "c", title: "C", cost: 200 },
    { id: "d", title: "D", status: "On-Going" },
  ];
  it("costBy sums published cost per key, biggest first, unlabeled rows named, zero sums dropped", () => {
    expect(costBy(r, "status", "Walang katayuan")).toEqual([{ label: "Completed", value: 400 }, { label: "Walang katayuan", value: 200 }]);
  });
  it("topByCost keeps only rows with a cost, largest first", () => {
    expect(topByCost(r, 2).map((p) => p.id)).toEqual(["a", "c"]);
  });
});

import { projectDigest } from "./projects";
describe("projectDigest", () => {
  it("road work with stationing", () => {
    const d = projectDigest("Preventive maintenance along Calapan north road K0034+1169 - K0035+705, K0042+000 - K0043+000, San Teodoro - Puerto Galera,Oriental Mindoro");
    expect(d.headline).toBe("Preventive maintenance · Calapan North Road");
    expect(d.segments).toBe(2);
  });
  it("barangay work", () => {
    expect(projectDigest("Basic infrastructure program- flood mitigation structures- const. of road dike, bry. dulangan, pto. galera, Oriental Mindoro").headline).toBe("Flood control · Brgy. Dulangan");
  });
  it("no subject falls back", () => {
    expect(projectDigest("Puerto Galera biodiversity and environmental research and outreach center").headline).toBeUndefined();
  });
});
