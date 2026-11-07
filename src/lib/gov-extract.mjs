// Pure extractors for OCR text of ormindoro.gov.ph procurement PDFs. No I/O.
// OCR is noisy ("BIDSANDAWARDSCOMMITTEE", O/0, l/1), so every pattern runs on a whitespace-free lowercase copy of each page
// ("flat"); a map from flat index back to the raw text lets us quote the original wording.
// Every extractor returns { fields, confidence, evidence } where confidence is per field ("high" | "medium" | "low")
// and evidence = [{ field, page, quote (<=160 chars) }]. Missing data is null, never guessed.
// Note: "coa" on the site is NOT a Certificate of Acceptance; the PDFs are titled "CA" = Contract Agreement (see summarizeCoa).

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MON_RE = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]{0,8}";
const MON_NC = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]{0,8}";
const PHP = "(?:ph[pr]?|p[bhn]p|₱)";
const DIG = "[0-9OolIi]"; // OCR often reads digits as these letters

export function prepare(pages) {
  return (pages || []).map((raw, i) => {
    raw = raw || "";
    let flat = "";
    const map = [];
    for (let k = 0; k < raw.length; k++) {
      if (/\s/.test(raw[k])) continue;
      flat += raw[k].toLowerCase();
      map.push(k);
    }
    return { page: i + 1, raw, flat, map };
  });
}

function quoteAt(pg, s, e) {
  const a = Math.max(0, (pg.map[s] ?? 0) - 25);
  const b = Math.min(pg.raw.length, (pg.map[Math.min(e, pg.map.length) - 1] ?? pg.raw.length) + 60);
  return pg.raw.slice(a, b).replace(/\s+/g, " ").trim().slice(0, 160);
}

// first match of regex (written for flat text) over all pages
export function find(pgs, re, from = 0) {
  const rx = new RegExp(re.source, re.flags.replace("g", "") + "d");
  for (const pg of pgs.slice(from)) {
    const m = rx.exec(pg.flat);
    if (m) return { m, pg, s: m.index, e: m.index + m[0].length, quote: quoteAt(pg, m.index, m.index + m[0].length) };
  }
  return null;
}
export function findAll(pgs, re) {
  const out = [];
  const rx = new RegExp(re.source, re.flags.replace("g", "") + "g");
  for (const pg of pgs) {
    let m;
    while ((m = rx.exec(pg.flat))) {
      out.push({ m, pg, s: m.index, e: m.index + m[0].length, quote: quoteAt(pg, m.index, m.index + m[0].length) });
      if (m[0] === "") rx.lastIndex++;
    }
  }
  return out;
}

const fixDigits = (s) => s.replace(/[Oo]/g, "0").replace(/[lIi]/g, "1");

// "1,199,304.37" (also with . and , swapped or O/l noise) -> 1199304.37
export function parseFigure(str) {
  if (!str) return null;
  let s = fixDigits(str.replace(/\s/g, "")).replace(/[^0-9.,]/g, "");
  if (!/\d/.test(s)) return null;
  const dec = /[.,](\d{2})$/.exec(s);
  let cents = 0;
  if (dec) { cents = Number(dec[1]) / 100; s = s.slice(0, dec.index); }
  s = s.replace(/[.,]/g, "");
  if (!s) return null;
  return Number(s) + cents;
}

const W = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, ninty: 90 };
const ALIAS = { milion: "million", millon: "million", hunderd: "hundred", thosand: "thousand" };
const WORDS = [...Object.keys(W), "hundred", "thousand", "million", "billion", ...Object.keys(ALIAS)].sort((a, b) => b.length - a.length);

// "OneMillionOneHundredNinetyNineThousandThreeHundredFourPesosand37/100" (spaces already gone) -> 1199304.37
export function parseWords(flat) {
  let s = flat.toLowerCase().replace(/[^a-z0-9\/]/g, "");
  const cm = /(?:and)?(\d{1,2})\/100/.exec(s);
  let cents = 0;
  if (cm) { cents = Number(cm[1]) / 100; s = s.slice(0, cm.index); }
  s = s.replace(/(?:pesos?|only|philippinecurrency)+$/g, "").replace(/(?:andno|andzero)$/, "").replace(/and$/, "");
  let total = 0, cur = 0, i = 0, any = false;
  while (i < s.length) {
    if (s.startsWith("and", i) && any) { i += 3; continue; }
    let w = WORDS.find((x) => s.startsWith(x, i));
    if (!w) return null;
    i += w.length; any = true;
    w = ALIAS[w] || w;
    if (w in W) cur += W[w];
    else if (w === "hundred") cur = (cur || 1) * 100;
    else { const m = w === "thousand" ? 1e3 : w === "million" ? 1e6 : 1e9; total += (cur || 1) * m; cur = 0; }
  }
  if (!any) return null;
  return Math.round((total + cur + cents) * 100) / 100;
}

