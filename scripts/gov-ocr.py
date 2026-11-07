"""Download every document listed in src/data/gov/*.json once and OCR it into a local cache (never committed).
Usage: python scripts/gov-ocr.py <shard> <shards>      e.g. 0 4  (run four shards in parallel)
Cache: $GOV_CACHE (default ../gov-cache): pdfs/<id>.pdf and ocr/<id>.json = {id, kind, url, bytes, sha256, pageCount, pages:[text]}.
The PDFs are scanned images (no text layer), so each page is rendered and read with RapidOCR. Politeness: volunteer User-Agent, 0.6 s between downloads.
Setup: python3 -m venv venv && venv/bin/pip install pymupdf rapidocr-onnxruntime"""
import hashlib, json, os, sys, time, urllib.request
import cv2
cv2.setNumThreads(1)
import pymupdf
import onnxruntime as ort
_Orig = ort.InferenceSession
def _one_thread(path, sess_options=None, *a, **kw):  # RapidOCR exposes no thread setting: without this every process spins up one thread per core and they starve each other
    so = sess_options or ort.SessionOptions(); so.intra_op_num_threads = 1; so.inter_op_num_threads = 1
    return _Orig(path, sess_options=so, *a, **kw)
ort.InferenceSession = _one_thread
from rapidocr_onnxruntime import RapidOCR

shard, shards = int(sys.argv[1]), int(sys.argv[2])
root = os.environ.get("GOV_CACHE", os.path.join(os.path.dirname(__file__), "..", "..", "gov-cache"))
os.makedirs(f"{root}/pdfs", exist_ok=True); os.makedirs(f"{root}/ocr", exist_ok=True)
MAXP = 120
items = []
for kind in ["eo", "procurement", "reports"]:  # reports last: they are the longest
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
        keep = None
        if kind == 'reports' and len(d) > 28: keep = set(range(25)) | {len(d) - 3, len(d) - 2, len(d) - 1}
        for i, p in enumerate(d):
            if i >= MAXP: break
            if keep is not None and i not in keep:
                pages.append(''); continue
            z = min(150 / 72, 1700 / max(p.rect.width, p.rect.height)); pix = p.get_pixmap(matrix=pymupdf.Matrix(z, z)); tmp = f"{root}/tmp{shard}.png"; pix.save(tmp)
            r, _ = ocr(tmp)
            if i % 5 == 4: print(f'shard {shard}: {it["id"]} page {i+1}', flush=True)
            pages.append("\n".join(x[1] for x in (r or [])))
        json.dump({"id": it["id"], "kind": kind, "url": it["url"], "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "pageCount": len(d), "ocrPages": len(pages), "pages": pages}, open(out, "w"))
    except Exception as e:
        json.dump({"id": it["id"], "kind": kind, "url": it["url"], "error": f"ocr: {e}"}, open(out, "w"))
    done += 1
    if done % 20 == 0: print(f"shard {shard}: {done}/{len(mine)}", flush=True)
print(f"shard {shard} finished", flush=True)
