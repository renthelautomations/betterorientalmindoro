import { describe, it, expect } from "vitest";
import { rank, didYouMean, groupByType, pushRecent, type SearchItem } from "./smart-search";

const items: SearchItem[] = [
  { type: "serbisyo", title: "PSA Birth Certificate", sub: "Opisyal na kopya ng birth certificate", href: "/s/psa" },
  { type: "serbisyo", title: "Burial Assistance (GSMAC)", sub: "Tulong para sa libing", href: "/s/burial" },
  { type: "hotline", title: "Bureau of Fire Protection", sub: "(043) 288 5617", href: "tel:+63432885617" },
  { type: "bayan", title: "Puerto Galera", sub: "Bayan", href: "/bayan/puerto-galera" },
  { type: "pahina", title: "Hotlines", kw: "tawag emergency numero", href: "/hotlines" },
];

describe("rank", () => {
  it("empty query returns nothing", () => expect(rank(items, "  ")).toEqual([]));
  it("prefix match", () => expect(rank(items, "puer")[0].href).toBe("/bayan/puerto-galera"));
  it("one typo still finds it", () => expect(rank(items, "certifcate")[0].href).toBe("/s/psa"));
  it("synonym across languages: sunog finds fire", () => expect(rank(items, "sunog")[0].href).toBe("tel:+63432885617"));
  it("synonym: burial finds libing text", () => expect(rank(items, "libing").map((i) => i.href)).toContain("/s/burial"));
  it("every word must match", () => expect(rank(items, "birth galera")).toEqual([]));
  it("accents and case are ignored", () => expect(rank(items, "PUÉRTO")[0].href).toBe("/bayan/puerto-galera"));
  it("uses the translated title when given", () => expect(rank(items, "tawag", (i) => (i.href === "/hotlines" ? "Mga hotline" : i.title))[0].href).toBe("/hotlines"));
});
describe("didYouMean", () => {
  it("fixes a misspelt word", () => expect(didYouMean(items, "galeera")).toBe("galera"));
  it("nothing to fix, nothing returned", () => expect(didYouMean(items, "galera")).toBeUndefined());
});
describe("groupByType / pushRecent", () => {
  it("groups in order of first hit", () => expect(groupByType(items).map(([t]) => t)).toEqual(["serbisyo", "hotline", "bayan", "pahina"]));
  it("recent: newest first, deduped, capped", () => {
    let l: ReturnType<typeof pushRecent> = [];
    for (const n of [1, 2, 3, 2, 4, 5, 6]) l = pushRecent(l, { title: String(n), href: "/" + n, type: "bayan" });
    expect(l.map((x) => x.title)).toEqual(["6", "5", "4", "2", "3"]);
  });
});
