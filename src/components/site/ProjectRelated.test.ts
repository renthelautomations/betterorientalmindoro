import { describe, expect, it } from "vitest";
import { relatedProjects } from "./ProjectRelated";

const P = (id: string, municipality?: string, category?: string, cost?: number) => ({ id, title: id, municipality, category, cost });

describe("relatedProjects", () => {
  const me = P("me", "a", "road");
  it("orders same town+category, then town, then category; excludes self and unrelated", () => {
    const all = [me, P("x", "z", "other", 9), P("cat", "b", "road", 5), P("town", "a", "other", 5), P("both", "a", "road", 1)];
    expect(relatedProjects(all, me).map((q) => q.id)).toEqual(["both", "town", "cat"]);
  });
  it("limits and sorts by cost within a tier", () => {
    const all = [me, P("1", "a", "road", 1), P("2", "a", "road", 3), P("3", "a", "road", 2)];
    expect(relatedProjects(all, me, 2).map((q) => q.id)).toEqual(["2", "3"]);
  });
  it("no town/category means no matches by that field", () => {
    const bare = P("bare");
    expect(relatedProjects([bare, P("o")], bare)).toEqual([]);
  });
});
