import { describe, it, expect } from "vitest";
import { ICONS, isIconKey } from "./brand";

describe("brand", () => {
  it("has the four MaHalTaNa icons in order", () => {
    expect(Object.keys(ICONS)).toEqual(["ma", "hal", "ta", "na"]);
    expect(ICONS.ma.name).toBe("Mangyan");
    expect(ICONS.hal.name).toBe("Mount Halcon");
    expect(ICONS.ta.name).toBe("Tamaraw");
    expect(ICONS.na.name).toBe("Naujan Lake");
  });
  it("uses hex colors", () => {
    for (const i of Object.values(ICONS)) expect(i.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it("isIconKey guards slugs", () => {
    expect(isIconKey("ma")).toBe(true);
    expect(isIconKey("xyz")).toBe(false);
  });
});
