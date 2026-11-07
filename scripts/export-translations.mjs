// Writes docs/translation-review.csv: every interface string with both languages, for a native Filipino speaker to check.
// Run: node --experimental-strip-types scripts/export-translations.mjs
import { writeFileSync } from "node:fs";
import { BASE } from "../src/lib/i18n/dict/base.ts";
import { HOME } from "../src/lib/i18n/dict/home.ts";
import { BAYAN } from "../src/lib/i18n/dict/bayan.ts";
import { PROYEKTO } from "../src/lib/i18n/dict/proyekto.ts";
import { FINANCE } from "../src/lib/i18n/dict/finance.ts";
import { DYN } from "../src/lib/i18n/dict/dyn.ts";
import { ESTAT } from "../src/lib/i18n/dict/estat.ts";
import { DOCS } from "../src/lib/i18n/dict/docs.ts";
import { UXA } from "../src/lib/i18n/dict/uxa.ts";
import { UXB } from "../src/lib/i18n/dict/uxb.ts";
import { UXC } from "../src/lib/i18n/dict/uxc.ts";
import { UXD } from "../src/lib/i18n/dict/uxd.ts";

import { FAQ_EN, FAQ_FIL } from "../src/lib/faq.ts";
import { STORIES_EN, STORIES_FIL } from "../src/lib/stories.ts";

const FILES = [["base (kit)", BASE], ["home", HOME], ["bayan", BAYAN], ["proyekto", PROYEKTO], ["finance", FINANCE], ["dyn", DYN], ["estat", ESTAT], ["docs", DOCS], ["uxa", UXA], ["uxb", UXB], ["uxc", UXC], ["uxd", UXD]];
// Wording where a wrong word could read as an accusation or a claim about money: check these first.
const SENSITIVE = /allegation|paratang|proof|patunay|spending|nagastos|kinship|wrongdoing|pattern|unconfirmed|hindi kumpirm|not .*(official|accus)|draft/i;
const q = (s) => `"${s.replaceAll('"', '""')}"`;
const rows = [["file", "key", "english", "filipino", "sensitive", "reviewed", "corrected_filipino"].join(",")];
let n = 0, sens = 0;
for (const [f, d] of FILES) for (const [k, [en, fil]] of Object.entries(d)) {
  const s = SENSITIVE.test(en) || SENSITIVE.test(fil); n++; if (s) sens++;
  rows.push([f, k, q(en), q(fil), s ? "YES" : "", "", ""].join(","));
}
// Long-form copy that lives outside the dictionary: FAQ answers and the four stories.
const add = (f, k, en, fil) => { const s = SENSITIVE.test(en) || SENSITIVE.test(fil); n++; if (s) sens++; rows.push([f, k, q(en), q(fil), s ? "YES" : "", "", ""].join(",")); };
FAQ_EN.forEach((e, i) => { add("faq", `q${i + 1}`, e.q, FAQ_FIL[i].q); add("faq", `a${i + 1}`, e.a, FAQ_FIL[i].a); });
for (const k of Object.keys(STORIES_EN)) { add("stories", `${k}.title`, STORIES_EN[k].title, STORIES_FIL[k].title); STORIES_EN[k].paragraphs.forEach((p, i) => add("stories", `${k}.p${i + 1}`, p, STORIES_FIL[k].paragraphs[i] ?? "")); }
writeFileSync("docs/translation-review.csv", rows.join("\n") + "\n");
console.log(`${n} strings, ${sens} sensitive -> docs/translation-review.csv`);
