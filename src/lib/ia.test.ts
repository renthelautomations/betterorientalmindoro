import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GROUPS, OUTSIDE, groupOf } from "./ia";

// Every static page under src/app, as a route. Dynamic ([x]) pages are details of their parent.
function routes(dir = join(process.cwd(), "src/app"), base = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory() || name.startsWith("[") || name === "design-kit") continue;
    const r = `${base}/${name}`;
    if (readdirSync(p).includes("page.tsx")) out.push(r);
    out.push(...routes(p, r));
  }
  return out;
}

describe("site structure (src/lib/ia.ts)", () => {
  const all = routes();
  it("every page belongs to a group or is a footer page", () => {
    const lost = all.filter((r) => !groupOf(r) && !OUTSIDE.includes(r));
    expect(lost).toEqual([]);
  });
  it("every menu link goes to a page that exists", () => {
    const known = new Set(["/", ...all]);
    const dead = GROUPS.flatMap((g) => [g.landing, ...g.items.map((i) => i.href)]).map((h) => h.split("#")[0] || "/").filter((h) => !known.has(h));
    expect(dead).toEqual([]);
  });
  it("every group page is reachable from its group's items", () => {
    const linked = new Set(GROUPS.flatMap((g) => [g.landing, ...g.items.map((i) => i.href.split("#")[0])]));
    const hidden = all.filter((r) => groupOf(r) && !linked.has(r) && !OUTSIDE.includes(r));
    expect(hidden).toEqual([]);
  });
  it("a path belongs to the group with the longest matching prefix", () => {
    expect(groupOf("/pamahalaan/bidding/x")?.id).toBe("money");
    expect(groupOf("/pamahalaan")?.id).toBe("records");
    expect(groupOf("/bayan/baco/alag-001")?.id).toBe("towns");
  });
});
