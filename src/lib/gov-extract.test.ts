import { describe, expect, it } from "vitest";
import { buildProjects, extract, parseFigure, parseWords, reconcile, summarize } from "./gov-extract.mjs";

// Excerpts of real OCR output (run-together words and all). Officer names are replaced with a placeholder.
const ITB = `Republic ofthePhilippines
PROVINCIALGOVERNMENTOFORIENTALMINDORO
INVITATIONTOBIDFOR
CONCRETINGOFPROVINCIALROADATTAGBAKIN,POLA,ORIENTALMINDORO
1.TheProvincial Governmentof Oriental Mindoro(PGOM),through the 20%DF2025 intends to applythe sumof OneMillionOne
Hundred NinetyNineThousandThreeHundredFourPesos and37/100(Php1,199,304.37)beingtheApprovedBudgetfortheContract
(ABC)to payments under the contract for"Concreting of Provincial Road at Tagbakin,Pola, Oriental Mindoro (IB No.CW-2025-284)"
2.CompletionoftheWorks
is required 39calendardays.Bidders should have a contract similarto theProject.
7.BidsmustbedulyreceivedbytheBACSecretariatthroughmanual submissionattheofficeaddressas indicated belowonorbeforeJune
9, 2025 at 8:30 a.m.Late Bids shall not be accepted.
9. Bid opening shall be on June 9, 2025 at 9:00 a.m. at BAC Conference Room, Provincial Capitol Complex, Camilmil, Calapan City, Oriental Mindoro. Bids will be opened in the presence
(May 26,2025)
ATTY BAC CHAIRPERSON`;

const NOA = `NOTICE OF AWARD
September 15, 2026
MS. JUANA D. CRUZ
Proprietress
MARTINEZ ENTERPRISES
Lumangbayan, Calapan City, Oriental Mindoro
Dear Ma'am:
Pursuant to BAC Resolution No. 056 Series of 2026, we are happy to notify you that
the contract for the Concreting of Road at Sta. Rita is hereby awarded to your firm as the Bidder with the Single Calculated Responsive
Bid at a contract price equivalent to NINE HUNDRED NINETY FIVE THOUSAND SIXTY
NINE PESOS AND 79/100 ONLY (Php 995,069.79).
The project shall be completed within Thirty Two (32) calendar days, in accordance with`;

// the first line of the words was dropped by OCR: only the figure and the tail of the words survive
const NOA_PARTIAL = `NOTICEOFAWARD
September21,2026
MR.JUAN P.REYES
President/General Manager
SANLAHIGROUPOFBUILDERS,INC.
Masipit,CalapanCity,Oriental Mindoro
Dear Sir:
Pursuant to BAC Resolution No.055 Series of 2026, we are happy to notify you that
to your firm as the Bidder with the Lowest Calculated Responsive Bid at a contract
THREEHUNDRED
FIFTY
SEVEN
PESOS
49/100
ONLY
(Php 12,286,357.49).`;

const RESO = `BAC RESOLUTION DECLARING SINGLE CALCULATED RESPONSIVE BID (SCRB) AND RECOMMENDING APPROVAL OF AWARD OF THE CONTRACT
Resolution No. 056, Series of 2026
WHEREAS, one (1) prospective bidder/contractor submitted application
NOW, THEREFORE, We the Members of the Bids and Awards Committee, in our meeting on September 14, 2026
hereby RESOLVE, as it is hereby RESOLVED:
b)To recommend that Provincial Government of Oriental Mindoro represented by the Provincial Governor enter
intoa contract with MARTINEZENTERPRIZESfor Concretingof Road at Sta.Rita,CalapanCity,Oriental
at a contract price equivalent to NINE HUNDRED NINETY FIVE THOUSAND SIXTY NINE PESOS AND 79/100 ONLY (Php 995,069.79).`;

const RESO_FAIL = `BAC RESOLUTION DECLARING FAILURE OF BIDDING AND RECOMMENDING RE-ADVERTISEMENT
Resolution No. 012, Series of 2026
NOW, THEREFORE, in our meeting on March 3, 2026 hereby RESOLVE`;

const NTP = `NOTICETOPROCEED
0 3 JUL 2026
ENGR.JUAN P.REYES
AuthorizedManagingOfficer
NINEEIGHTCONSTRUCTION
BarangayMalad,CalapanCity,Oriental Mindoro
Dear Sir:
The attached Contract Agreement having been approved, notice is hereby given to NINE
EIGHT CONSTRUCTION that work mayproceed on the Installation of Streetlights at
Pinagsabangan Il, effective immediately upon the receipt of this Notice.
IB No. CW-2026-036`;

