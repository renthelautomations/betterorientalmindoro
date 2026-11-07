import { describe, it, expect } from "vitest";
import { getProvince, getTown, surnameOf, titleCase, sharedSurnames, provinceSurnames, type Contest } from "./dynasties";
import { getMunicipalities } from "./municipalities";

const w = (id: string, ballot: string) => ({ id, name: ballot, ballot, party: "IND", votes: 1 });
const c = (year: number, position: string, ...ws: ReturnType<typeof w>[]): Contest => ({ year, position, seats: ws.length, candidates: ws.length, uncontested: false, margin: null, winners: ws });

describe("names", () => {
  it("surnameOf reads the ballot name before the comma", () => {
    expect(surnameOf("ROLDAN, ALLAN")).toBe("ROLDAN");
    expect(surnameOf("DE LA CRUZ, JUAN")).toBe("DE LA CRUZ");
    expect(surnameOf("")).toBe("");
  });
  it("titleCase", () => expect(titleCase("DE LA CRUZ, JUAN")).toBe("De La Cruz, Juan"));
});

describe("sharedSurnames", () => {
  it("counts only surnames held by 2+ different people; one re-elected person is not a pattern", () => {
    const rows = sharedSurnames([
      c(2022, "MAYOR", w("a", "REYES, ANA")),
      c(2025, "MAYOR", w("a", "REYES, ANA")),
      c(2022, "COUNCILOR", w("b", "REYES, BEN"), w("c", "SANTOS, CARLA")),
      c(2025, "VICE MAYOR", w("d", "SANTOS, DIEGO")),
    ]);
    expect(rows.map((r) => r.surname)).toEqual(["REYES", "SANTOS"]);
    expect(rows[0]).toMatchObject({ surname: "REYES", seats: 3, people: 2, years: [2022, 2025] });
  });
  it("empty and unnamed input give no rows", () => {
    expect(sharedSurnames([])).toEqual([]);
    expect(sharedSurnames([c(2025, "MAYOR", w("a", ""), w("b", ""))])).toEqual([]);
  });
});

describe("provinceSurnames", () => {
  it("aggregates across towns with a town count, sorted by seats, limited", () => {
    const rows = provinceSurnames(
      [
        { slug: "x", upstream: [], contests: [c(2025, "COUNCILOR", w("a", "PEREZ, A"), w("b", "PEREZ, B"))] },
        { slug: "y", upstream: [], contests: [c(2025, "MAYOR", w("c", "PEREZ, C")), c(2025, "MAYOR", w("d", "LIM, D"))] },
      ],
      1,
    );
    expect(rows).toEqual([{ surname: "PEREZ", seats: 3, people: 3, towns: 2, years: [2025] }]);
  });
});

describe("snapshot data", () => {
  it("province has elections and license", () => {
    const p = getProvince();
    expect(p.elections.length).toBeGreaterThan(5);
    expect(p.license).toMatch(/CC0/);
  });
  it("every municipality has a town file with contests", () => {
    for (const m of getMunicipalities()) expect(getTown(m.slug)?.contests.length, m.slug).toBeGreaterThan(0);
  });
  it("unknown town is undefined", () => expect(getTown("atlantis")).toBeUndefined());
});
