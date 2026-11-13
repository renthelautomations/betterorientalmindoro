"""Clean parse-pmc.py output into one record per project with its inspection timeline.
Fixes: OCR run-together words (wordninja plus the town's barangay names), cost, progress %, status. Groups the same project seen in several reports.
Run: venv/bin/python scripts/clean-pmc.py parsed.json out.json"""
import json, re, sys, collections
import wordninja
rows = json.load(open(sys.argv[1]))
geo = json.load(open("public/data/barangays.geojson"))["features"]
BRGY = sorted({f["properties"]["ADM4_EN"].replace(" (Pob.)", "") for f in geo if f["properties"]["ADM3_EN"] == "Pinamalayan"}, key=len, reverse=True)
BRGY += ["Pambisan Malaki", "Pambisan Munti", "Poblacion", "Sitio", "Purok", "Zone I", "Zone II", "Zone III", "Zone IV"]
compact = {re.sub(r"[^a-z]", "", b.lower()): b for b in BRGY}
def respace(s):
    s = re.sub(r"\s+", " ", s).strip(" .:-")
    if s.count(" ") / max(len(s), 1) > 0.09: return s  # already spaced
    out = []
    for part in re.split(r"([/,&()\-–—:])", s):
        low = re.sub(r"[^a-z0-9.]", "", part.lower()); hold = {}
        for k, b in sorted(compact.items(), key=lambda kv: -len(kv[0])):
            if len(k) > 4 and k in low: low = low.replace(k, f" @{len(hold)} "); hold[f"@{len(hold)}"] = b
        words = []
        for w in low.split():
            words += [hold[w]] if w in hold else wordninja.split(w)
        out.append(" ".join(words) if words else part)
    return re.sub(r"\s+([,/)])", r"\1", re.sub(r"([(/])\s+", r"\1", " ".join(out)))
def title(s):
    small = {"of", "the", "and", "for", "to", "in", "at", "by", "a", "an", "on"}
    w = s.lower().split(" "); return " ".join(x if (i and x in small) else x[:1].upper() + x[1:] for i, x in enumerate(w))
def status_of(s):
    n = re.sub(r"[^A-Z]", "", s.upper()); pct = re.search(r"(\d{1,3}(?:\.\d+)?)\s*%", s)
    return (float(pct.group(1)) if pct else None, "completed" if "COMPLETED" in n else "ongoing" if "ONGOING" in n or "ONGO" in n else "other", "WITHFINDING" in n or "FINDINGS" in n)
groups = collections.OrderedDict()
for r in rows:
    proj = title(respace(r["project"])); contr = title(respace(re.sub(r"\s*Status:.*$", "", r["contractor"])))
    if not r["cost"] or len(proj) < 12: continue
    key = re.sub(r"[^a-z]", "", proj.lower())[:30] + "|" + str(int(r["cost"]))
    pct, st, wf = status_of(r["status"])
    g = groups.setdefault(key, {"raw": {"project": r["project"], "contractor": re.sub(r"\s*Status:.*$", "", r["contractor"]), "fund": r["fund"]}, "project": proj, "contractor": contr, "cost": r["cost"], "fund": title(respace(r["fund"])) if r["fund"] else None, "inspections": []})
    if len(proj) > len(g["project"]) and proj.count(" ") >= g["project"].count(" "): g["project"] = proj
    g["inspections"].append({"date": r["date"], "progress": pct, "state": st, "withFindings": wf, "findings": [re.sub(r"\s+", " ", f).strip() for f in r["findings"] if len(f) > 20][:8], "recommendation": [re.sub(r"\s+", " ", f).strip() for f in r["recommendation"] if len(f) > 20][:8], "url": r["url"]})
out = []
for g in groups.values():
    g["inspections"].sort(key=lambda i: i["date"] or "")
    seen = set(); g["inspections"] = [i for i in g["inspections"] if (i["date"], i["progress"]) not in seen and not seen.add((i["date"], i["progress"]))]
    out.append(g)
out.sort(key=lambda g: g["inspections"][-1]["date"] or "", reverse=True)
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print(len(rows), "records ->", len(out), "projects;", sum(1 for g in out if len(g["inspections"]) > 1), "inspected more than once")
