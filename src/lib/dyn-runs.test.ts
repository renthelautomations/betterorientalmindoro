import { describe, it, expect } from "vitest";
import { runs, span } from "./dyn-runs";

const c = (...s: (string | null)[]) => s.map((surname, i) => ({ year: 2001 + i * 3, surname }));
describe("runs", () => {
  it("merges consecutive same surnames", () => {
    const r = runs(c("Marco", "Marco", "Marco"));
    expect(r).toEqual([{ surname: "Marco", from: 2001, to: 2007, count: 3, tone: 0 }]);
    expect(span(r[0])).toBe("2001–2007");
  });
  it("a different surname starts a new run; a returning surname keeps its tone", () => {
    const r = runs(c("A", "B", "A"));
    expect(r.map((x) => x.tone)).toEqual([0, 1, 0]);
  });
  it("missing records are their own run with no tone", () => {
    const r = runs(c("A", null, null, "A"));
    expect(r.map((x) => [x.surname, x.count, x.tone])).toEqual([["A", 1, 0], [null, 2, -1], ["A", 1, 0]]);
  });
  it("single year span has no dash", () => expect(span({ from: 2010, to: 2010 })).toBe("2010"));
  it("empty in, empty out", () => expect(runs([])).toEqual([]));
});
