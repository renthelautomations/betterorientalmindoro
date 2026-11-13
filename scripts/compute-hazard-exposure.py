"""Share of each barangay's land inside each Project NOAH hazard layer and level (BetterGov dataset 22, ODbL).
Input: a PMTiles cut-out of the NOAH vector tiles (pmtiles extract --bbox=120.78,12.19,121.58,13.55 --maxzoom=12 ...), zoom 12.
For every z12 tile: clip the hazard polygons to the tile (so the tile buffer is never counted twice), intersect with each barangay, add up the areas.
Areas are taken in Web Mercator for both the barangay and the hazard, so the shares are consistent. Output: src/data/hazard-exposure.json
Run: venv/bin/python scripts/compute-hazard-exposure.py <z12.pmtiles> [limit-town-pcode-prefix]"""
import gzip, json, math, sys, datetime, collections
from pmtiles.reader import Reader, MmapSource
import mapbox_vector_tile as mvt
from shapely.geometry import shape, box, Polygon, MultiPolygon
from shapely.ops import transform, unary_union
from shapely import STRtree
from pyproj import Transformer

Z = 12; N = 2 ** Z; R = 6378137.0; ORIGIN = math.pi * R; TILE_M = 2 * ORIGIN / N
LAYERS = {"debris_flow": "HAZ", "landslide": "HAZ", "flood_5yr": "Var", "flood_25yr": "Var", "flood_100yr": "Var", "storm_surge_ssa1": "HAZ", "storm_surge_ssa2": "HAZ", "storm_surge_ssa3": "HAZ", "storm_surge_ssa4": "HAZ"}
to3857 = Transformer.from_crs(4326, 3857, always_xy=True).transform
brg = json.load(open("public/data/barangays.geojson"))["features"]
polys = {}
for f in brg:
    g = transform(to3857, shape(f["geometry"]))
    if not g.is_valid: g = g.buffer(0)
    polys[f["properties"]["ADM4_PCODE"]] = g
codes = list(polys); tree = STRtree([polys[c] for c in codes])
minx = min(g.bounds[0] for g in polys.values()); maxx = max(g.bounds[2] for g in polys.values()); miny = min(g.bounds[1] for g in polys.values()); maxy = max(g.bounds[3] for g in polys.values())
x0, x1 = int((minx + ORIGIN) // TILE_M), int((maxx + ORIGIN) // TILE_M); y0, y1 = int((ORIGIN - maxy) // TILE_M), int((ORIGIN - miny) // TILE_M)
acc = collections.defaultdict(lambda: collections.defaultdict(float))  # pcode -> "layer:level" -> area
anyacc = collections.defaultdict(lambda: collections.defaultdict(float))  # pcode -> layer -> area of union over levels
reader = Reader(MmapSource(open(sys.argv[1], "rb")))
done = 0
for tx in range(x0, x1 + 1):
    for ty in range(y0, y1 + 1):
        data = reader.get(Z, tx, ty)
        if not data: continue
        if data[:2] == b"\x1f\x8b": data = gzip.decompress(data)  # PMTiles tiles are usually gzip
        left, top = tx * TILE_M - ORIGIN, ORIGIN - ty * TILE_M
        tile = box(left, top - TILE_M, left + TILE_M, top)
        hit = [i for i in tree.query(tile) if polys[codes[i]].intersects(tile)]
        if not hit: continue
        dec = mvt.decode(data, y_coord_down=True)
        def px(x, y, ext): return (left + x / ext * TILE_M, top - y / ext * TILE_M)
        haz = {}
        for lname, field in LAYERS.items():
            lay = dec.get(lname)
            if not lay: continue
            ext = lay.get("extent", 4096); byl = collections.defaultdict(list)
            for ft in lay["features"]:
                try: g = shape(ft["geometry"])
                except Exception: continue
                if g.is_empty or g.geom_type not in ("Polygon", "MultiPolygon"): continue
                g = transform(lambda x, y, z=None, e=ext: px(x, y, e), g)
                if not g.is_valid: g = g.buffer(0)
                byl[int(ft["properties"].get(field, 0))].append(g.intersection(tile))
            haz[lname] = {lv: unary_union(gs) for lv, gs in byl.items()}
        for i in hit:
            c = codes[i]; part = polys[c].intersection(tile)
            if part.is_empty: continue
            for lname, lvls in haz.items():
                for lv, g in lvls.items(): acc[c][f"{lname}:{lv}"] += part.intersection(g).area
                if lvls: anyacc[c][lname] += part.intersection(unary_union(list(lvls.values()))).area
        done += 1
        if done % 20 == 0: print(done, "tiles", file=sys.stderr, flush=True)
out = {}
for c, g in polys.items():
    a = g.area
    if a <= 0: continue
    row = {k: round(v / a, 4) for k, v in acc[c].items() if v / a >= 0.0005}
    row.update({f"{l}:any": round(v / a, 4) for l, v in anyacc[c].items() if v / a >= 0.0005})
    out[c] = row
json.dump({"source": "Project NOAH hazard maps via BetterGov dataset 22 (ODbL), zoom-12 tiles; barangay outlines BetterGov dataset 23", "computedAt": datetime.date.today().isoformat(), "note": "Share of the barangay's land area inside each layer and level. Levels are not additive: use :any for the share in any level.", "items": out}, open("src/data/hazard-exposure.json", "w"), separators=(",", ":"))
print(done, "tiles;", len(out), "barangays")
