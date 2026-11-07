"""Download every document listed in src/data/gov/*.json once and OCR it into a local cache (never committed).
Usage: python scripts/gov-ocr.py <shard> <shards>      e.g. 0 4  (run four shards in parallel)
Cache: $GOV_CACHE (default ../gov-cache): pdfs/<id>.pdf and ocr/<id>.json = {id, kind, url, bytes, sha256, pageCount, pages:[text]}.
The PDFs are scanned images (no text layer), so each page is rendered and read with RapidOCR. Politeness: volunteer User-Agent, 0.6 s between downloads.
Setup: python3 -m venv venv && venv/bin/pip install pymupdf rapidocr-onnxruntime"""
import hashlib, json, os, sys, time, urllib.request
import pymupdf
from rapidocr_onnxruntime import RapidOCR

shard, shards = int(sys.argv[1]), int(sys.argv[2])
root = os.environ.get("GOV_CACHE", os.path.join(os.path.dirname(__file__), "..", "..", "gov-cache"))
os.makedirs(f"{root}/pdfs", exist_ok=True); os.makedirs(f"{root}/ocr", exist_ok=True)
MAXP = 120
items = []
for kind in ["eo", "reports", "procurement"]:  # small sets first so their summaries can start early
    for it in json.load(open(os.path.join(os.path.dirname(__file__), "..", "src", "data", "gov", f"{kind}.json")))["items"]:
        items.append((kind, it))
mine = [x for i, x in enumerate(items) if i % shards == shard]
ocr = RapidOCR()
UA = "BetterOrientalMindoro-data-fetch (volunteer civic project)"
done = 0
for kind, it in mine:
    out = f"{root}/ocr/{it['id']}.json"
    if os.path.exists(out): continue
    pdf = f"{root}/pdfs/{it['id']}.pdf"
    if not os.path.exists(pdf):
        for attempt in range(3):
            try:
                req = urllib.request.Request(it["url"], headers={"User-Agent": UA})
                open(pdf, "wb").write(urllib.request.urlopen(req, timeout=90).read()); break
            except Exception as e:
                err = str(e); time.sleep(3)
        else:
            json.dump({"id": it["id"], "kind": kind, "url": it["url"], "error": err}, open(out, "w")); continue
        time.sleep(0.6)
    try:
        data = open(pdf, "rb").read()
        d = pymupdf.open(pdf); pages = []
        for i, p in enumerate(d):
            if i >= MAXP: break
            pix = p.get_pixmap(dpi=150); tmp = f"{root}/tmp{shard}.png"; pix.save(tmp)
            r, _ = ocr(tmp)
            pages.append("\n".join(x[1] for x in (r or [])))
        json.dump({"id": it["id"], "kind": kind, "url": it["url"], "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "pageCount": len(d), "ocrPages": len(pages), "pages": pages}, open(out, "w"))
    except Exception as e:
        json.dump({"id": it["id"], "kind": kind, "url": it["url"], "error": f"ocr: {e}"}, open(out, "w"))
    done += 1
    if done % 20 == 0: print(f"shard {shard}: {done}/{len(mine)}", flush=True)
print(f"shard {shard} finished", flush=True)
