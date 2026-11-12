"""Barangay officials of Pinamalayan from the barangay websites the municipality itself links from https://pinamalayan.gov.ph/ (section "Barangay Websites").
Each site lists "Barangay Officials" (position, name) as published. We keep names and positions only, as shown, plus the site and any official budget documents it links.
Run: python3 scripts/fetch-pinamalayan-barangays.py  -> src/data/barangay-officials/pinamalayan.json (committed; the site never calls upstream). One request per second."""
import json, re, time, html, datetime, urllib.request
UA = "BetterOrientalMindoro-data-fetch (volunteer civic project)"
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=30).read().decode("utf8", "ignore")
home = get("https://pinamalayan.gov.ph/")
sites = sorted(set(re.findall(r'href="(https://[a-z0-9]+\.pinamalayan\.gov\.ph/)"', home)))
def lines(h):
    h = re.sub(r"(?s)<(script|style).*?</\1>", "", h)
    return [l.strip() for l in html.unescape(re.sub(r"<[^>]+>", "\n", h)).split("\n") if l.strip()]
# match each site to the barangay's PSGC code (public/data/barangays.geojson) by name
ROMAN = {"i": "1", "ii": "2", "iii": "3", "iv": "4"}
def key(n):
    n = n.lower().replace("ñ", "n").replace("(pob.)", "").strip()
    m = re.match(r"zone\s+(i{1,3}|iv)$", n)
    if m: return "zone" + ROMAN[m.group(1)]
    return re.sub(r"[^a-z0-9]", "", n)
geo = json.load(open("public/data/barangays.geojson"))["features"]
pcode = {key(f["properties"]["ADM4_EN"]): f["properties"]["ADM4_PCODE"] for f in geo if f["properties"]["ADM3_EN"] == "Pinamalayan"}
out = []
for u in sites:
    time.sleep(1)
    try: h = get(u)
    except Exception as e: out.append({"site": u, "error": str(e)}); continue
    L = lines(h)
    title = next((l for l in L if l.lower().startswith(("barangay ", "zone "))), u)
    off = []
    # the heading is followed by "▶", "Position", "Name"; the same words also appear in history paragraphs, so match the whole shape
    i = next((k for k, l in enumerate(L) if "Barangay Officials" in l and L[k + 1:k + 4] == ["▶", "Position", "Name"]), None)
    if i is not None:
        j = i + 4
        while j + 1 < len(L) and not re.match(r"^[^\w]", L[j]) and not re.match(r"^[^\w]", L[j + 1]) and L[j] != "Downloads":
            off.append({"position": L[j], "name": L[j + 1]}); j += 2
    contact = {}
    em = re.search(r"Email:\s*([^\s]+@[^\s]+)", "\n".join(L)); contact["email"] = em.group(1) if em else None
    docs = sorted(set(re.findall(r'href="([^"]+\.pdf)"', h)))
    out.append({"site": u, "pcode": pcode.get(u.split("//")[1].split(".")[0]), "title": title, "officials": off, "email": contact["email"], "documents": len(docs)})
    print(u, len(off), "officials", len(docs), "pdfs")
json.dump({"source": "https://pinamalayan.gov.ph/ (Barangay Websites)", "fetchedAt": datetime.date.today().isoformat(), "items": out}, open("src/data/barangay-officials/pinamalayan.json", "w"), ensure_ascii=False, indent=1)
