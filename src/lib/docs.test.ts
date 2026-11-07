import { describe, expect, it } from "vitest";
import { FAQ_EN, FAQ_FIL } from "./faq";
import { STORIES_EN, STORIES_FIL } from "./stories";
import { ICON_KEYS } from "./brand";
import { DICT } from "./i18n/dict";

describe("long-form documents have both language versions", () => {
  it("FAQ: same count, non-empty, and translated", () => {
    expect(FAQ_FIL.length).toBe(FAQ_EN.length);
    FAQ_EN.forEach((e, i) => { const f = FAQ_FIL[i]; for (const s of [e.q, e.a, f.q, f.a]) expect(s.trim()).not.toBe(""); expect(f.q).not.toBe(e.q); expect(f.a).not.toBe(e.a); });
  });
  it("stories: every pillar has EN and FIL with matching shape", () => {
    for (const k of ICON_KEYS) {
      const e = STORIES_EN[k], f = STORIES_FIL[k];
      expect(f.paragraphs.length, k).toBe(e.paragraphs.length);
      expect(f.draft, k).toBe(e.draft);
      expect(!!f.link, k).toBe(!!e.link);
      for (const s of [...e.paragraphs, ...f.paragraphs, e.title, f.title]) expect(s.trim()).not.toBe("");
      for (const p of ["name", "blurb"]) expect(DICT, `docs.${p}.${k}`).toHaveProperty(`docs.${p}.${k}`);
    }
  });
});
