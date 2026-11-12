import { describe, it, expect } from "vitest";
import { byProgram, byTown, filterRows, getBasket, getRows, pageOf, programOf, totals, type Row } from "./redflags";

const r = (o: Partial<Row>): Row => ({ id: "x", dataset: "dpwh", title: "Road, Baco, Oriental Mindoro", program: "Convergence and Special Support Program", pap: null, office: null, town: "baco", group: "unchanged", held: false, flags: [], nep: 100, house: 100, delta: 0, pages: { nep: null, house: null }, url: "u", ...o });

describe("totals", () => {
  it("keeps NEP and House apart and counts House-only rows and unconfirmed matches", () => {
    const t = totals([r({}), r({ group: "house_only", nep: null, house: 50, held: true }), r({ group: "nep_only", nep: 30, house: null })]);
    expect(t).toEqual({ projects: 3, nep: 130, house: 150, houseOnly: 1, held: 1 });
  });
  it("empty is zero projects, not a crash", () => expect(totals([]).projects).toBe(0));
});
describe("programOf / byProgram / byTown", () => {
  it("dpwh rows use their program, other datasets their key", () => { expect(programOf(r({}))).toBe("Convergence and Special Support Program"); expect(programOf(r({ dataset: "fmr", program: "x" }))).toBe("fmr"); });
  it("sorts programs by House amount, towns by project count", () => {
    const rows = [r({ house: 10 }), r({ dataset: "fmr", house: 999 }), r({ town: "pola" }), r({ town: "pola" })];
    expect(byProgram(rows)[0].program).toBe("fmr");
    expect(byTown(rows)[0]).toMatchObject({ town: "baco" });
  });
});
describe("filterRows / pageOf", () => {
  const rows = [r({ title: "Bridge at Pola" , town: "pola", group: "house_only" }), r({ title: "Road at Baco" }), r({ dataset: "hfep", program: null, title: "Hospital" })];
  it("filters by group, program, town and words (accent- and case-insensitive)", () => {
    expect(filterRows(rows, { group: "house_only" })).toHaveLength(1);
    expect(filterRows(rows, { program: "hfep" })).toHaveLength(1);
    expect(filterRows(rows, { town: "baco" })).toHaveLength(2);
    expect(filterRows(rows, { q: "BRIDGE pola" })).toHaveLength(1);
  });
  it("pages and clamps", () => { const p = pageOf([1, 2, 3, 4, 5], 9, 2); expect(p).toEqual({ page: 3, last: 3, rows: [5] }); expect(pageOf([], 1).last).toBe(1); });
});
describe("real data", () => {
  it("every row has an id, a title and a source link; amounts are numbers or null", () => {
    for (const x of getRows()) { expect(x.id && x.title && x.url).toBeTruthy(); for (const k of [x.nep, x.house]) expect(k === null || typeof k === "number").toBe(true); }
  });
  it("the basket groups carry both versions and are attributed", () => { const b = getBasket(); expect(b.by).toMatch(/Coalition/); for (const g of b.groups) { expect(g.nepB).toBeGreaterThan(0); expect(g.houseB).toBeGreaterThan(0); } });
});
