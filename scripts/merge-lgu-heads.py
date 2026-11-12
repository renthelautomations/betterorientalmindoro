"""Adds office heads from a town's own official site to src/data/lgu-directory.json.
Pinamalayan: https://pinamalayan.gov.ph/ (home page, section "Executive Branch", data block `directoryData`: names with their office; photos dropped).
Run: python3 scripts/merge-lgu-heads.py <town-slug> <heads.json> <source-url>   heads.json = {"departments":[{"name","details":[office]}], "divisions":[...], "staff":[...]}
Matching is by a small alias table below; unmatched heads are printed so a person can place them."""
import json, re, sys, datetime
slug, heads_path, source = sys.argv[1:4]
D = json.load(open("src/data/lgu-directory.json"))
heads = json.load(open(heads_path))
ALIAS = {  # head's office as published -> our office name
 "Municipal Administrator": "Office of the Municipal Administrator", "Municipal Planning and Development Office": "Municipal Planning & Development Office",
 "Municipal Budget Office": "Municipal Budget Office (MBO)", "Municipal Treasury Office": "Municipal Treasury Office (MTO)", "Municipal Accounting Office": "Municipal Accounting Office",
 "Human Resource Management Office": "Human Resource Management Office (HRMO)", "Municipal Health Office": "Municipal Health Office (MHO)",
 "Municipal Social Welfare and Development Office": "Municipal Social Welfare and Development Office (MSWDO)", "Municipal Civil Registry Office": "Municipal Civil Registrar Office",
 "Municipal Engineering Office / Motorpool Operations": "Municipal Engineering Office", "Municipal Disaster Risk Reduction and Management Office": "Municipal Disaster Risk Reduction & Management Office (MDRRMO)",
 "Market Operations Department": "Market Operations Department (MOD)", "Municipal Agriculture Office": "Municipal Agriculture Office (MAgO)", "Municipal Assessor's Office": "Municipal Assessor's Office",
 "Business Permits and Licenses Office": "Business Permits and Licenses Office", "General Services Office": "General Services Office (GSO)", "Special Concerns Office / PESO": "Public Employment Service Office (PESO/SCO)",
 "Tourism and History Development Division": "Tourism, History and Development Division (THDD)", "Zoning Division": "Zoning Division",
}
d = D[slug]; by = {o["name"]: o for o in d["offices"]}
left = []
for grp in ("departments", "divisions"):
    for h in heads[grp]:
        office = h["details"][0]; target = by.get(ALIAS.get(office, ""))
        if target: target["head"] = re.sub(r"\s+", " ", h["name"]).strip()
        else: left.append((h["name"], office))
d["headsSource"] = source; d["headsVerifiedAt"] = datetime.date.today().isoformat()
d["staff"] = [{"name": re.sub(r"\s+", " ", h["name"]).strip(), "role": h["details"][0], "unit": h["details"][1]} for h in heads["staff"]]
d["unlisted"] = [{"office": o, "head": n} for n, o in left]  # offices the town names but we hold no contact for yet
json.dump(D, open("src/data/lgu-directory.json", "w"), ensure_ascii=False, indent=1); open("src/data/lgu-directory.json", "a").write("\n")
print("heads set:", sum(1 for o in d["offices"] if o.get("head")), "| unlisted:", left)