export function parseDate(flat) {
  const m = new RegExp(`${MON_RE}\\.?(${DIG}{1,2}),?(${DIG}{4})`).exec(flat);
  if (!m) return null;
  const mo = MONTHS.findIndex((x) => x.startsWith(m[1]));
  const d = Number(fixDigits(m[2])), y = Number(fixDigits(m[3]));
  if (mo < 0 || d < 1 || d > 31 || y < 2015 || y > 2032) return null;
  return `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
const DATE_SRC = `${MON_NC}\\.?${DIG}{1,2},?${DIG}{4}`;

export function parseTime(flat) {
  const m = /(\d{1,2})[:.;](\d{2})(a|p)\.?m/.exec(flat);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3] === "p") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

// small builder: set(field, value, confidence, hit)
function builder() {
  const fields = {}, confidence = {}, evidence = [];
  const set = (field, value, conf, hit) => {
    fields[field] = value ?? null;
    confidence[field] = value == null ? null : conf;
    if (value != null && hit) evidence.push({ field, page: hit.pg.page, quote: hit.quote });
  };
  return { fields, confidence, evidence, set };
}

// figure + words cross-check. Both present and equal -> high; both present but different -> low (value = figure);
// only one present -> medium.
function money(figHit, wordsFlat) {
  const fig = figHit ? parseFigure(figHit) : null;
  const words = wordsFlat ? parseWords(wordsFlat) : null;
  if (fig != null && words != null) {
    if (Math.abs(fig - words) < 0.005) return { value: fig, words, confidence: "high" };
    // OCR often drops the first line of the words ("...THREE HUNDRED FIFTY SEVEN PESOS"): same low digits, smaller number -> figure only
    const diff = fig - words;
    if (diff > 0 && Math.abs(diff / 1000 - Math.round(diff / 1000)) < 1e-6) return { value: fig, words: null, confidence: "medium" };
    return { value: fig, words, confidence: "low" };
  }
  if (fig != null) return { value: fig, words: null, confidence: "medium" };
  if (words != null) return { value: words, words, confidence: "medium" };
  return { value: null, words: null, confidence: null };
}

// ---------------------------------------------------------------- ITB
export function extractITB(pages) {
  const pgs = prepare(pages);
  const b = builder();

  b.set("projectName", null);
  const t = find(pgs, /invitationtobidfor(.{5,200}?)1\.?the/);
  if (t) {
    const raw = t.pg.raw.replace(/\s+/g, " ");
    const i = raw.search(/INVITATION\s*TO\s*BID\s*FOR/i);
    const nm = i >= 0 ? raw.slice(i).replace(/^INVITATION\s*TO\s*BID\s*FOR\s*/i, "").split(/\s1\s?\.\s?The/i)[0].trim() : null;
    b.set("projectName", nm && nm.length > 4 ? nm.slice(0, 160) : null, "medium", t);
  }

  const ent = find(pgs, /provi.{0,3}cialgovernmentoforientalmindoro/);
  b.set("procuringEntity", ent ? "Provincial Government of Oriental Mindoro" : null, "high", ent);

  const ib = find(pgs, /\(?ibno\.?[:\-]?(cw[\-.]?\d{4}[\-.]?\d{3}(?:-[a-z])?)\)?/);
  b.set("ibNumber", ib ? ib.m[1].toUpperCase().replace(/\./g, "-") : null, "high", ib);

  const fs = find(pgs, /(?:through|from)(?:the)?(.{3,40}?)intendsto/);
  b.set("fundingSource", fs ? fs.m[1].replace(/^the/, "").toUpperCase() : null, "medium", fs);

  // ABC: words then figure in "(Php1,199,304.37)", then "beingtheApprovedBudget"
  const abc = find(pgs, new RegExp(`sumof(.{10,400}?)\\(?${PHP}\\.?([0-9OolIi,\\.]{3,20})\\)?being(?:the)?approvedbudget`));
  if (abc) {
    const r = money(abc.m[2], abc.m[1]);
    b.set("abc", r.value, r.confidence, abc);
    b.set("abcWords", r.words, r.confidence, null);
  } else {
    const f2 = find(pgs, new RegExp(`${PHP}\\.?([0-9OolIi,\\.]{5,20})\\)?being(?:the)?approvedbudget`));
    const r = money(f2 && f2.m[1], null);
    b.set("abc", r.value, r.confidence, f2);
    b.set("abcWords", null);
  }

  const cd = find(pgs, /(?:completion|delivery)of(?:the)?(?:works|project|goods)?is(?:required|expected)?(?:within)?(\d{1,4})calendardays/) ||
    find(pgs, /(\d{1,4})calendardays/);
  b.set("completionDays", cd ? Number(cd.m[1]) : null, cd && cd.m[0].startsWith("complet") ? "high" : "medium", cd);

  // deadline: "...on or before June 9, 2025 at 8:30 a.m."
  const dl = find(pgs, new RegExp(`onorbefore(${DATE_SRC})(?:at)?([0-9:.;]{3,6}[ap]\\.?m)?`));
  let dlDate = null, dlTime = null;
  if (dl) { dlDate = parseDate(dl.m[1]); dlTime = dl.m[2] ? parseTime(dl.m[2]) : null; }
  b.set("bidDeadline", dlDate ? (dlTime ? `${dlDate}T${dlTime}` : dlDate) : null, dlDate && dlTime ? "high" : "medium", dl);

  const op = find(pgs, new RegExp(`bidopeningshallbeon(${DATE_SRC})(?:at)?([0-9:.;]{3,6}[ap]\\.?m)?(?:at)?(.{0,160}?)(?:\\.bids|\\.\\d|which|$)`));
  let opDate = null, opTime = null;
  if (op) { opDate = parseDate(op.m[1]); opTime = op.m[2] ? parseTime(op.m[2]) : null; }
  b.set("bidOpening", opDate ? (opTime ? `${opDate}T${opTime}` : opDate) : null, opDate && opTime ? "high" : "medium", op);
  b.set("location", op && op.m[3] && /bac|room|capitol|calapan/.test(op.m[3]) ? rawBetween(op, 3) : null, "medium", op);

  // issue date in parentheses near the signature block, e.g. "(September16,2026)"
  const all = findAll(pgs, new RegExp(`\\((${DATE_SRC})\\)`));
  const last = all[all.length - 1];
  b.set("date", last ? parseDate(last.m[1]) : null, "medium", last);

  return { fields: b.fields, confidence: b.confidence, evidence: b.evidence };
}

// raw text for capture group n of a find() hit, with whitespace normalised
function rawBetween(hit, n) {
  const [s, e] = hit.m.indices[n];
  const a = hit.pg.map[s], z = (hit.pg.map[e - 1] ?? hit.pg.raw.length - 1) + 1;
  return hit.pg.raw.slice(a, z).replace(/\s+/g, " ").trim();
}


// ---------------------------------------------------------------- shared helpers for award-stage documents
const PHP_FIG = `${PHP}\\.?([0-9OolIi,\\.]{3,20})`;
const joinRaw = (pages) => (pages || []).join(" \n ").replace(/\s+/g, " ");

// day-first stamped dates such as "22 SEP 2026" (also parsed by parseDate for "September 15, 2026")
export function parseAnyDate(flat) {
  const a = parseDate(flat);
  if (a) return a;
  const m = new RegExp(`(${DIG}{1,2})${MON_RE}\\.?,?(${DIG}{4})`).exec(flat);
  if (!m) return null;
  const mo = MONTHS.findIndex((x) => x.startsWith(m[2]));
  const d = Number(fixDigits(m[1])), y = Number(fixDigits(m[3]));
  if (mo < 0 || d < 1 || d > 31 || y < 2015 || y > 2032) return null;
  return `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
