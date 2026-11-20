"""National Tax Allotment (NTA) shares for Oriental Mindoro from DBM COMPASS public export (no API key).
Writes src/data/nta.json: province, City of Calapan and the 14 municipalities, FY2022-FY2027, amounts in pesos.
Run: python3 scripts/fetch-nta.py   (network needed; output is committed, the site never calls upstream)"""
import io, json, re, sys, urllib.request, zipfile, datetime, pathlib

FY = 2027  # the only fiscal year the export serves; it carries the earlier years as columns
URL = f"https://api.compass.gov.ph/api/v1/public/nta/export?fy={FY}"
req = urllib.request.Request(URL, headers={"User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)"})
z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(req, timeout=120).read()))
sheets = dict(zip(re.findall(r'<sheet [^>]*name="([^"]+)"', z.read("xl/workbook.xml").decode()), range(1, 9)))

def rows(name):
    d = z.read(f"xl/worksheets/sheet{sheets[name]}.xml").decode()
    for r in re.findall(r"<row [^>]*>(.*?)</row>", d, re.S):
        yield [m for m in re.findall(r"<c [^>]*>(?:<v>(.*?)</v>)?</c>", r)]

def pick(name, key_col, label):
    it = rows(name); head = next(it)
    years = [int(re.search(r"FY (\d{4})$", h).group(1)) for h in head if re.fullmatch(r"FY \d{4}", h)]
    first = head.index(f"FY {years[0]}")
    out = []
    for r in it:
        if r[1] == "Oriental Mindoro":
            out.append({"name": r[key_col], "kind": label, "amounts": {str(y): int(float(r[first + i])) for i, y in enumerate(years)}})
    return years, out

yp, prov = pick("Provinces", 1, "province")
yc, city = pick("Cities", 2, "city")
ym, mun = pick("Municipalities", 2, "municipality")
assert yp == yc == ym and len(prov) == 1 and len(city) == 1 and len(mun) == 14, (len(prov), len(city), len(mun))
mun.sort(key=lambda x: -x["amounts"][str(yp[-1])])
json.dump({"source": "https://compass.gov.ph", "docs": "https://compass.gov.ph/api-docs", "export": URL, "unit": "pesos", "years": yp,
           "fetchedAt": datetime.date.today().isoformat(), "province": prov[0], "city": city[0], "municipalities": mun},
          open(pathlib.Path(__file__).parent.parent / "src/data/nta.json", "w"), ensure_ascii=False)
print("province", prov[0]["amounts"], "| city", city[0]["name"], "| towns", len(mun))
