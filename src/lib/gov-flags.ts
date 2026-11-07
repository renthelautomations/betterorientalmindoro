// Rule engine over projects.json + procurement-docs.json. Pure; no I/O except the default JSON for the two lookup helpers.
// Every rule fires ONLY when all fields it needs have "high" confidence. Flags are prompts to check a document, never findings.
// Legal note: RA 12009 (New Government Procurement Act, 2024) supersedes RA 9184 for new procurements; older ITBs still cite RA 9184.
// relative path + import attribute so the extract script can load this file with `node --experimental-strip-types`
import flagsJson from "../data/gov/flags.json" with { type: "json" };

export type Severity = "info" | "review";
export type Confidence = "high" | "medium" | "low";
export type FlagEvidence = { docId: string; page: number | null; quote: string; value: string | number | null };
export type Flag = {
  id: string;
  rule: string;
  severity: Severity;
  title: string;
  what: string;
  evidence: FlagEvidence[];
  verify: string[];
  references: { label: string; url: string }[];
  confidence: Confidence;
  disclaimer: string;
  refNo?: string;
};
export type GovDoc = {
  id: string;
  refNo: string;
  type: string;
  title?: string;
  date?: string | null;
  url?: string;
  fields: Record<string, any>;
  confidence: Record<string, string>;
  evidence?: { field: string; page: number; quote: string }[];
};
export type GovProject = {
  refNo: string;
  title?: string;
  stages: { type: string; id: string; date: string | null }[];
  [k: string]: any;
};

export const DISCLAIMER =
  "This is an automatic check of scanned documents, not a finding of wrongdoing or an allegation. OCR can misread numbers; open the PDF page to confirm. There may be an ordinary explanation (for example a revised budget, a re-bid, or a document not yet posted).";

const REF = {
  ra12009: { label: "RA 12009 New Government Procurement Act", url: "https://lawphil.net/statutes/repacts/ra2024/ra_12009_2024.html" },
  ra9184: { label: "RA 9184 Government Procurement Reform Act (superseded by RA 12009 for new procurements)", url: "https://lawphil.net/statutes/repacts/ra2003/ra_9184_2003.html" },
  philgeps: { label: "PhilGEPS", url: "https://www.philgeps.gov.ph/" },
  coa: { label: "Commission on Audit", url: "https://www.coa.gov.ph/" },
};
const V_PDF = (n: string) => `Open ${n} on ormindoro.gov.ph (Procurement) and read the quoted page.`;
const V_PHIL = "Compare with the notice for the same project on PhilGEPS.";
const V_BAC = "Ask the Bids and Awards Committee (Procurement Division, Provincial Capitol) for the explanation or the missing document.";
const V_COA = "Check the COA annual audit report for the Province of Oriental Mindoro.";

const STAGE_ORDER = ["itb", "reso", "noa", "coa", "ntp"]; // coa = Contract Agreement (see gov-extract.mjs)

const high = (d: GovDoc | undefined, f: string) => !!d && d.fields?.[f] != null && d.confidence?.[f] === "high";
function ev(d: GovDoc, field: string): FlagEvidence {
  const e = d.evidence?.find((x) => x.field === field);
  return { docId: d.id, page: e?.page ?? null, quote: e?.quote ?? "", value: d.fields[field] ?? null };
}
const php = (n: number) => "PHP " + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const normName = (s: string) =>
  s.toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\b(INC|CORP|CORPORATION|CO|LTD|OPC|COMPANY)\b/g, " ").replace(/\s+/g, " ").trim();

function mk(rule: string, id: string, severity: Severity, title: string, what: string, evidence: FlagEvidence[], verify: string[], references: Flag["references"], confidence: Confidence = "high", refNo?: string): Flag {
  return { id, rule, severity, title, what, evidence, verify, references, confidence, disclaimer: DISCLAIMER, ...(refNo ? { refNo } : {}) };
}

