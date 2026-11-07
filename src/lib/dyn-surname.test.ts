import { describe, it, expect } from "vitest";
import { surnameStory, type Holder } from "./dyn-surname";

const h = (town: string, year: number, position: string, id: string, name = id): Holder => ({ town, year, position, id, name });
const rows = [h("baco", 2019, "COUNCILOR", "a"), h("baco", 2022, "COUNCILOR", "a"), h("baco", 2022, "MAYOR", "b"), h("pola", 2022, "COUNCILOR", "c")];

describe("surnameStory", () => {
  const s = surnameStory(rows);
  it("counts wins per election by seat, oldest first", () => {
    expect(s.byYear.map((y) => y.year)).toEqual([2019, 2022]);
    expect(s.byYear[1]).toMatchObject({ MAYOR: 1, COUNCILOR: 2, "VICE MAYOR": 0 });
    expect(s.maxYear).toBe(3);
  });
  it("ranks towns by wins", () => expect(s.byTown).toEqual([{ town: "baco", n: 3 }, { town: "pola", n: 1 }]));
  it("groups wins by person, most wins first, years ascending", () => {
    expect(s.people.map((p) => [p.id, p.wins.length])).toEqual([["a", 2], ["b", 1], ["c", 1]]);
    expect(s.people[0].wins.map((w) => w.year)).toEqual([2019, 2022]);
  });
  it("empty in, safe out", () => expect(surnameStory([])).toMatchObject({ byYear: [], byTown: [], people: [], maxYear: 1 }));
});
