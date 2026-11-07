import { describe, expect, it } from "vitest";
import { squarify } from "./Charts2";

describe("squarify", () => {
  const items = [{ label: "a", value: 50 }, { label: "b", value: 30 }, { label: "c", value: 15 }, { label: "d", value: 5 }];
  const rects = squarify(items, 400, 200);

  it("fills the box exactly", () => {
    const area = rects.reduce((s, r) => s + r.w * r.h, 0);
    expect(area).toBeCloseTo(400 * 200, 3);
  });
  it("gives each item area proportional to its value", () => {
    for (const r of rects) expect((r.w * r.h) / (400 * 200)).toBeCloseTo(r.item.value / 100, 3);
  });
  it("stays inside the box", () => {
    for (const r of rects) { expect(r.x).toBeGreaterThanOrEqual(-1e-6); expect(r.y).toBeGreaterThanOrEqual(-1e-6); expect(r.x + r.w).toBeLessThanOrEqual(400 + 1e-6); expect(r.y + r.h).toBeLessThanOrEqual(200 + 1e-6); }
  });
  it("drops zero-value items", () => {
    expect(squarify([{ label: "x", value: 0 }, { label: "y", value: 10 }], 100, 100)).toHaveLength(1);
  });
});
