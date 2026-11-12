"""Laws and issuances that name Oriental Mindoro, from BetterGov dataset 24 (Philippine Legal Documents Library, CC BY-NC 4.0,
text from Lawphil / Arellano Law Foundation). Streams the parquet over HTTP, so no multi-GB download.
Run: pip install duckdb && python3 scripts/fetch-laws.py   -> src/data/laws.json (committed; the site never calls upstream).
Only titles, numbers, years and Lawphil links are kept, never the full text."""
import json, re, sys, datetime
import duckdb

SRC = "https://huggingface.co/datasets/bettergovph/gov-library/resolve/main/consolidated.parquet"
OM = re.compile(r"(?i)(oriental\s+mindoro|mindoro\s+oriental)")
TOWNS = {"calapan": "calapan-city", "naujan": "naujan", "puerto galera": "puerto-galera", "pinamalayan": "pinamalayan", "bongabong": "bongabong", "bansud": "bansud",
         "mansalay": "mansalay", "bulalacao": "bulalacao", "san teodoro": "san-teodoro", "socorro": "socorro", "gloria": "gloria", "victoria": "victoria",
         "roxas": "roxas", "baco": "baco", "pola": "pola"}
KIND = {"repacts": ("Republic Act", "RA"), "bataspam": ("Batas Pambansa", "BP"), "presdecs": ("Presidential Decree", "PD"), "proc": ("Proclamation", "Proc."),
        "execord": ("Executive Order", "EO"), "comacts": ("Commonwealth Act", "CA")}
SKIP = re.compile(r"(?i)malaca|manila|by the president|republic of the philippines|congress|^\W*$|whereas|section\s+1|be it enacted|^\[?\s*(republic act|executive order|proclamation|presidential decree|batas|memorandum)[^a-z]*\d")

c = duckdb.connect(); c.sql("install httpfs; load httpfs;")
rows = c.sql(f"""
  select source, cast(year as int) y, path, substr(content, 1, 1800) head
  from '{SRC}'
  where source in ({",".join("'%s'" % k for k in KIND)})
    and regexp_matches(content, '(?i)(oriental\\s+mindoro|mindoro\\s+oriental)')
    and not regexp_matches(path, '/[a-z]+[0-9]{{4}}\\.md$')
""").fetchall()

def title(head):
    t = re.sub(r"[*_\[\]]", "", head.replace(" ", " "))
    lines = [re.sub(r"\s+", " ", l).strip() for l in t.split("\n")]
    for i, l in enumerate(lines):
        letters = [ch for ch in l if ch.isalpha()]
        if len(letters) >= 20 and not SKIP.search(l) and sum(ch.isupper() for ch in letters) / len(letters) > 0.7:
            out = [l]
            for n in lines[i + 1:i + 4]:
                if not n: break
                out.append(n)
            return re.sub(r"\s+", " ", " ".join(out)).strip(" .")
    return None

SMALL = {"of", "in", "the", "a", "an", "to", "and", "for", "by", "on", "as", "at", "or", "from", "into", "with"}
def pretty(s):  # ALL CAPS -> Title Case, small words lower, acronyms (<=3 letters, no vowels) kept upper
    out = []
    for i, w in enumerate(s.lower().split(" ")):
        core = re.sub(r"[^a-zñ]", "", w)
        if i and core in SMALL: out.append(w)
        elif core and len(core) <= 3 and not re.search("[aeiou]", core): out.append(w.upper())
        else: out.append(re.sub(r"[a-zñ]", lambda m: m.group(0).upper(), w, count=1))
    return re.sub(r",(?=\S)", ", ", re.sub(r"-\s+", "-", " ".join(out)))

items = []
for source, y, path, head in rows:
    base = re.search(r"([^/]+)\.md$", path).group(1)
    m = re.match(r"[a-z]+_(\d+[a-z]?)_(\d{4})", base)
    if not m: continue
    t = title(head)
    if not t: continue
    in_title_om = bool(OM.search(t))
    town = next((slug for name, slug in TOWNS.items() if re.search(rf"(?i)\b{name}\b", t)), None)
    if not (in_title_om or (town and OM.search(head))): continue
    folder = {"repacts": "statutes/repacts/ra", "bataspam": "statutes/bataspam/bp", "presdecs": "statutes/presdecs/pd", "comacts": "statutes/comacts/ca",
              "proc": "executive/proc/proc", "execord": "executive/execord/eo"}[source]
    long, short = KIND[source]
    items.append({"id": base, "kind": long, "ref": f"{short} {m.group(1)}", "year": int(m.group(2)), "title": pretty(t), "town": town,
                  "url": f"https://lawphil.net/{folder}{m.group(2)}/{base}.html"})
items.sort(key=lambda x: (-x["year"], x["ref"]))
if len(items) < 50: sys.exit(f"only {len(items)} items, refusing to overwrite")
out = {"source": "BetterGov dataset 24, Philippine Legal Documents Library (CC BY-NC 4.0), text by Lawphil / Arellano Law Foundation",
       "sourceUrl": "https://data.bettergov.ph/datasets/24", "fetchedAt": datetime.date.today().isoformat(), "items": items}
open("src/data/laws.json", "w").write(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
print(len(items), "items;", sum(1 for i in items if i["town"]), "with a town")
