import { describe, expect, it } from "vitest";
import { contestFigures, personKey, serviceRecord } from "./officials-record.mjs";

describe("personKey", () => {
  it("ignores case, punctuation and suffixes", () => {
    expect(personKey("Perez", "Antonio, Jr.")).toBe(personKey("PEREZ", "ANTONIO"));
    expect(personKey("Dela Cruz", "Ana")).toBe("DELACRUZ|ANA");
  });
});
describe("serviceRecord", () => {
  const w = (year: number, position: string, town: string | null = "baco") => ({ year, position, town });
  it("counts consecutive terms and lists earlier offices", () => {
    const r = serviceRecord([w(2013, "VICE MAYOR"), w(2016, "VICE MAYOR"), w(2019, "MAYOR"), w(2022, "MAYOR"), w(2025, "MAYOR")], 2025, "MAYOR");
    expect(r.streak).toBe(3);
    expect(r.years).toEqual([2019, 2022, 2025]);
    expect(r.earlier).toEqual([{ position: "VICE MAYOR", town: "baco", years: [2013, 2016] }]);
  });
  it("a gap ends the streak and the older wins become earlier", () => {
    const r = serviceRecord([w(2010, "MAYOR"), w(2013, "MAYOR"), w(2022, "MAYOR"), w(2025, "MAYOR")], 2025, "MAYOR");
    expect(r.streak).toBe(2);
    expect(r.earlier[0].years).toEqual([2010, 2013]);
  });
  it("first-time winner has streak 1 and nothing earlier", () => {
    expect(serviceRecord([w(2025, "COUNCILOR")], 2025, "COUNCILOR")).toMatchObject({ streak: 1, earlier: [] });
  });
});
describe("contestFigures", () => {
  const rows = [{ key: "A|X", name: "A X", party: "P", votes: 600 }, { key: "B|Y", name: "B Y", party: "Q", votes: 300 }, { key: "C|Z", name: "C Z", party: "R", votes: 100 }];
  it("single seat: share and runner-up", () => {
    const f = contestFigures(rows, ["A|X"]).get("A|X")!;
    expect(f.share).toBeCloseTo(0.6);
    expect(f.runnerUp?.votes).toBe(300);
  });
  it("single seat where the listed winner is not top by votes shows nothing", () => {
    expect(contestFigures(rows, ["C|Z"]).size).toBe(0);
  });
  it("multi seat: rank among candidates, only if winners are the top", () => {
    expect(contestFigures(rows, ["A|X", "B|Y"]).get("B|Y")).toEqual({ votes: 300, rank: 2, of: 3 });
    expect(contestFigures(rows, ["A|X", "C|Z"]).size).toBe(0);
  });
});
