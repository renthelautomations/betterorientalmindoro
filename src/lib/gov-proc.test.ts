import { describe, expect, it } from "vitest";
import { ABC_SPEC, abcTotal, buildCards, countsByMonth, filterCards, funnel, groupFlags, mergeDocs, type Extracted, NO_FILTERS, php, plainTitle, slugRef, sortDocs, stageGaps, type Listed } from "./gov-proc";
import { getCard, getCards, getDoc, getDocs, neighbours, projectSlugs } from "./gov-proc-data";

const L = (id: string, type: string, ref: string | null, date: string | null, extra: Partial<Listed> = {}): Listed => ({ id, refNo: ref, type, title: `IB No. ${ref} ${type.toUpperCase()} Concreting of Road at X, Roxas`, date, url: "u", town: "roxas", work: "road", ...extra });
const listed = [L("itb-a", "itb", "CW2026 001", "2026-01-01"), L("noa-a", "noa", "CW2026 001", "2026-01-11"), L("itb-b", "itb", "CW2026 002", "2026-02-01"), L("ntp-x", "ntp", null, "2026-03-01")];
const ex: Extracted[] = [
  { id: "itb-a", ocr: true, fields: { abc: 1000 }, confidence: { abc: "high" } },
  { id: "noa-a", ocr: true, fields: { contractPrice: 900, contractor: "ACME" }, confidence: { contractPrice: "medium", contractor: "high" } },
  { id: "itb-b", ocr: true, fields: { abc: 500 }, confidence: { abc: "medium" } },
];
const docs = mergeDocs(listed, ex);
const cards = buildCards(docs, { "CW2026 002": 2 }, (s) => s.toUpperCase());

describe("gov-proc", () => {
  it("merges unread documents with empty facts", () => {
    expect(docs[3].ocr).toBe(false);
    expect(docs[3].fields).toEqual({});
  });
  it("groups by refNo, skips documents without one, newest first", () => {
    expect(cards.map((c) => c.refNo)).toEqual(["CW2026 002", "CW2026 001"]);
    expect(cards[1].title).toBe("Concreting of Road at X, Roxas");
  });
  it("keeps unknown amounts null and never zero", () => {
    expect(cards[1].abc).toEqual({ v: 1000, conf: "high" });
    expect(cards[1].price).toEqual({ v: 900, conf: "medium" });
    expect(buildCards(mergeDocs([L("n", "ntp", "CW2026 009", null)], []), {}, () => undefined)[0].abc).toBeNull();
    expect(php(null)).toBe("–");
  });
  it("totals use only high-confidence ABC", () => {
    expect(abcTotal(cards)).toEqual({ total: 1000, n: 1 });
  });
  it("funnel, months, gaps", () => {
    expect(funnel(cards).map((x) => x.n)).toEqual([2, 0, 1, 0, 0]);
    expect(countsByMonth(cards)).toEqual([{ key: "2026-01", n: 1 }, { key: "2026-02", n: 1 }]);
    expect(stageGaps(cards[1].stages)).toEqual([{ from: "itb", to: "noa", days: 10 }]);
  });
  it("filters", () => {
    expect(filterCards(cards, { ...NO_FILTERS, status: "waiting" }).map((c) => c.refNo)).toEqual(["CW2026 002"]);
    expect(filterCards(cards, { ...NO_FILTERS, flagged: true })).toHaveLength(1);
    expect(filterCards(cards, { ...NO_FILTERS, q: "acme" })).toHaveLength(1);
    expect(filterCards(cards, { ...NO_FILTERS, year: "2026", month: "02" })).toHaveLength(1);
  });
  it("sorts documents in the real stage order", () => {
    expect(sortDocs([{ type: "ntp", date: null, id: "c" }, { type: "coa", date: null, id: "b" }, { type: "noa", date: null, id: "a" }]).map((d) => d.id)).toEqual(["a", "b", "c"]);
  });
  it("strips the IB prefix and slugs refs", () => {
    expect(plainTitle("IB NO CW 2025 075 COA Completion of Building")).toBe("Completion of Building");
    expect(slugRef("CW2026 118 A")).toBe("CW2026-118-A");
  });
  it("splits aggregate flags", () => {
    const f = (rule: string, refNo?: string) => ({ rule, refNo } as never);
    expect(groupFlags([f("a", "x"), f("a")]).aggregate).toHaveLength(1);
  });
  it("ABC spec reads ITB first", () => expect(ABC_SPEC[0]).toEqual(["itb", "abc"]));
});

describe("gov-proc on the committed data", () => {
  it("every listed document is reachable and project slugs are unique", () => {
    const all = getDocs();
    expect(all.every((d) => getDoc(d.id))).toBe(true);
    expect(new Set(getCards().map((c) => c.slug)).size).toBe(getCards().length);
    expect(projectSlugs().every((s) => getCard(s))).toBe(true);
  });
  it("prev/next stay inside one project", () => {
    for (const c of getCards().slice(0, 40)) {
      const first = getDocs().find((d) => d.refNo === c.refNo)!;
      const n = neighbours(first.id);
      for (const x of [n.prev, n.next]) if (x) expect(x.refNo).toBe(c.refNo);
    }
  });
});

import { docConf, fieldValue } from "./gov-proc";
describe("document facts", () => {
  it("doc confidence", () => {
    expect(docConf({ fields: {}, confidence: {} })).toBeNull();
    expect(docConf({ fields: { a: 1, b: 2 }, confidence: { a: "high", b: "high" } })).toBe("high");
    expect(docConf({ fields: { a: 1, b: 2 }, confidence: { a: "high", b: "medium" } })).toBe("medium");
    expect(docConf({ fields: { a: 1 }, confidence: { a: "low" } })).toBe("low");
  });
  it("formats fields, null stays empty", () => {
    expect(fieldValue("abc", null)).toBeNull();
    expect(fieldValue("abc", 1234.5)).toEqual({ text: "₱1,234.50" });
    expect(fieldValue("bidType", "single")).toEqual({ key: "govb.val.single" });
    expect(fieldValue("completionDays", 31)).toEqual({ text: "31" });
  });
});
