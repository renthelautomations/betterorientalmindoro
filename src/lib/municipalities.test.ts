import { describe, it, expect } from "vitest";
import { getMunicipalities, getMunicipality, getBarangays } from "./municipalities";

describe("municipalities", () => {
  it("lists 14 municipalities plus Calapan City", () => {
    expect(getMunicipalities()).toHaveLength(15);
  });
  it("cleans names and slugs", () => {
    expect(getMunicipality("calapan-city")).toMatchObject({ name: "Calapan City", isCity: true });
    expect(getMunicipality("bulalacao")?.name).toBe("Bulalacao");
    expect(getMunicipality("puerto-galera")?.isCity).toBe(false);
  });
  it("returns undefined for an unknown slug", () => {
    expect(getMunicipality("nope")).toBeUndefined();
  });
  it("has 426 barangays across all 15", () => {
    const total = getMunicipalities().reduce((n, m) => n + getBarangays(m.pcode).length, 0);
    expect(total).toBe(426);
  });
  it("has unique slugs", () => {
    const s = getMunicipalities().map((m) => m.slug);
    expect(new Set(s).size).toBe(15);
  });
});
