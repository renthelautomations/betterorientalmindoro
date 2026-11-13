"""Parse OCR text of Pinamalayan Project Monitoring Committee (PMC) reports into one record per inspection.
Input: OCR cache from scripts/ocr-pdf-list.py. Output JSON list: {doc, url, date, project, contractor, cost, fund, status, findings:[...], recommendation:[...]}.
OCR drops many spaces, so the same project block (inspection page, recommendation page, photo page) is read three times and the best-spaced copy wins."""
import json, os, re, sys, glob, datetime
cache = sys.argv[1]
MONTHS = {m: i + 1 for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"])}
norm = lambda s: re.sub(r"[^A-Z]", "", s.upper())
def date_of(text, fallback):
    m = re.search(r"Date\s*:?\s*([A-Za-z]+)\s*(\d{1,2}),?\s*(20\d\d)", text)
    if m and m.group(1).lower() in MONTHS: return datetime.date(int(m.group(3)), MONTHS[m.group(1).lower()], int(m.group(2))).isoformat()
    return fallback
def field(lines, label, stops):
    out, on = [], False
    for l in lines:
        n = norm(l)
        if not on and n.startswith(norm(label)): on = True; rest = re.sub(r"^.*?:", "", l, count=1).strip(); out += [rest] if rest else []; continue
        if on:
            if any(n.startswith(norm(s)) for s in stops): break
            out.append(l)
    return " ".join(out).strip()
def best(a, b): return a if a.count(" ") / max(len(a), 1) >= b.count(" ") / max(len(b), 1) else b
def parse_cost(raw):
    """OCR writes 22,650,000.00 as 22.650.000.00 and sometimes adds a stray .00 (8.393.845.97.00). Groups of 3 digits are thousands, a final group of 2 is centavos."""
    m = re.search(r"\d[\d.,]*\d", raw or "")  # first amount only: some reports list two funds on one line
    t = re.findall(r"\d+", m.group(0)) if m else []
    if not t: return None
    if len(t) >= 3 and len(t[-1]) == 2 and len(t[-2]) == 2: t = t[:-1]  # stray trailing .00 after the centavos
    cents = 0
    if len(t) >= 2 and len(t[-1]) == 2: cents = int(t[-1]); t = t[:-1]
    return int("".join(t)) + cents / 100
recs = []
for f in sorted(glob.glob(f"{cache}/ocr/*.json")):
    d = json.load(open(f)); name = os.path.basename(f)[:-5]
    blocks = {}
    for i, t in enumerate(d["pages"]):
        n = norm(t)
        if "PROJECTMONITORINGCOMMITTEE" not in n: continue
        kind = "photo" if "PHOTODOCUMENTATION" in n else "rec" if "RECOMMENDATION" in n[:200] and "INSPECTIONREPORT" not in n[:200] else "insp" if "INSPECTIONREPORT" in n[:200] else None
        if not kind: continue
        L = [l.strip() for l in t.split("\n") if l.strip()]
        proj = field(L, "Project/Location", ["Contractor"]); contr = field(L, "Contractor", ["Project Cost"]); cost = field(L, "Project Cost", ["Fund Source"])
        fund = field(L, "Fund Source", ["Status"]); status = field(L, "Status", ["Date of Site", "We,", "Upon", "Office", "PMC", "ENGR"])
        key = norm(proj)[:40] + "|" + re.sub(r"\D", "", cost)[:8]
        b = blocks.setdefault(key, {"date": None, "proj": proj, "contr": contr, "cost": cost, "fund": fund, "status": status, "findings": [], "rec": []})
        b["proj"] = best(b["proj"], proj); b["contr"] = best(b["contr"], contr)
        b["date"] = b["date"] or date_of(t, None)
        body = [l for l in L if not re.match(r"^(Republic|Province|MUNICIPAL|PROJECT MONITORING|INSPECTION|RECOMMENDATION|PHOTO|Date)", l, re.I)]
        if kind in ("insp", "rec"):
            tail = []; on = False
            for l in body:
                if on: tail.append(l)
                if norm(l).startswith("STATUS"): on = True
                elif on and False: pass
            sigs = re.compile(r"^(ENGR|CECILIA|JOEL|AMELIA|DANIEL|DANEL|PMC|OEL|AMELI|CELIA|[A-Z. ]{6,}$)")
            tail = [l for l in tail if not sigs.match(l.strip()) and len(l) > 14]
            b["findings" if kind == "insp" else "rec"] += tail
    for b in blocks.values():
        if not b["proj"]: continue
        cost = parse_cost(b["cost"])
        recs.append({"doc": name, "url": d["url"], "date": b["date"], "project": b["proj"], "contractor": b["contr"], "cost": cost, "costRaw": b["cost"], "fund": b["fund"], "status": b["status"], "findings": b["findings"], "recommendation": b["rec"]})
json.dump(recs, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print(len(recs), "inspection records")
