import { describe, it, expect } from "vitest";
import { getLguContact } from "./lgu-contacts";
import { getMunicipalities } from "./municipalities";
import { getHotlines } from "./hotlines";

describe("lgu contacts", () => {
  it("every municipality and the province has a contact entry with a source", () => {
    for (const slug of [...getMunicipalities().map((m) => m.slug), "province"]) {
      const c = getLguContact(slug);
      expect(c, slug).toBeDefined();
      expect(c!.source).toMatch(/^https?:\/\//);
      expect(c!.email.length, slug).toBeGreaterThan(0);
      for (const e of c!.email) expect(e).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]+$/i);
      for (const f of c!.facebook) expect(f.url).toMatch(/^https:\/\/www\.facebook\.com\//);
    }
  });
  it("unknown slug gives undefined", () => expect(getLguContact("nope")).toBeUndefined());
  it("every municipality has a confirmed local DRRM hotline", () => {
    for (const m of getMunicipalities()) expect(getHotlines(m.slug).some((h) => h.confirmed), m.slug).toBe(true);
  });
});