export function buildFlags(projects: GovProject[], docs: GovDoc[], opts: { today?: string } = {}): Flag[] {
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const byId = new Map(docs.map((d) => [d.id, d]));
  const flags: Flag[] = [];
  const stageDoc = (p: GovProject, type: string) => {
    const s = p.stages.find((x) => x.type === type);
    return s ? byId.get(s.id) : undefined;
  };

  for (const p of projects) {
    const itb = stageDoc(p, "itb");
    const noa = stageDoc(p, "noa");

    // a. contract price above approved budget
    if (high(itb, "abc") && high(noa, "contractPrice") && noa!.fields.contractPrice > itb!.fields.abc) {
      flags.push(mk("price-over-abc", `price-over-abc:${p.refNo}`, "review", "Contract price is above the approved budget",
        `For ${p.refNo}, the notice of award states a contract price of ${php(noa!.fields.contractPrice)}, which is above the approved budget for the contract (ABC) of ${php(itb!.fields.abc)} in the invitation to bid.`,
        [ev(itb!, "abc"), ev(noa!, "contractPrice")],
        [V_PDF("the ITB and NOA PDFs"), V_PHIL, V_BAC, V_COA], [REF.ra12009, REF.ra9184, REF.philgeps, REF.coa], "high", p.refNo));
    }

    // b. later stage dated before an earlier stage
    const dated = p.stages
      .map((s) => ({ s, d: byId.get(s.id), o: STAGE_ORDER.indexOf(s.type) }))
      .filter((x) => x.o >= 0 && high(x.d, "date"))
      .sort((a, b) => a.o - b.o);
    const bad: [typeof dated[0], typeof dated[0]][] = [];
    for (let i = 0; i < dated.length; i++)
      for (let j = i + 1; j < dated.length; j++)
        if (dated[j].o > dated[i].o && dated[j].d!.fields.date < dated[i].d!.fields.date) bad.push([dated[i], dated[j]]);
    if (bad.length) {
      const [a, b] = bad[0];
      const docsInvolved = new Map<string, GovDoc>();
      for (const [x, y] of bad) { docsInvolved.set(x.d!.id, x.d!); docsInvolved.set(y.d!.id, y.d!); }
      flags.push(mk("dates-out-of-order", `dates-out-of-order:${p.refNo}`, "review", "Document dates are out of the usual order",
        `For ${p.refNo}, the ${b.s.type.toUpperCase()} is dated ${b.d!.fields.date}, before the ${a.s.type.toUpperCase()} dated ${a.d!.fields.date}; the usual order is ITB, resolution, notice of award, contract, notice to proceed.`,
        [...docsInvolved.values()].map((d) => ev(d, "date")),
        [V_PDF("each PDF"), "Check whether the date was typed or scanned wrongly on the page.", V_BAC], [REF.ra12009, REF.ra9184, REF.philgeps], "high", p.refNo));
    }
  }

  // c. single calculated responsive bid
  const noas = projects.map((p) => ({ p, d: stageDoc(p, "noa") })).filter((x) => high(x.d, "bidType"));
  const singles = noas.filter((x) => x.d!.fields.bidType === "single");
  for (const { p, d } of singles) {
    flags.push(mk("single-bid", `single-bid:${p.refNo}`, "info", "Award went to a single calculated responsive bid",
      `The notice of award for ${p.refNo} says it was a Single Calculated Responsive Bid, meaning one bid passed evaluation; this is an indicator of how much competition there was.`,
      [ev(d!, "bidType")], [V_PDF("the NOA PDF"), V_PHIL, V_BAC], [REF.ra12009, REF.ra9184, REF.philgeps], "high", p.refNo));
  }
  if (singles.length) {
    flags.push(mk("single-bid", "single-bid:aggregate", "info", "Share of awards with a single responsive bid",
      `${singles.length} of ${noas.length} awards with a readable bid type (${Math.round((100 * singles.length) / noas.length)}%) were Single Calculated Responsive Bids.`,
      singles.map((x) => ev(x.d!, "bidType")), ["Open each listed NOA and read the quoted phrase.", V_PHIL], [REF.ra12009, REF.philgeps], "high"));
  }

  // d. award concentration
  const awards = projects.map((p) => ({ p, d: stageDoc(p, "noa") })).filter((x) => high(x.d, "contractor"));
  const groups = new Map<string, { name: string; items: typeof awards }>();
  for (const a of awards) {
    const k = normName(String(a.d!.fields.contractor));
    if (!k) continue;
    if (!groups.has(k)) groups.set(k, { name: a.d!.fields.contractor, items: [] });
    groups.get(k)!.items.push(a);
  }
  for (const { name, items } of groups.values()) {
    const share = items.length / awards.length;
    if (items.length < 8 && share < 0.15) continue;
    const review = items.length >= 8;
    flags.push(mk("award-concentration", `award-concentration:${normName(name).replace(/ /g, "-").toLowerCase()}`, review ? "review" : "info",
      "One contractor holds many awards",
      `${name} appears on ${items.length} of ${awards.length} awards (${Math.round(share * 100)}%) in the period covered; this is a pattern to look at, not proof of anything.`,
      items.map((x) => ev(x.d!, "contractor")),
      ["Open each listed NOA and compare the project, price and date.", V_PHIL, "Check the contractor's registration and past work with the Bids and Awards Committee.", V_COA], [REF.ra12009, REF.philgeps, REF.coa]));
  }

  // e. ITB older than 120 days with no RESO/NOA on the page
  const t0 = Date.parse(today);
  for (const p of projects) {
    const itbS = p.stages.find((s) => s.type === "itb");
    if (!itbS?.date || p.stages.some((s) => s.type === "reso" || s.type === "noa")) continue;
    if ((t0 - Date.parse(itbS.date)) / 86400000 <= 120) continue;
    const itb = byId.get(itbS.id);
    flags.push(mk("no-award-listed", `no-award-listed:${p.refNo}`, "info", "No award document listed for an older invitation",
      `The invitation to bid for ${p.refNo} is dated ${itbS.date}, but a resolution or notice of award for it is not listed on the official page; that does not mean it was not awarded.`,
      [{ docId: itbS.id, page: null, quote: itb?.title ?? p.title ?? "", value: itbS.date }],
      ["Search ormindoro.gov.ph Procurement for the same IB number.", V_PHIL, V_BAC], [REF.ra12009, REF.philgeps], "high", p.refNo));
  }

  // f. reference number anomalies
  const words = new Map<string, Set<string>[]>();
  const docsByRef = new Map<string, GovDoc[]>();
  for (const d of docs) {
    if (!d.title) continue;
    // drop the "IB NO <ref> [lot] <TYPE>" prefix, then compare the remaining words
    const t = d.title.replace(/^.*?\b(ITB|RESO|NOA|NTP|COA|CA)\b/i, "");
    const w = new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length >= 3));
    if (w.size >= 3) words.set(d.refNo, [...(words.get(d.refNo) ?? []), w]);
    docsByRef.set(d.refNo, [...(docsByRef.get(d.refNo) ?? []), d]);
  }
  const jaccard = (a: Set<string>, b: Set<string>) => [...a].filter((x) => b.has(x)).length / new Set([...a, ...b]).size;
  const differs = (ref: string) => {
    const ws = words.get(ref) ?? [];
    return ws.some((a, i) => ws.slice(i + 1).some((b) => jaccard(a, b) < 0.3));
  };
  for (const p of projects) {
    const evd = (docsByRef.get(p.refNo) ?? []).slice(0, 4).map((d) => ({ docId: d.id, page: null, quote: (d.title ?? "").slice(0, 160), value: p.refNo }));
    if (!/^CW\d{4} \d{3}( [A-Z])?$/.test(p.refNo)) {
      flags.push(mk("ref-number-anomaly", `ref-number-anomaly:malformed:${p.refNo}`, "info", "Reference number looks unusual",
        `The reference number "${p.refNo}" does not follow the usual pattern (CW, year, three digits, optional lot letter), which can make documents hard to match.`,
        evd, ["Open the PDF and read the IB number as printed.", V_BAC], [REF.philgeps], "medium", p.refNo));
    }
    if (differs(p.refNo)) {
      flags.push(mk("ref-number-anomaly", `ref-number-anomaly:duplicate:${p.refNo}`, "info", "Same reference number, different titles",
        `The reference number ${p.refNo} is used for documents with different titles, so they may belong to different projects.`,
        evd, ["Open each PDF and compare the project name and IB number.", V_BAC], [REF.philgeps], "medium", p.refNo));
    }
  }
  return flags;
}

export function flagsForProject(refNo: string, flags: Flag[] = flagsJson.flags as Flag[]): Flag[] {
  return flags.filter((f) => f.refNo === refNo);
}

export function summarizeFlags(flags: Flag[] = flagsJson.flags as Flag[]) {
  const byRule: Record<string, number> = {};
  const bySeverity: Record<string, number> = { info: 0, review: 0 };
  for (const f of flags) {
    byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
    bySeverity[f.severity]++;
  }
  return { total: flags.length, byRule, bySeverity };
}
