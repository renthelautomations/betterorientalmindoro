"""Build src/data/lgu-pmc/pinamalayan.json from the cleaned PMC projects.
Inputs (scratch files from the earlier steps): clean.json (clean-pmc.py), names-out.json + names-in.json (spacing restored, letters unchanged), all-pdfs.json (crawl), pmc-list.json, cross.json (crosscheck-pmc.py).
Output: { source, fetchedAt, documents:[{url,date,label,ok}], projects:[{project,contractor,cost,fund,barangays,inspections:[{date,progress,state,withFindings,findings,recommendation,url}],philgeps:[],bidDocs:[]}] }"""
import json, os, re, sys, datetime, urllib.request
mode, sd, out = sys.argv[1], sys.argv[2], sys.argv[3]  # mode "named": write named.json for the cross-check; mode "final": merge the cross-check and write the dataset
L = lambda n: json.load(open(f"{sd}/{n}"))
clean, nin, nout, lst = L("pmc-clean.json"), L("names-in.json"), L("names-out.json"), L("pmc-list.json")
cross = [{"philgeps": [], "bidDocs": []}] * len(clean)
k = lambda s: re.sub(r"[^a-z0-9]", "", (s or "").lower())
fix = {(k(a["project"]), k(a["contractor"])): b for a, b in zip(nin, nout)}
geo = json.load(open("public/data/barangays.geojson"))["features"]
brg = {re.sub(r"[^a-z]", "", f["properties"]["ADM4_EN"].lower().replace("(pob.)", "")): f["properties"]["ADM4_PCODE"] for f in geo if f["properties"]["ADM3_EN"] == "Pinamalayan"}
def split_blob(proj):  # medicine purchases: "<item> Supplier: <name> Project Cost: ..." on one line
    m = re.match(r"^(.*?)\s*Supplier:\s*(.*?)\s*Project Cost:", proj)
    return (m.group(1).strip(), m.group(2).strip()) if m else (proj, None)
import glob, os
lines = {}  # original OCR line -> cleaned text (or None to drop)
for fin in sorted(glob.glob(f"{sd}/lines-in-*.json")):
    fo = fin.replace("lines-in-", "lines-out-")
    if not os.path.exists(fo): continue
    for a, b in zip(json.load(open(fin)), json.load(open(fo))):
        lines[a["text"]] = b["text"] if b["keep"] else None
def tidy(ls):
    out = []
    for t in ls:
        c = lines.get(t, None) if lines else t
        if c and c not in out: out.append(c)
    return out
extra = {}
if os.path.exists(f"{sd}/names-out2.json"):
    for a, b in zip(json.load(open(f"{sd}/names-in2.json")), json.load(open(f"{sd}/names-out2.json"))): extra[(k(a["project"]), k(a["contractor"]))] = b
fix.update(extra)
projects = []
for g, c in zip(clean, cross):
    names = fix.get((k(g["raw"]["project"]), k(g["raw"]["contractor"])))
    proj = names["project"] if names else g["project"]; contr = names["contractor"] if names else g["contractor"]; fund = names["fund"] if names else g["fund"]
    if len(proj) > 140:
        proj, sup = split_blob(proj)
        if sup: contr = sup
        if len(proj) > 140: continue  # unreadable block: leave it out rather than publish garbage
    low = k(proj)
    pcodes = sorted({code for name, code in brg.items() if len(name) > 4 and name in low})
    projects.append({"project": proj, "contractor": contr or None, "cost": g["cost"], "fund": fund, "barangays": pcodes, "inspections": [{**i, "findings": tidy(i["findings"]), "recommendation": tidy(i["recommendation"])} for i in g["inspections"]], "philgeps": c["philgeps"], "bidDocs": c["bidDocs"]})
if mode == "named":
    json.dump(projects, open(out, "w"), ensure_ascii=False, indent=1); print(len(projects), "named projects"); sys.exit()
if mode == "final":
    named, cross2 = L("pmc-named.json"), L("cross-named.json")
    projects = [{**n, "philgeps": c["philgeps"], "bidDocs": c["bidDocs"]} for n, c in zip(named, cross2)]
docs = []
for d in lst:
    try: urllib.request.urlopen(urllib.request.Request(d["url"], method="HEAD", headers={"User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)"}), timeout=20); ok = True
    except Exception: ok = False
    docs.append({"url": d["url"], "label": d["text"], "ok": ok})
