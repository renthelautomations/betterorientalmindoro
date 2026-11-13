"""Cross-check PMC project records against (1) the town's own bids-and-awards documents and (2) PhilGEPS awards (src/data/philgeps/awards.json).
A PhilGEPS award counts as a match only when the awardee name AND the amount agree (amount within 3% of the project cost) or the awardee agrees and the title overlaps strongly.
A bid document is listed as related when the project's place and work words overlap its title. Nothing here proves a project right or wrong: it says where the same project shows up elsewhere.
Run: python3 scripts/crosscheck-pmc.py clean.json bid-docs.json out.json"""
import json, re, sys
proj = json.load(open(sys.argv[1])); docs = json.load(open(sys.argv[2])); A = json.load(open("src/data/philgeps/awards.json"))
F = A["f"]; D = A["d"]; ix = {k: F.index(k) for k in F}
pin = {i for i, e in enumerate(D["entity"]) if "PINAMALAYAN" in e.upper()}
aw = [r for r in A["r"] if r[ix["entity"]] in pin]
STOP = set("the of and for at in to by with municipal pinamalayan oriental mindoro barangay brgy construction project projects development fund purpose multi province road".split())
def toks(s, drop=()): return {t for t in re.findall(r"[a-z0-9]{4,}", (s or "").lower()) if t not in STOP and t not in drop}
NAME_STOP = {"construction", "enterprises", "enterprise", "builders", "trading", "corporation", "corp", "supply", "services", "general", "merchandise", "inc", "and", "the", "company"}
def ntoks(s): return {t for t in re.findall(r"[a-z]{3,}", (s or "").lower()) if t not in NAME_STOP}
bid = [{"url": d["url"], "title": re.sub(r"\s+", " ", d["text"]), "kind": ("ITB" if re.search(r"ITB", d["url"], re.I) else "NOA" if re.search(r"NOA", d["url"], re.I) else "NTP" if re.search(r"NTP", d["url"], re.I) else "RFQ" if re.search(r"RFQ", d["url"], re.I) else "BID" if "bid" in d["url"].lower() else "doc")}
       for d in docs if d["pageTitle"] == "Bids and Awards" and len(d["text"]) > 25]
out = []
for g in proj:
    pt = toks(g["project"]); cn = ntoks(g["contractor"])
    ph = []
    for r in aw:
        awardee = D["awardee"][r[ix["awardee"]]] if r[ix["awardee"]] is not None else ""; amt = r[ix["amount"]]
        if not awardee or not amt: continue
        name_ok = bool(cn) and len(cn & ntoks(awardee)) / len(cn) >= 0.6
        amt_ok = abs(amt - g["cost"]) <= 0.03 * g["cost"]
        title_ov = len(pt & toks(r[ix["title"]])) / max(len(pt), 1)
        if (name_ok and amt_ok) or (name_ok and title_ov >= 0.5) or (amt_ok and title_ov >= 0.6):
            ph.append({"awardRef": r[ix["awardRef"]], "bidRef": r[ix["bidRef"]], "awardDate": r[ix["awardDate"]], "awardee": awardee, "amount": amt, "title": r[ix["title"]], "nameMatch": name_ok, "amountMatch": amt_ok, "titleOverlap": round(title_ov, 2)})
    rel = []
    for b in bid:
        bt = toks(b["title"]); ov = len(pt & bt)
        if ov >= 3 and ov / max(len(pt), 1) >= 0.5: rel.append({**b, "score": round(ov / max(len(pt), 1), 2)})
    rel.sort(key=lambda x: -x["score"])
    out.append({"project": g["project"], "philgeps": ph[:3], "bidDocs": rel[:4]})
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
print(len(out), "projects;", sum(1 for o in out if o["philgeps"]), "with a PhilGEPS match;", sum(1 for o in out if o["bidDocs"]), "with related bid documents;", len(aw), "Pinamalayan PhilGEPS awards;", len(bid), "bid documents")
