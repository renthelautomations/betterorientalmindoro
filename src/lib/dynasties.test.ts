import { describe, it, expect } from "vitest";
import { allWinners, findWinners, getProvince, getTown, surnameOf, titleCase, sharedSurnames, provinceSurnames, winnersGrid, surnameHolders, surnameNetwork, type Contest } from "./dynasties";
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

describe("winnersGrid", () => {
  const contests = [
    c(2025, "MAYOR", w("a", "REYES, ANA")),
    c(2022, "VICE MAYOR", w("b", "SANTOS, BEN")),
    c(2022, "MAYOR", w("a", "REYES, ANA")),
    c(2025, "COUNCILOR", w("c", "CRUZ, CY")),
  ];
  it("makes mayor and vice mayor rows over ascending election years, empty cells where no record", () => {
    const g = winnersGrid(contests);
    expect(g.years).toEqual([2022, 2025]);
    expect(g.rows.map((r) => r.position)).toEqual(["MAYOR", "VICE MAYOR"]);
    expect(g.rows[0].cells.map((x) => x.winners.map((y) => y.id))).toEqual([["a"], ["a"]]);
    expect(g.rows[1].cells.map((x) => x.winners.length)).toEqual([1, 0]);
  });
  it("uses the given years so towns line up", () => {
    expect(winnersGrid(contests, [2019, 2022]).rows[0].cells.map((x) => x.winners.length)).toEqual([0, 1]);
  });
});

describe("surnameHolders", () => {
  it("lists every win under a surname with town, year, seat, newest first", () => {
    const t = (slug: string, ...cs: Contest[]) => ({ slug, upstream: [], contests: cs });
    const rows = surnameHolders([t("x", c(2019, "MAYOR", w("a", "REYES, ANA"))), t("y", c(2022, "COUNCILOR", w("b", "REYES, BEN"), w("c", "CRUZ, CY")))], "REYES");
    expect(rows.map((r) => [r.town, r.year, r.position, r.id])).toEqual([["y", 2022, "COUNCILOR", "b"], ["x", 2019, "MAYOR", "a"]]);
  });
});

describe("surnameNetwork", () => {
  const t = (slug: string, ...cs: Contest[]) => ({ slug, upstream: [], contests: cs });
  const A = t("a", c(2022, "COUNCILOR", w("1", "REYES, A"), w("2", "REYES, B"), w("3", "SANTOS, C"), w("4", "SANTOS, D")));
  const B = t("b", c(2022, "COUNCILOR", w("5", "REYES, E"), w("6", "REYES, F"), w("7", "SANTOS, G"), w("8", "SANTOS, H")));
  const C = t("c", c(2022, "COUNCILOR", w("9", "REYES, I"), w("10", "REYES, J")));
  const D = t("d", c(2022, "COUNCILOR", w("11", "REYES, K"), w("12", "LIM, L")));
  it("links towns that each have a surname held by 2+ people; weight = shared surnames", () => {
    const e = surnameNetwork([A, B, C, D]);
    expect(e.find((x) => x.a === "a" && x.b === "b")).toMatchObject({ weight: 2, surnames: ["REYES", "SANTOS"] });
    expect(e.find((x) => x.a === "a" && x.b === "c")).toMatchObject({ weight: 1, surnames: ["REYES"] });
  });
  it("one holder in a town does not link it", () => expect(surnameNetwork([A, D]).length).toBe(0));
});

describe("findWinners", () => {
  const towns = getProvince().towns.map((s) => getTown(s)!).filter(Boolean);
  const rows = allWinners(towns);
  it("finds a surname across towns, newest first", () => {
    const r = findWinners(rows, "hernandez");
    expect(r.length).toBeGreaterThan(5);
    expect(r.every((x, i) => i === 0 || r[i - 1][1] >= x[1])).toBe(true);
  });
  it("one typo ok, year and seat narrow", () => {
    expect(findWinners(rows, "hernandes").length).toBeGreaterThan(0);
    expect(findWinners(rows, "", 2022, "MAYOR").length).toBe(15);
  });
  it("nonsense gives none", () => expect(findWinners(rows, "zzzzqq")).toEqual([]));
});
