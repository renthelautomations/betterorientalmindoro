"""Download PDFs from a JSON list [{url,...}] once and OCR them into a local cache (never committed).
Usage: venv/bin/python scripts/ocr-pdf-list.py <list.json> <cache-dir> <shard> <shards> [maxpages]
Cache: <cache-dir>/pdfs/<name>.pdf and ocr/<name>.json = {url, bytes, pageCount, pages:[text]}. Scanned PDFs (no text layer), read with RapidOCR. One download per 0.6 s, volunteer User-Agent.
Setup: python3 -m venv venv && venv/bin/pip install pymupdf rapidocr-onnxruntime opencv-python-headless"""
import hashlib, json, os, sys, time, urllib.request
import cv2
cv2.setNumThreads(1)
import numpy as np, pymupdf
import onnxruntime as ort
_O = ort.InferenceSession
def _one(path, sess_options=None, *a, **kw):
    so = sess_options or ort.SessionOptions(); so.intra_op_num_threads = 1; so.inter_op_num_threads = 1
    return _O(path, sess_options=so, *a, **kw)
ort.InferenceSession = _one
from rapidocr_onnxruntime import RapidOCR
lst, root, shard, shards = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
MAXP = int(sys.argv[5]) if len(sys.argv) > 5 else 60
os.makedirs(f"{root}/pdfs", exist_ok=True); os.makedirs(f"{root}/ocr", exist_ok=True)
items = json.load(open(lst)); ocr = RapidOCR()
for n, it in enumerate(items):
    if n % shards != shard: continue
    name = os.path.basename(it["url"]).rsplit(".", 1)[0]; out = f"{root}/ocr/{name}.json"
    if os.path.exists(out): continue
    pdf = f"{root}/pdfs/{name}.pdf"
    if not os.path.exists(pdf):
        time.sleep(0.6)
        try: open(pdf, "wb").write(urllib.request.urlopen(urllib.request.Request(it["url"], headers={"User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)"}), timeout=120).read())
        except Exception as e: print("SKIP", it["url"], e, flush=True); continue  # a link on the town's site that no longer works is itself worth listing
    d = pymupdf.open(pdf); pages = []
    for i, p in enumerate(d):
        if i >= MAXP: break
        pix = p.get_pixmap(dpi=130); img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)[:, :, :3]
        r, _ = ocr(img); pages.append("\n".join(x[1] for x in (r or [])))
    json.dump({"url": it["url"], "bytes": os.path.getsize(pdf), "pageCount": len(d), "pages": pages}, open(out, "w"), ensure_ascii=False)
    print(name, len(d), flush=True)
