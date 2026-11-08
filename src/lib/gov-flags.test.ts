import { describe, expect, it } from "vitest";
import { buildFlags, DISCLAIMER, summarizeFlags, flagsForProject } from "./gov-flags";

const H = "high";
function doc(id: string, refNo: string, type: string, fields: Record<string, unknown>, conf: Record<string, string> = {}): any {
  const confidence: Record<string, string> = {};
  for (const k of Object.keys(fields)) confidence[k] = conf[k] ?? H;
  return { id, refNo, type, date: "2026-01-01", url: "https://x/" + id + ".pdf", pageCount: 1, fields, confidence, evidence: Object.keys(fields).map((f) => ({ field: f, page: 1, quote: `q ${f}` })) };
}
function proj(refNo: string, over: Record<string, unknown> = {}): any {
  return { refNo, title: "T " + refNo, town: "calapan", work: "road", stages: [], abc: null, contractPrice: null, contractor: null, bidType: null, firstDate: null, lastDate: null, stageDays: [], complete: false, ...over };
}
const stages = (...s: [string, string, string][]) => s.map(([type, id, date]) => ({ type, id, date }));

describe("price-over-abc", () => {
  const docs = [doc("itb-a", "CW1", "itb", { abc: 1000000 }), doc("noa-a", "CW1", "noa", { contractPrice: 1200000 })];
  const p = proj("CW1", { abc: 1000000, contractPrice: 1200000, stages: stages(["itb", "itb-a", "2026-01-01"], ["noa", "noa-a", "2026-02-01"]) });
  it("flags price above ABC with both docs as evidence", () => {
    const f = buildFlags([p], docs, { today: "2026-03-01" }).filter((x) => x.rule === "price-over-abc");
    expect(f).toHaveLength(1);
    expect(f[0].evidence.map((e) => e.docId).sort()).toEqual(["itb-a", "noa-a"]);
    expect(f[0].disclaimer).toBe(DISCLAIMER);
    expect(f[0].verify.length).toBeGreaterThan(1);
  });
  it("skips when confidence is not high", () => {
    const d2 = [docs[0], doc("noa-a", "CW1", "noa", { contractPrice: 1200000 }, { contractPrice: "medium" })];
    expect(buildFlags([p], d2, { today: "2026-03-01" }).filter((x) => x.rule === "price-over-abc")).toHaveLength(0);
  });
  it("no flag when equal or lower", () => {
    const d3 = [docs[0], doc("noa-a", "CW1", "noa", { contractPrice: 999999 })];
    expect(buildFlags([{ ...p, contractPrice: 999999 }], d3, { today: "2026-03-01" }).filter((x) => x.rule === "price-over-abc")).toHaveLength(0);
  });
});

describe("dates-out-of-order", () => {
  it("flags NOA dated before ITB", () => {
    const docs = [doc("itb-b", "CW2", "itb", { date: "2026-03-01" }), doc("noa-b", "CW2", "noa", { date: "2026-02-01" })];
    const p = proj("CW2", { stages: stages(["itb", "itb-b", "2026-03-01"], ["noa", "noa-b", "2026-02-01"]) });
    const f = buildFlags([p], docs, { today: "2026-04-01" }).filter((x) => x.rule === "dates-out-of-order");
    expect(f).toHaveLength(1);
    expect(f[0].evidence).toHaveLength(2);
  });
  it("ordered dates and low-confidence dates give nothing", () => {
    const ok = [doc("itb-b", "CW2", "itb", { date: "2026-01-01" }), doc("noa-b", "CW2", "noa", { date: "2026-02-01" })];
    const p = proj("CW2", { stages: stages(["itb", "itb-b", "2026-01-01"], ["noa", "noa-b", "2026-02-01"]) });
    expect(buildFlags([p], ok, { today: "2026-04-01" }).filter((x) => x.rule === "dates-out-of-order")).toHaveLength(0);
    const bad = [doc("itb-b", "CW2", "itb", { date: "2026-03-01" }), doc("noa-b", "CW2", "noa", { date: "2026-02-01" }, { date: "low" })];
    expect(buildFlags([p], bad, { today: "2026-04-01" }).filter((x) => x.rule === "dates-out-of-order")).toHaveLength(0);
  });
});

describe("single-bid", () => {
  const mk = (n: number, bt: string | null) => {
    const refNo = "CW" + n;
    return { p: proj(refNo, { bidType: bt, contractor: "Acme " + n, stages: stages(["noa", "noa-" + n, "2026-01-01"]) }), d: doc("noa-" + n, refNo, "noa", { bidType: bt }) };
  };
  it("flags each single-bid award (info) plus an aggregate share", () => {
    const xs = [mk(1, "single"), mk(2, "lowest"), mk(3, "single"), mk(4, "lowest")];
    const f = buildFlags(xs.map((x) => x.p), xs.map((x) => x.d), { today: "2026-03-01" }).filter((x) => x.rule === "single-bid");
    expect(f.filter((x) => x.id.startsWith("single-bid:CW"))).toHaveLength(2);
    const agg = f.find((x) => x.id === "single-bid:aggregate")!;
    expect(agg.severity).toBe("info");
    expect(agg.what).toContain("2 of 4");
    expect(f.every((x) => x.severity === "info")).toBe(true);
  });
  it("no flags when no single bids", () => {
    const xs = [mk(1, "lowest")];
    expect(buildFlags(xs.map((x) => x.p), xs.map((x) => x.d), { today: "2026-03-01" }).filter((x) => x.rule === "single-bid")).toHaveLength(0);
  });
});