const ANY_DATE_SRC = `(?:${DATE_SRC}|${DIG}{1,2}${MON_NC}\\.?,?${DIG}{4})`;

// words + figure; "high" only when they agree
function priceFrom(pgs, leadRes) {
  for (const lead of leadRes) {
    const h = find(pgs, new RegExp(`${lead}(.{0,400}?)\\(?${PHP_FIG}\\)?`));
    if (!h) continue;
    const hasWords = /(hundred|thousand|million)/.test(h.m[1]);
    const r = money(h.m[2], hasWords ? h.m[1] : null);
    if (r.value != null) return { ...r, hit: h };
  }
  // figure printed without "Php" (OCR dropped it) or lead-in words missing: strict 1,234,567.89 shape
  for (const lead of [...leadRes, "only"]) {
    const h = find(pgs, new RegExp(`${lead}(.{0,400}?)\\(?(${DIG}{1,3}(?:,${DIG}{3})+\\.${DIG}{2})\\)?`));
    if (!h || (lead === "only" && h.m[1].length > 6)) continue;
    const hasWords = /(hundred|thousand|million)/.test(h.m[1]);
    const r = money(h.m[2], hasWords ? h.m[1] : null);
    if (r.value != null) return { ...r, confidence: r.confidence === "high" ? "high" : "medium", hit: h };
  }
  return null;
}