const CA = `PROVINCIALGOVERNMENTOF
Contract ID
:IBNo.CW-2026-082
CONTRACTAGREEMENT
0 9 OCT 2026
ThisCONTRACTexecutedon
-and-
WINKONSTRACT ENTERPRISES a company duly organized and existing
Approved Budget
Php7,298,455.53
for the Contract
Contract Duration
35calendardays
WHEREAS,theContractorsubmitted a responsivebid and was awardedthe
HUNDREDSEVENTYNINETHOUSANDNINEHUNDREDNINETYNINEPESOS
AND80/100ONLY(Php 7,279,999.80),hereinafter referredto as the"Contract Price."`;

const q = (r: any, f: string) => r.evidence.find((e: any) => e.field === f);

describe("number parsing", () => {
  it("parses figures with OCR noise", () => {
    expect(parseFigure("1,199,304.37")).toBe(1199304.37);
    expect(parseFigure("5,oo0.0o")).toBe(5000);
    expect(parseFigure("l,0O0")).toBe(1000);
  });
  it("parses amounts in words (spaces removed, centavos as n/100)", () => {
    expect(parseWords("OneMillionOneHundredNinetyNineThousandThreeHundredFourPesosand37/100")).toBe(1199304.37);
    expect(parseWords("NINEHUNDREDNINETYFIVETHOUSANDSIXTYNINEPESOSAND79/100ONLY")).toBe(995069.79);
    expect(parseWords("blah")).toBeNull();
  });
});

describe("ITB", () => {
  const r = extract("itb", [ITB]);
  it("reads the key fields", () => {
    expect(r.fields).toMatchObject({ abc: 1199304.37, abcWords: 1199304.37, completionDays: 39, ibNumber: "CW-2025-284", fundingSource: "20%DF2025", bidDeadline: "2025-06-09T08:30", bidOpening: "2025-06-09T09:00", date: "2025-05-26", procuringEntity: "Provincial Government of Oriental Mindoro" });
    expect(r.fields.location).toContain("BAC Conference Room");
  });
  it("is high confidence when figure and words agree, with a short quote", () => {
    expect(r.confidence.abc).toBe("high");
    expect(q(r, "abc").quote.length).toBeLessThanOrEqual(160);
    expect(q(r, "abc").quote).toContain("1,199,304.37");
  });
  it("downgrades when figure and words disagree", () => {
    const bad = extract("itb", [ITB.replace("1,199,304.37", "1,199,904.37")]);
    expect(bad.fields.abc).toBe(1199904.37);
    expect(bad.confidence.abc).toBe("low");
  });
  it("never invents a missing amount", () => {
    const cut = extract("itb", [ITB.replace(/1\.TheProvincial[\s\S]*?\(ABC\)/, "")]);
    expect(cut.fields.abc).toBeNull();
    expect(cut.confidence.abc).toBeNull();
  });
});

describe("NOA", () => {
  const r = extract("noa", [NOA]);
  it("reads price (figure + words agree), bid type, resolution, awardee", () => {
    expect(r.fields).toMatchObject({ contractPrice: 995069.79, bidType: "single", resolutionNo: "056", resolutionSeries: 2026, date: "2026-09-15", contractor: "MARTINEZ ENTERPRISES", officer: "MS. JUANA D. CRUZ", officerTitle: "Proprietress", completionDays: 32 });
    expect(r.confidence.contractPrice).toBe("high");
    expect(r.confidence.bidType).toBe("high");
  });
  it("truncated words give medium confidence, and the title line is not taken as the company", () => {
    const p = extract("noa", [NOA_PARTIAL]);
    expect(p.fields.contractPrice).toBe(12286357.49);
    expect(p.confidence.contractPrice).toBe("medium");
    expect(p.fields.contractor).toBe("SANLAHIGROUPOFBUILDERS,INC.");
    expect(p.fields.bidType).toBe("lowest");
  });
  it("mismatching words and figure are low", () => {
    const bad = extract("noa", [NOA.replace("995,069.79", "985,069.79")]);
    expect(bad.confidence.contractPrice).toBe("low");
  });
});

