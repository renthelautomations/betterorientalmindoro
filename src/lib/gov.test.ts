import { describe, expect, it } from "vitest";
import { eoYears, getCareers, getEo, getFacts, getInvestment, getNews, getOfficials, getProcurement, getReports, parseEo, procurementByMonth, procurementByTown, workClass, type Procurement } from "./gov";
import { getMunicipalities } from "./municipalities";

describe("workClass", () => {
  it.each([
    ["IB No. CW2026 118 ITB Concreting of Road at Mabuhay, Roxas", "road"],
    ["Construction of Bridge at Tagumpay, Bansud", "bridge"],
    ["Construction of Drainage System at Poblacion, Baco", "drainage"],
    ["Construction of Level II Water Supply at Dulangan, Bongabong", "water"],
    ["Completion of Multi Purpose Building at Proper Tiguisan, Bansud", "building"],
    ["Installation of Solar Streetlights at Masagana, Naujan", "other"],
    ["IB NO CW2026 066 RESO", "other"],
  ])("%s -> %s", (t, w) => expect(workClass(t)).toBe(w));
});

describe("parseEo", () => {
  it("reads number, year and optional letter", () => {
    expect(parseEo("Executive Order No. 61 Series of 2026")).toEqual({ number: 61, suffix: null, year: 2026 });
    expect(parseEo("Executive Order No.01 Series of 2024")).toEqual({ number: 1, suffix: null, year: 2024 });
    expect(parseEo("Executive Order No.16 A Series of 2024")).toEqual({ number: 16, suffix: "A", year: 2024 });
    expect(parseEo("something else")).toEqual({ number: null, suffix: null, year: null });
  });
});

const p = (o: Partial<Procurement>) => ({ id: "x", refNo: null, type: "itb", title: "t", date: null, url: null, town: null, work: "other", ...o }) as Procurement;
describe("procurement counts", () => {
  const items = [p({ town: "naujan", date: "2026-10-26" }), p({ town: "naujan", date: "2026-09-01", type: "noa" }), p({ town: null, date: "2026-10-01" }), p({ town: "baco" })];
  it("by town skips null towns", () => expect(procurementByTown(items)).toEqual({ naujan: 2, baco: 1 }));
  it("by town can filter by type", () => expect(procurementByTown(items, "noa")).toEqual({ naujan: 1 }));
  it("by month is sorted and skips undated rows", () => expect(procurementByMonth(items)).toEqual({ "2026-09": 1, "2026-10": 2 }));
  it("eoYears is newest first", () =>
    expect(eoYears([{ year: 2024 }, { year: 2026 }, { year: 2024 }, { year: null }] as never)).toEqual([{ year: 2026, n: 1 }, { year: 2024, n: 2 }]));
});

describe("snapshot", () => {
  it("every dataset has the { source, fetchedAt, items } shape and rows", () => {
    for (const d of [getProcurement(), getEo(), getReports(), getCareers(), getNews(), getOfficials(), getInvestment(), getFacts()]) {
      expect(d.source).toMatch(/^https:\/\/ormindoro\.gov\.ph/);
      expect(d.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.items.length).toBeGreaterThan(0);
    }
  });
  it("procurement: ISO dates, official PDF links, known towns, unique ids", () => {
    const { items } = getProcurement();
    const towns = new Set(getMunicipalities().map((m) => m.slug));
    expect(new Set(items.map((x) => x.id)).size).toBe(items.length);
    for (const x of items) {
      expect(x.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(x.url).toMatch(/^https:\/\/ormindoro\.gov\.ph\//);
      if (x.town) expect(towns.has(x.town)).toBe(true);
    }
  });
  it("EOs parse to number and year", () => {
    const { items } = getEo();
    expect(items.every((x) => x.number && x.year)).toBe(true);
    expect(new Set(items.map((x) => x.id)).size).toBe(items.length);
  });
  it("news is capped, plain and short", () => {
    const { items } = getNews();
    expect(items.length).toBeLessThanOrEqual(30);
    for (const x of items) {
      expect(["fil", "en"]).toContain(x.language);
      expect((x.summary ?? "").length).toBeLessThanOrEqual(200);
      expect(x.summary ?? "").not.toMatch(/<[a-z]/i);
    }
  });
  it("officials include the governor, vice governor and 10 board members", () => {
    const { items } = getOfficials();
    expect(items.filter((x) => x.kind === "governor")).toHaveLength(1);
    expect(items.filter((x) => x.kind === "vice-governor")).toHaveLength(1);
    expect(items.filter((x) => x.kind === "board-member")).toHaveLength(10);
  });
  it("investment sectors are numbered 1..n in order", () => expect(getInvestment().items.map((x) => x.n)).toEqual([1, 2, 3, 4, 5, 6]));
});