describe("award-concentration", () => {
  const many = (n: number, other: number) => {
    const ps = [], ds = [];
    for (let i = 0; i < n + other; i++) {
      const c = i < n ? "Big Builders Inc." : "Other " + i;
      const refNo = "CW" + i;
      ps.push(proj(refNo, { contractor: c, contractPrice: 100, stages: stages(["noa", "noa-" + i, "2026-01-01"]) }));
      ds.push(doc("noa-" + i, refNo, "noa", { contractor: c, contractPrice: 100 }));
    }
    return { ps, ds };
  };
  it("8+ awards -> informational (never review), lists every award by business name only, careful wording", () => {
    const { ps, ds } = many(8, 100);
    const f = buildFlags(ps, ds, { today: "2026-03-01" }).filter((x) => x.rule === "award-concentration");
    expect(f).toHaveLength(1);
    expect(f[0].severity).toBe("info");
    expect(f[0].evidence).toHaveLength(8);
    expect(f[0].evidence.every((e) => e.quote === null)).toBe(true); // no officer or owner names are repeated
    expect(f[0].what.toLowerCase()).toContain("pattern to look at, not proof of anything");
  });
  it("15% share with fewer than 8 awards -> info; also matches case/punctuation variants", () => {
    const { ps, ds } = many(3, 7);
    ps[0].contractor = "BIG BUILDERS INC";
    ds[0].fields.contractor = "BIG BUILDERS INC";
    const f = buildFlags(ps, ds, { today: "2026-03-01" }).filter((x) => x.rule === "award-concentration");
    expect(f).toHaveLength(1);
    expect(f[0].severity).toBe("info");
    expect(f[0].evidence).toHaveLength(3);
  });
  it("below both thresholds -> nothing", () => {
    const { ps, ds } = many(2, 50);
    expect(buildFlags(ps, ds, { today: "2026-03-01" }).filter((x) => x.rule === "award-concentration")).toHaveLength(0);
  });
});

describe("no-award-listed", () => {
  const itb = doc("itb-z", "CW9", "itb", { date: "2026-01-01" });
  it("old ITB with no RESO/NOA -> info with careful wording", () => {
    const p = proj("CW9", { stages: stages(["itb", "itb-z", "2026-01-01"]) });
    const f = buildFlags([p], [itb], { today: "2026-06-01" }).filter((x) => x.rule === "no-award-listed");
    expect(f).toHaveLength(1);
    expect(f[0].severity).toBe("info");
    expect(f[0].what).toContain("not listed on the official page");
  });
  it("recent ITB or one with a NOA -> nothing", () => {
    const p = proj("CW9", { stages: stages(["itb", "itb-z", "2026-01-01"]) });
    expect(buildFlags([p], [itb], { today: "2026-03-01" }).filter((x) => x.rule === "no-award-listed")).toHaveLength(0);
    const p2 = proj("CW9", { stages: stages(["itb", "itb-z", "2026-01-01"], ["noa", "noa-z", "2026-02-01"]) });
    expect(buildFlags([p2], [itb], { today: "2026-06-01" }).filter((x) => x.rule === "no-award-listed")).toHaveLength(0);
  });
});

describe("ref-number-anomaly", () => {
  it("flags malformed ref numbers", () => {
    const f = buildFlags([proj("CW 20225")], [], { today: "2026-03-01" }).filter((x) => x.rule === "ref-number-anomaly");
    expect(f).toHaveLength(1);
  });
  it("does not flag well-formed ones", () => {
    expect(buildFlags([proj("CW2026 118"), proj("CW2025 284")], [], { today: "2026-03-01" })).toHaveLength(0);
  });
  it("does not flag the same project titled slightly differently per document", () => {
    const docs = [
      { ...doc("itb-1", "CW2026 001", "itb", {}), title: "IB NO CW2026 001 ITB Concreting of Road at Poblacion Calapan City" },
      { ...doc("noa-1", "CW2026 001", "noa", {}), title: "IB NO CW 2026 001 NOA Concreting of Road at Poblacion, Calapan" },
    ];
    expect(buildFlags([proj("CW2026 001")], docs, { today: "2026-03-01" })).toHaveLength(0);
  });
  it("flags the same refNo used for different titles", () => {
    const docs = [
      { ...doc("itb-1", "CW2026 001", "itb", {}), title: "IB NO CW2026 001 ITB Concreting of Road at Poblacion Calapan" },
      { ...doc("itb-2", "CW2026 001", "itb", {}), title: "IB NO CW2026 001 NOA Repair of School Building at Naujan" },
    ];
    const f = buildFlags([proj("CW2026 001")], docs, { today: "2026-03-01" }).filter((x) => x.rule === "ref-number-anomaly");
    expect(f).toHaveLength(1);
    expect(f[0].what).toContain("different titles");
  });
});

describe("helpers", () => {
  it("summarizeFlags / flagsForProject", () => {
    const docs = [doc("itb-a", "CW2026 001", "itb", { abc: 10 }), doc("noa-a", "CW2026 001", "noa", { contractPrice: 20 })];
    const p = proj("CW2026 001", { stages: stages(["itb", "itb-a", "2026-01-01"], ["noa", "noa-a", "2026-02-01"]) });
    const flags = buildFlags([p], docs, { today: "2026-03-01" });
    expect(summarizeFlags(flags).byRule["price-over-abc"]).toBe(1);
    expect(summarizeFlags(flags).bySeverity.review).toBe(1);
    expect(flagsForProject("CW2026 001", flags).length).toBe(1);
    expect(flagsForProject("NOPE", flags)).toEqual([]);
  });
});
