import { describe, expect, it } from "vitest";
import { DICT } from "./dict";

describe("EN/FIL dictionary", () => {
  const entries = Object.entries(DICT) as [string, readonly [string, string]][];
  it("has a non-empty English and Filipino string for every key", () => {
    for (const [k, [en, fil]] of entries) { expect(en.trim(), k).not.toBe(""); expect(fil.trim(), k).not.toBe(""); }
  });
  it("has caption keys for both scenes, three steps each", () => {
    for (const scene of ["hal", "na"]) for (const n of [1, 2, 3]) for (const part of ["h", "p"]) expect(DICT, `scene.${scene}.${n}.${part}`).toHaveProperty(`scene.${scene}.${n}.${part}`);
  });
  it("does not leave an English sentence untranslated", () => {
    // Longer strings that are identical in both languages are almost certainly a missed translation.
    for (const [k, [en, fil]] of entries) if (en.length > 24) expect(fil, k).not.toBe(en);
  });
});
