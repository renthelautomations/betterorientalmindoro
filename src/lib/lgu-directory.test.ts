import { describe, it, expect } from "vitest";
import { getLguDirectory, groupOffices } from "./lgu-directory";
import { getMunicipalities } from "./municipalities";

describe("lgu directory", () => {
  const slugs = new Set([...getMunicipalities().map((m) => m.slug), "province"]);
  it("keys are the province or a real municipality, with source and date", () => {
    for (const s of ["province", "roxas", "bongabong", "pinamalayan", "san-teodoro", "gloria"]) {
      const d = getLguDirectory(s);
      expect(d, s).toBeDefined();
      expect(slugs.has(s)).toBe(true);
      expect(d!.source).toMatch(/^https?:\/\//);
      expect(d!.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("every office has a name and a phone or an email; emails look like emails", () => {
    for (const s of ["province", "roxas", "bongabong", "pinamalayan", "san-teodoro", "gloria"]) for (const o of getLguDirectory(s)!.offices) {
      expect(o.name).toBeTruthy();
      expect(o.phone.length + o.email.length, `${s}/${o.name}`).toBeGreaterThan(0);
      for (const e of o.email) expect(e).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]+$/i);
    }
  });
  it("unknown slug is undefined; grouping keeps every office", () => {
    expect(getLguDirectory("nope")).toBeUndefined();
    const d = getLguDirectory("bongabong")!;
    const g = groupOffices(d.offices);
    expect(g.kaligtasan.length + g.kalusugan.length + g.opisina.length).toBe(d.offices.length);
  });
});
