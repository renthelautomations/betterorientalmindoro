"""Lists every PDF the old Pinamalayan site (https://www.pinamalayan.gov.ph/, WordPress) links from its pages and posts: file URL, link text, the page it sits on.
Reads wp-sitemap.xml (posts and pages), then each page once, one request per second, volunteer User-Agent. Writes a JSON list (default: scratch path given as argv[1]).
Only links are collected here; documents are fetched separately and only when needed."""
import json, re, sys, time, html, urllib.request, urllib.parse
UA = "BetterOrientalMindoro-data-fetch (volunteer civic project)"
B = "https://www.pinamalayan.gov.ph/"
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=40).read().decode("utf8", "ignore")
urls = []
for sm in re.findall(r"<loc>([^<]+)</loc>", get(B + "wp-sitemap.xml")):
    if "posts-post" in sm or "posts-page" in sm:
        time.sleep(1); urls += re.findall(r"<loc>([^<]+)</loc>", get(sm))
print(len(urls), "pages", file=sys.stderr)
found = {}
for n, u in enumerate(urls):
    time.sleep(1)
    try: h = get(u)
    except Exception as e: print("skip", u, e, file=sys.stderr); continue
    title = html.unescape((re.search(r"<title>([^<]*)", h) or [0, ""])[1]).split(" | ")[0].strip()
    for m in re.finditer(r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', h, re.S | re.I):
        link = urllib.parse.urljoin(u, m.group(1)); text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", m.group(2)))).strip()
        found.setdefault(link, {"url": link, "text": text, "page": u, "pageTitle": title})
    if n % 25 == 0: print(n, len(found), file=sys.stderr)
json.dump(sorted(found.values(), key=lambda x: x["url"]), open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
print(len(found), "pdf links", file=sys.stderr)