# ---- "worth a look": computed from the records, and every item is checked against the OCR text of the report page before it is kept ----
def page_of(p, insp):
    """first page of that report that holds the project's inspection report; None if not found"""
    name = os.path.basename(insp["url"]).rsplit(".", 1)[0]; f = f"{sd}/cache/ocr/{name}.json"
    if not os.path.exists(f): return None
    key = k(p["project"])[:22]
    for n, t in enumerate(json.load(open(f))["pages"]):
        tt = k(t)
        if key in tt and "inspectionreport" in tt[:300] and "projectcost" in tt: return n + 1
    return None
def ev(p, insp): return {"project": p["project"], "date": insp["date"], "url": insp["url"], "page": page_of(p, insp)}
def has(p, rx): return [i for i in p["inspections"] if any(re.search(rx, t, re.I) for t in i["findings"] + i["recommendation"])]
flags = []
claim = [(p, i) for p in projects for i in has(p, r"claiming\s*100")]
def deny_final(i):  # the recommendation page of that report asks the mayor to deny the final payment
    name = os.path.basename(i["url"]).rsplit(".", 1)[0]; f = f"{sd}/cache/ocr/{name}.json"
    return os.path.exists(f) and any("denytheir" in k(t) and "finalpayment" in k(t) for t in json.load(open(f))["pages"])
if claim: flags.append({"type": "claim100", "denyFinalPayment": any(deny_final(i) for _, i in claim), "evidence": [ev(p, i) for p, i in claim], "quote": [t for t in claim[0][1]["findings"] if re.search(r"claiming", t, re.I)][:1]})
long_ = []
for p in projects:
    ds = [i["date"] for i in p["inspections"] if i["date"]]
    if len(ds) >= 8 and (datetime.date.fromisoformat(ds[-1]) - datetime.date.fromisoformat(ds[0])).days > 540: long_.append(p)
for p in long_: flags.append({"type": "longrun", "visits": len(p["inspections"]), "first": p["inspections"][0]["date"], "last": p["inspections"][-1]["date"], "cost": p["cost"], "progress": [i["progress"] for i in p["inspections"] if i["progress"] is not None], "evidence": [ev(p, p["inspections"][0]), ev(p, p["inspections"][-1])], "project": p["project"]})
bb = [(p, i) for p in projects for i in has(p, r"billboard")]
if bb: flags.append({"type": "billboard", "projects": len({p["project"] for p, _ in bb}), "evidence": [ev(p, i) for p, i in bb][:12]})
nw = [(p, i) for p in projects for i in has(p, r"NWRB")]
if nw: flags.append({"type": "nwrb", "projects": len({p["project"] for p, _ in nw}), "evidence": [ev(p, i) for p, i in nw][:8]})
unf = []
for p in projects:
    l = p["inspections"][-1]
    if l["state"] == "ongoing" and l["date"] and l["date"] < "2024-01-01" and (l["progress"] or 0) < 100: unf.append((p, l))
if unf: flags.append({"type": "unfinished", "projects": len(unf), "cost": sum(p["cost"] for p, _ in unf), "evidence": [ev(p, l) for p, l in sorted(unf, key=lambda x: -x[0]["cost"])][:10], "progress": [l["progress"] for _, l in sorted(unf, key=lambda x: -x[0]["cost"])][:10]})
dfc = [p for p in projects if has(p, r"crack|pockmark|ponding|rebar|settlement")]
if dfc: flags.append({"type": "defects", "projects": len(dfc), "withFindings": sum(1 for p in projects if any(i["withFindings"] for i in p["inspections"])), "evidence": []})
for f in flags:
    f["evidence"] = [e for e in f["evidence"] if e["page"]] or f["evidence"]  # prefer evidence whose page was found
json.dump({"flags": flags, "source": "https://www.pinamalayan.gov.ph/official-documents-2/ (Project Monitoring Committee inspection reports)", "fetchedAt": datetime.date.today().isoformat(), "documents": docs, "projects": projects}, open(out, "w"), ensure_ascii=False, indent=1)
print(len(projects), "projects;", sum(1 for d in docs if not d["ok"]), "dead report links of", len(docs))
