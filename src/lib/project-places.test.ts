import { describe, expect, it } from "vitest";
import { getTownBarangays, placesOf, projectsIn } from "./barangays";
import { getProjects } from "./projects";
import { namedBarangays } from "./project-places";

describe("which barangay a project is in", () => {
  const pin = getTownBarangays("pinamalayan");
  it("reads barangays named after Brgy., including a list and Sta./Sto. spellings", () => {
    const code = (n: string) => pin.find((b) => b.name === n)!.code;
    expect(namedBarangays("CONSTRUCTION - BRGY. QUINABIGAN, PINAMALAYAN", pin)).toEqual([code("Quinabigan")]);
    expect(new Set(namedBarangays("COASTAL ROADS BRGYS. ZONE II, ZONE III, QUINABIGAN, ZONE I", pin))).toEqual(new Set([code("Zone II (Pob.)"), code("Zone III (Pob.)"), code("Quinabigan"), code("Zone I (Pob.)")]));
    expect(namedBarangays("ROAD, BARANGAY SANTA ISABEL", pin)).toEqual([code("Sta. Isabel")]);
  });
  it("Zone I is not matched inside Zone II", () => {
    expect(namedBarangays("ROAD BRGY. ZONE II", pin)).toHaveLength(1);
  });
  it("a title with no Brgy. keyword names nothing, so the GPS point decides", () => {
    expect(namedBarangays("BRIDGE ALONG CALAPAN SOUTH ROAD, PINAMALAYAN", pin)).toEqual([]);
  });
  it("a long barangay name without the Brgy. keyword still counts; a short common word does not", () => {
    expect(namedBarangays("WIDENING OF PERMANENT BRIDGES - QUINABIGAN BR. ALONG CALAPAN SOUTH RD., PINAMALAYAN", pin)).toHaveLength(1);
    expect(namedBarangays("PILI SEEDS PROJECT ALONG ROAD", pin)).toEqual([]);
  });
  it("Quinabigan now holds the projects whose titles name it", () => {
    const q = pin.find((b) => b.name === "Quinabigan")!;
    expect(projectsIn(q).length).toBeGreaterThanOrEqual(4);
  });
  it("every project with a title barangay shows up in that barangay, and none appears in a barangay of another town", () => {
    for (const p of getProjects("pinamalayan")) for (const c of placesOf("pinamalayan").get(p.id)!.named) expect(projectsIn(pin.find((b) => b.code === c)!).some((x) => x.id === p.id)).toBe(true);
    for (const b of getTownBarangays("baco")) for (const p of projectsIn(b)) expect(p.municipality).toBe("baco");
  });
});