describe("RESO", () => {
  it("award recommendation", () => {
    const r = extract("reso", [RESO]);
    expect(r.fields).toMatchObject({ resolutionNo: "056", resolutionSeries: 2026, kind: "award", recommendsAward: true, winner: "MARTINEZENTERPRIZES", bidAmount: 995069.79, date: "2026-09-14", biddersCount: 1 });
  });
  it("failure of bidding", () => {
    const r = extract("reso", [RESO_FAIL]);
    expect(r.fields).toMatchObject({ kind: "failure", recommendsAward: false, winner: null, bidAmount: null, date: "2026-03-03" });
  });
});

describe("NTP", () => {
  it("reads date stamp, contractor, effectivity; leaves unknowns null", () => {
    const r = extract("ntp", [NTP]);
    expect(r.fields).toMatchObject({ date: "2026-07-03", effectivity: "immediately upon receipt", startDate: null, calendarDays: null, ibNumber: "CW-2026-036" });
    expect(r.fields.contractor).toBe("NINE EIGHT CONSTRUCTION");
    expect(r.confidence.date).toBe("medium");
  });
});

describe("COA = contract agreement", () => {
  it("reads executed date, contractor, price, ABC, duration", () => {
    const r = extract("coa", [CA]);
    expect(r.fields).toMatchObject({ documentKind: "contract-agreement", date: "2026-10-09", contractor: "WINKONSTRACT ENTERPRISES", abc: 7298455.53, completionDays: 35, ibNumber: "CW-2026-082" });
    expect(r.fields.contractPrice).toBe(7279999.8);
  });
});

import { projectFromTitle } from "./gov-extract.mjs";
describe("projectFromTitle", () => {
  it("strips the IB prefix, lot letter and type word", () => {
    expect(projectFromTitle("IB NO CW2025 306 B Concreting of Provincial Road at Baras, Baco")).toBe("Concreting of Provincial Road at Baras, Baco");
    expect(projectFromTitle("IB No. CW2026 118 ITB Concreting of Road at Mabuhay")).toBe("Concreting of Road at Mabuhay");
    expect(projectFromTitle("IB NO CW2026 036 CA")).toBeNull();
  });
});

describe("reconcile, projects and summaries", () => {
  const mk = (id: string, type: string, refNo: string, date: string, ex: any, title = "IB NO CW2026 071 X Concreting of Road at Sta. Rita, Calapan City") => ({ id, type, refNo, date, title, town: "calapan", work: "road", ocr: true, ...ex });
  const items = [
    mk("itb-1", "itb", "CW2026 071", "2026-08-28", extract("itb", [ITB])),
    mk("reso-1", "reso", "CW2026 071", "2026-09-14", extract("reso", [RESO])),
    mk("noa-1", "noa", "CW2026 071", "2026-09-15", extract("noa", [NOA])),
    mk("ntp-1", "ntp", "CW2026 071", "2026-09-24", { fields: { contractor: "MARTINEZ ENTERPRISES" }, confidence: { contractor: "medium" } }),
  ];
  it("two documents naming the same contractor raise both to high", () => {
    expect(items[2].confidence.contractor).toBe("medium");
    reconcile(items);
    expect(items[2].confidence.contractor).toBe("high");
    expect(items[1].confidence.winner).toBe("high");
  });
  it("groups into a project chain with stage gaps", () => {
    const [p] = buildProjects(items, items);
    expect(p.refNo).toBe("CW2026 071");
    expect(p.stages.map((s: any) => s.type)).toEqual(["itb", "reso", "noa", "ntp"]);
    expect(p.stageDays.map((s: any) => s.days)).toEqual([17, 1, 9]);
    expect(p.contractPrice).toBe(995069.79);
    expect(p.abc).toBe(1199304.37);
    expect(p.bidType).toBe("single");
    expect(p.complete).toBe(false); // no contract agreement
  });
  it("summaries use only extracted fields and drop null clauses", () => {
    const s = summarize(items[2]);
    expect(s.en).toContain("Notice of award");
    expect(s.en).toContain("PHP 995,069.79");
    expect(s.en).toContain("Single Calculated Responsive Bid");
    expect(s.fil).toContain("Abiso ng pagkakaloob");
    const empty = summarize({ type: "noa", refNo: "X", title: "", fields: { contractPrice: null }, confidence: {} });
    expect(empty.en).toBe("Notice of award.");
    expect(summarize({ type: "noa", fields: { contractPrice: 5 }, confidence: { contractPrice: "low" } } as any).en).not.toContain("PHP");
  });
});