function resolutionNo(pgs, b) {
  const h = find(pgs, new RegExp(`resolutionno\\.?[:.]?(${DIG}{1,4}),?series(?:of)?(${DIG}{4})`));
  b.set("resolutionNo", h ? fixDigits(h.m[1]).padStart(3, "0") : null, "high", h);
  b.set("resolutionSeries", h ? Number(fixDigits(h.m[2])) : null, "high", null);
}

const NAME_STOP = /^(dear|date|subject|re:)/i;
const OFFICER = /^(m[rs]s?|mrs|engr|atty|dr|hon|sir|ma'?am)\.?\s/i;
const TITLE = /(president|manager|officer|proprietor|proprietress|owner|chairman|treasurer|representative|director|chief)/i;
const FIRM = /(enterpri[sz]es?|construction|builders?|trading|corp|corporation|inc\b|company|co\.|contractors?|development|services|engineering|marketing|supply|supplies)/i;

// addressee block above "Dear ...": [officer] [title] COMPANY [address]
function awardee(pages) {
  const lines = (pages[0] || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const di = lines.findIndex((l) => /^dear/i.test(l.replace(/\s/g, "")) || /^dear/i.test(l));
  const win = lines.slice(Math.max(0, (di < 0 ? lines.length : di) - 6), di < 0 ? lines.length : di);
  const oi = win.findIndex((l) => OFFICER.test(l) || /^(m[rs]s?|engr|atty|dr)\./i.test(l));
  let officer = null, title = null, company = null, evLine = null;
  if (oi >= 0) {
    officer = win[oi];
    const rest = win.slice(oi + 1);
    const isTitle = (l) => TITLE.test(l) && !FIRM.test(l.replace(TITLE, ""));
    title = rest.find(isTitle) || null;
    company = rest.find((l) => !isTitle(l) && FIRM.test(l)) || rest.find((l) => !isTitle(l) && l === l.toUpperCase() && /[A-Z]{3}/.test(l)) || null;
    evLine = win.slice(oi, oi + 4).join(" | ");
  }
  return { officer, title, company, evLine };
}

// ---------------------------------------------------------------- NOA
export function extractNOA(pages) {
  const pgs = prepare(pages);
  const b = builder();
  const head = pgs[0] ? { ...pgs[0], flat: pgs[0].flat.slice(0, 700) } : null;
  const dt = head ? find([head], new RegExp(ANY_DATE_SRC)) : null;
  b.set("date", dt ? parseAnyDate(dt.m[0]) : null, "high", dt);

  const aw = awardee(pages || []);
  const awHit = aw.evLine ? { pg: { page: 1 }, quote: aw.evLine.slice(0, 160) } : null;
  b.set("contractor", aw.company, "medium", awHit);
  b.set("officer", aw.officer, "medium", awHit);
  b.set("officerTitle", aw.title, "medium", null);

  const pr = priceFrom(pgs, ["contractpriceequivalentto", "contractpriceof", "totalcontractpriceof"]);
  b.set("contractPrice", pr ? pr.value : null, pr ? pr.confidence : null, pr && pr.hit);
  b.set("contractPriceWords", pr ? pr.words : null, pr ? pr.confidence : null, null);

  resolutionNo(pgs, b);

  const sing = find(pgs, /single(?:calculated)?(?:and)?(?:responsive)?bid/);
  const low = find(pgs, /lowestcalculated(?:and)?(?:responsive)?bid/);
  const exact = find(pgs, /(single|lowest)calculatedresponsivebid/);
  const bt = exact ? exact.m[1] : sing ? "single" : low ? "lowest" : null;
  b.set("bidType", bt, exact ? "high" : "medium", exact || sing || low);

  const cd = find(pgs, /within.{0,60}?\((\d{1,3})\)calendardays/) || find(pgs, /(\d{1,3})calendardays/);
  b.set("completionDays", cd ? Number(cd.m[1]) : null, cd && cd.m[0].startsWith("within") ? "high" : "medium", cd);
  return { fields: b.fields, confidence: b.confidence, evidence: b.evidence };
}

// ---------------------------------------------------------------- RESO
export function extractRESO(pages) {
  const pgs = prepare(pages);
  const b = builder();
  resolutionNo(pgs, b);

  const title = pgs[0] ? { ...pgs[0], flat: pgs[0].flat.slice(0, 1500) } : null;
  const fail = title && find([title], /(declaring|declarationof)(a)?failure|failureofbidding|failedbidding/);
  const award = title && find([title], /recommending(?:the)?(?:approvalof)?award/);
  const kind = fail ? "failure" : award ? "award" : pgs.length ? "other" : null;
  b.set("kind", kind, fail || award ? "high" : "low", fail || award);
  b.set("recommendsAward", kind == null ? null : kind === "award", fail || award ? "high" : "low", null);

  const j = joinRaw(pages);
  const w1 = /contract\s*with\s+(.{3,80}?)\s*for\s*(?:the\s*)?(?=[A-Z])/.exec(j);
  const w2 = /declare\s*(.{3,80}?)\s*with\s*business\s*address/i.exec(j);
  const norm = (x) => (x ? x.toUpperCase().replace(/[^A-Z0-9]/g, "") : "");
  const winner = (w1 && w1[1]) || (w2 && w2[1]) || null;
  const both = w1 && w2 && norm(w1[1]) === norm(w2[1]);
  const wHit = winner ? { pg: { page: 1 }, quote: ((w1 || w2)[0]).slice(0, 160) } : null;
  b.set("winner", kind === "failure" ? null : winner, both ? "high" : "medium", wHit);

  const pr = priceFrom(pgs, ["contractpriceequivalentto", "contractpriceof"]);
  b.set("bidAmount", pr ? pr.value : null, pr ? pr.confidence : null, pr && pr.hit);

  const mt = find(pgs, new RegExp(`(?:inourmeetingon|meetingon|resolvedon|approvedon)(${DATE_SRC})`));
  b.set("date", mt ? parseDate(mt.m[1]) : null, "medium", mt);

  const nb = find(pgs, /\((\d{1,2})\)prospectivebidder/);
  b.set("biddersCount", nb ? Number(nb.m[1]) : null, "medium", nb);
  const ib = find(pgs, /ibno\.?[:\-]?(cw[\-.]?\d{4}[\-.]?\d{3}(?:-[a-z])?)/);
  b.set("ibNumber", ib ? ib.m[1].toUpperCase().replace(/\./g, "-") : null, "high", ib);
  return { fields: b.fields, confidence: b.confidence, evidence: b.evidence };
}

// ---------------------------------------------------------------- NTP
export function extractNTP(pages) {
  const pgs = prepare(pages);
  const b = builder();
  const head = pgs[0] ? { ...pgs[0], flat: pgs[0].flat.slice(0, 700) } : null;
  const dt = head ? find([head], new RegExp(ANY_DATE_SRC)) : null;
  b.set("date", dt ? parseAnyDate(dt.m[0]) : null, "medium", dt); // often a handwritten stamp, so never "high"

  const j = joinRaw(pages);
  const c = /given\s*to\s+(.{3,80}?)\s+that\s*work/i.exec(j);
  const aw = awardee(pages || []);
  const co = c ? c[1] : aw.company;
  const agree = c && aw.company && c[1].toUpperCase().replace(/[^A-Z0-9]/g, "") === aw.company.toUpperCase().replace(/[^A-Z0-9]/g, "");
  b.set("contractor", co, agree ? "high" : "medium", co ? { pg: { page: 1 }, quote: (c ? c[0] : aw.company).slice(0, 160) } : null);

  const eff = find(pgs, /effective(immediately|on|starting|beginning)?(?:uponthereceipt|upon)?(?:ofthis(?:notice)?)?(.{0,30})/);
  const effDate = find(pgs, new RegExp(`effective(?:on|starting|beginning|as of)?(${ANY_DATE_SRC})`));
  b.set("startDate", effDate ? parseAnyDate(effDate.m[1]) : null, "medium", effDate);
  b.set("effectivity", effDate ? null : eff && eff.m[1] === "immediately" ? "immediately upon receipt" : null, "medium", eff);

  const cd = find(pgs, /(\d{1,3})calendardays/);
  b.set("calendarDays", cd ? Number(cd[0] && cd.m[1]) : null, "medium", cd);
  const ib = find(pgs, /ibno\.?[:\-]?(cw[\-.]?\d{4}[\-.]?\d{3}(?:-[a-z])?)/);
  b.set("ibNumber", ib ? ib.m[1].toUpperCase().replace(/\./g, "-") : null, "high", ib);
  return { fields: b.fields, confidence: b.confidence, evidence: b.evidence };
}

// ---------------------------------------------------------------- COA = "CA" = Contract Agreement
// On ormindoro.gov.ph the "coa" documents are titled "IB NO <ref> CA ..." and are the signed CONTRACT AGREEMENT between the Province
// and the winning contractor (executed date, contractor, approved budget, contract price, duration). They are NOT a Commission on Audit
// document and NOT a certificate of acceptance/completion, so there is no "final amount" - only the contract price.
export function extractCOA(pages) {
  const pgs = prepare(pages);
  const b = builder();
  const isCA = find(pgs, /contractagreement/);
  b.set("documentKind", isCA ? "contract-agreement" : null, "high", isCA);

  const ex = find(pgs, new RegExp(`contractagreement(.{0,160}?)(${ANY_DATE_SRC})`)) || find(pgs, new RegExp(`executedon(.{0,12}?)(${ANY_DATE_SRC})`));
  b.set("date", ex ? parseAnyDate(ex.m[2]) : null, "medium", ex); // handwritten stamp

  const j = joinRaw(pages);
  const c = /-\s*and\s*-\s*(.{3,80}?)\s*,?\s*(?:a|an)\s+(?:company|sole|partnership|corporation|cooperative|duly|filipino)/i.exec(j);
  const c2 = c ? null : /\band\s+([A-Z0-9][A-Z0-9 .,&'\-]{3,70}?)\s+with\s+(?:office|principal)/.exec(j);
  const cc = c || c2;
  b.set("contractor", cc ? cc[1].replace(/[,\s]+$/, "") : null, "medium", cc ? { pg: { page: 1 }, quote: cc[0].slice(0, 160) } : null);

  const pr = priceFrom(pgs, ["totalamountof", "acceptedthebidfortheamountof", "contractpriceof", "contractpriceequivalentto"]);
  b.set("contractPrice", pr ? pr.value : null, pr ? pr.confidence : null, pr && pr.hit);
  const ab = find(pgs, new RegExp(`approvedbudget(?:forthecontract)?:?${PHP_FIG}`));
  b.set("abc", ab ? parseFigure(ab.m[1]) : null, "medium", ab);
  const cd = find(pgs, /contractduration.{0,80}?(\d{1,4})calendardays/);
  b.set("completionDays", cd ? Number(cd.m[1]) : null, "high", cd);
  const ib = find(pgs, /(?:ib\.?no\.?|contractid:?(?:ib\.?no\.?)?)[:\-]?(cw[\-.]?\d{4}[\-.]?\d{3}(?:-[a-z])?)/);
  b.set("ibNumber", ib ? ib.m[1].toUpperCase().replace(/\./g, "-") : null, "high", ib);
  return { fields: b.fields, confidence: b.confidence, evidence: b.evidence };
}

export function extract(type, pages) {
  const f = { itb: extractITB, reso: extractRESO, noa: extractNOA, ntp: extractNTP, coa: extractCOA }[type];
  return f ? f(pages) : { fields: {}, confidence: {}, evidence: [] };
}

// ---------------------------------------------------------------- cross-document reconciliation
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// same business if names match after dropping punctuation, or are within 2 edits (OCR / spelling variants like ENTERPRISES vs ENTERPRIZES)
const sameName = (a, b) => a && b && (a === b || (Math.min(a.length, b.length) >= 8 && lev(a, b) <= 2));
const nameKey = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(INC|CORP|CORPORATION|CO|LTD|OPC)$/, "");
// When two or more documents of one project name the same contractor, each becomes "high" (independent scans agreeing).
// Likewise contract prices that agree between NOA/RESO/CA are raised to "high" on each.
export function reconcile(items) {
  const byRef = new Map();
  for (const it of items) if (it.refNo) (byRef.get(it.refNo) ?? byRef.set(it.refNo, []).get(it.refNo)).push(it);
  for (const group of byRef.values()) {
    const named = group.map((it) => ({ it, f: it.type === "reso" ? "winner" : "contractor" })).filter((x) => x.it.fields?.[x.f]);
    for (const x of named) {
      const k = nameKey(x.it.fields[x.f]);
      const agree = named.filter((y) => y.it !== x.it && y.it.type !== x.it.type && k && sameName(nameKey(y.it.fields[y.f]), k));
      if (agree.length && x.it.confidence[x.f] === "medium") x.it.confidence[x.f] = "high";
    }
    const priced = group.map((it) => ({ it, f: { noa: "contractPrice", coa: "contractPrice", reso: "bidAmount" }[it.type] })).filter((x) => x.f && x.it.fields?.[x.f] != null);
    for (const x of priced) {
      const v = x.it.fields[x.f];
      if (x.it.confidence[x.f] === "medium" && priced.some((y) => y.it !== x.it && Math.abs(y.it.fields[y.f] - v) < 0.005)) x.it.confidence[x.f] = "high";
    }
  }
  return items;
}

// ---------------------------------------------------------------- projects (grouped by refNo)
export const STAGE_ORDER = ["itb", "reso", "noa", "coa", "ntp"];
const dayDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const best = (docs, type, field) => {
  const d = docs.find((x) => x.type === type && x.fields?.[field] != null && x.confidence?.[field] === "high");
  return d ? d.fields[field] : null;
};
export function buildProjects(procItems, docs) {
  const byId = new Map(docs.map((d) => [d.id, d]));
  const groups = new Map();
  for (const it of procItems) {
    if (!it.refNo) continue;
    if (!groups.has(it.refNo)) groups.set(it.refNo, []);
    groups.get(it.refNo).push(it);
  }
  const out = [];
  for (const [refNo, its] of groups) {
    its.sort((a, b) => STAGE_ORDER.indexOf(a.type) - STAGE_ORDER.indexOf(b.type) || (a.date || "").localeCompare(b.date || ""));
    const ds = its.map((i) => byId.get(i.id)).filter(Boolean);
    // one stage entry per type (first by date); re-posted ITBs (-2 suffix) share the refNo
    const seen = new Set();
    const stages = its.filter((i) => !seen.has(i.type) && seen.add(i.type)).map((i) => ({ type: i.type, id: i.id, date: i.date }));
    const dates = stages.map((s) => s.date).filter(Boolean).sort();
    const stageDays = [];
    for (let k = 1; k < stages.length; k++)
      if (stages[k].date && stages[k - 1].date) stageDays.push({ from: stages[k - 1].type, to: stages[k].type, days: dayDiff(stages[k - 1].date, stages[k].date) });
    const first = its[0];
    out.push({
      refNo, title: (its.find((i) => i.type === "itb") || first).title, town: first.town ?? null, work: first.work ?? null,
      stages,
      abc: best(ds, "itb", "abc") ?? best(ds, "coa", "abc"),
      contractPrice: best(ds, "noa", "contractPrice") ?? best(ds, "coa", "contractPrice") ?? best(ds, "reso", "bidAmount"),
      contractor: best(ds, "noa", "contractor") ?? best(ds, "coa", "contractor") ?? best(ds, "reso", "winner") ?? best(ds, "ntp", "contractor"),
      bidType: best(ds, "noa", "bidType"),
      firstDate: dates[0] ?? null, lastDate: dates[dates.length - 1] ?? null,
      stageDays,
      complete: ["itb", "noa", "coa", "ntp"].every((t) => seen.has(t)),
    });
  }
  return out.sort((a, b) => a.refNo.localeCompare(b.refNo));
}

// ---------------------------------------------------------------- summaries (templates over extracted fields only; null -> clause omitted)
const MONTH_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_FIL = ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo", "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"];
const usable = (d, f) => d.fields?.[f] != null && d.confidence?.[f] && d.confidence[f] !== "low" ? d.fields[f] : null;
const money2 = (n) => (n == null ? null : "PHP " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const dateL = (iso, M) => {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${Number(m[3])} ${M[Number(m[2]) - 1]} ${m[1]}` : null;
};
export function projectFromTitle(title) {
  const t = String(title || "").replace(/^IB\s*NO\.?[\s-]*CW[\s-]*\d{4}[\s-]*\S{3}(?:\s+[A-Z])?(?=\s|$)\s*(?:(?:ITB|RESO|NOA|NTP|COA|CA)\b\.?\s*)?/i, "").trim();
  return t || null;
}
const sentence = (parts) => parts.filter(Boolean).join(" ") || null;

export function summarize(doc) {
  const f = (k) => usable(doc, k), proj = projectFromTitle(doc.title);
  const en = (iso) => dateL(iso, MONTH_EN), fil = (iso) => dateL(iso, MONTH_FIL);
  const ib = doc.refNo ? `IB ${doc.refNo}` : null;
  const forProj = proj ? ` for ${proj}` : "";
  const forProjFil = proj ? ` para sa ${proj}` : "";
  const t = doc.type;
  if (t === "itb") {
    const abc = money2(f("abc")), dl = f("bidDeadline"), op = f("bidOpening"), days = f("completionDays"), src = f("fundingSource");
    return {
      en: sentence([`Invitation to bid${forProj}${ib ? ` (${ib})` : ""}.`, abc && `Approved budget for the contract: ${abc}.`, src && `Funding source: ${src}.`,
        dl && `Bids are due ${en(dl)}.`, op && `Bid opening: ${en(op)}.`, days && `Completion period: ${days} calendar days.`]),
      fil: sentence([`Paanyaya sa pagbi-bid${forProjFil}${ib ? ` (${ib})` : ""}.`, abc && `Inaprubahang badyet para sa kontrata: ${abc}.`, src && `Pinagkukunan ng pondo: ${src}.`,
        dl && `Huling araw ng pagsumite ng bid: ${fil(dl)}.`, op && `Pagbubukas ng bid: ${fil(op)}.`, days && `Panahon ng pagtatapos: ${days} araw sa kalendaryo.`]),
    };
  }
  if (t === "reso") {
    const kind = f("kind"), w = f("winner"), amt = money2(f("bidAmount")), no = f("resolutionNo"), ser = f("resolutionSeries");
    const rn = no ? `BAC Resolution No. ${no}${ser ? `, Series of ${ser}` : ""}` : "BAC resolution";
    const rnF = no ? `BAC Resolution Blg. ${no}${ser ? `, Serye ng ${ser}` : ""}` : "BAC resolution";
    const k = kind === "award" ? "recommends awarding the contract" : kind === "failure" ? "declares a failure of bidding" : null;
    const kF = kind === "award" ? "nagrerekomenda ng pagkakaloob ng kontrata" : kind === "failure" ? "nagdedeklara ng pagkabigo ng bidding" : null;
    return {
      en: sentence([`${rn}${forProj}${k ? " " + k : ""}${w && kind === "award" ? ` to ${w}` : ""}${amt && kind === "award" ? ` at ${amt}` : ""}.`, f("date") && `Dated ${en(f("date"))}.`]),
      fil: sentence([`${rnF}${forProjFil}${kF ? " " + kF : ""}${w && kind === "award" ? ` kay/sa ${w}` : ""}${amt && kind === "award" ? ` sa halagang ${amt}` : ""}.`, f("date") && `May petsang ${fil(f("date"))}.`]),
    };
  }
  if (t === "noa") {
    const c = f("contractor"), p = money2(f("contractPrice")), bt = f("bidType"), d = f("date");
    const btE = bt === "single" ? "a Single Calculated Responsive Bid" : bt === "lowest" ? "the Lowest Calculated Responsive Bid" : null;
    const btF = bt === "single" ? "Single Calculated Responsive Bid" : bt === "lowest" ? "Lowest Calculated Responsive Bid" : null;
    return {
      en: sentence([`Notice of award${forProj}${c ? ` to ${c}` : ""}${p ? ` at a contract price of ${p}` : ""}.`, btE && `The award was on ${btE}.`, d && `Dated ${en(d)}.`]),
      fil: sentence([`Abiso ng pagkakaloob${forProjFil}${c ? ` kay/sa ${c}` : ""}${p ? ` sa presyong ${p}` : ""}.`, btF && `Ang pagkakaloob ay batay sa ${btF}.`, d && `May petsang ${fil(d)}.`]),
    };
  }
  if (t === "ntp") {
    const c = f("contractor"), d = f("date"), s = f("startDate"), n = f("calendarDays"), e = f("effectivity");
    return {
      en: sentence([`Notice to proceed${forProj}${c ? ` issued to ${c}` : ""}.`, d && `Dated ${en(d)}.`, s ? `Effective ${en(s)}.` : e && `Effective ${e}.`, n && `${n} calendar days.`]),
      fil: sentence([`Abiso na magsimula${forProjFil}${c ? ` para kay/sa ${c}` : ""}.`, d && `May petsang ${fil(d)}.`, s ? `Epektibo simula ${fil(s)}.` : e && "Epektibo agad pagkatanggap.", n && `${n} araw sa kalendaryo.`]),
    };
  }
  if (t === "coa") {
    const c = f("contractor"), p = money2(f("contractPrice")), a = money2(f("abc")), d = f("date"), n = f("completionDays");
    return {
      en: sentence([`Contract agreement${forProj}${c ? ` with ${c}` : ""}${p ? ` for ${p}` : ""}.`, a && `Approved budget: ${a}.`, n && `Duration: ${n} calendar days.`, d && `Signed ${en(d)}.`]),
      fil: sentence([`Kasunduan sa kontrata${forProjFil}${c ? ` kay/sa ${c}` : ""}${p ? ` na nagkakahalaga ng ${p}` : ""}.`, a && `Inaprubahang badyet: ${a}.`, n && `Tagal: ${n} araw sa kalendaryo.`, d && `Nilagdaan noong ${fil(d)}.`]),
    };
  }
  return { en: null, fil: null };
}
