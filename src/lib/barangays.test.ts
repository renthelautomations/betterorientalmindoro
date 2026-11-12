import { describe, expect, it } from "vitest";
import { contains, getAllBarangays, getBarangay, getTownBarangays, inRing, projectsIn } from "./barangays";

describe("barangays", () => {
  const all = getAllBarangays();
  it("has all 426, each in a known town, with a unique slug per town", () => {
    expect(all).toHaveLength(426);
    expect(all.every((b) => b.town)).toBe(true);
    const keys = all.map((b) => `${b.town}/${b.slug}`);
    expect(new Set(keys).size).toBe(426);
  });
  it("finds a barangay by town and slug", () => {
    const b = getTownBarangays("baco")[0];
    expect(getBarangay("baco", b.slug)).toBe(b);
    expect(getBarangay("baco", "nope")).toBeUndefined();
  });
  it("ray casting: inside, outside", () => {
    const sq: [number, number][] = [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]];
    expect(inRing(1, 1, sq)).toBe(true);
    expect(inRing(3, 1, sq)).toBe(false);
  });
  it("a project is placed in at most one barangay of its own town", () => {
    const b = getTownBarangays("gloria")[0];
    for (const p of projectsIn(b)) expect(contains(b, p.lon!, p.lat!)).toBe(true);
  });
});
