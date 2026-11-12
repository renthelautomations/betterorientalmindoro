#!/usr/bin/env python3
"""Build the Oriental Mindoro slice of open PhilGEPS procurement data.

Source: Hugging Face dataset bettergovph/philgeps-v2 (CC0), typed layer
(philgeps-2000-2025-typed.parquet, ~1.2 GB). One row = one NOTICE LINE ITEM;
awards repeat contract_amount on every line, so we count each AWARD once.

Usage (the cache venv has duckdb):
  "/Users/renthelcueto/Documents/Better Oriental Mindoro/gov-cache/venv/bin/python" \\
      scripts/fetch-philgeps.py [--cache DIR] [--recent-years 3]
The parquet is downloaded once (resumable, polite User-Agent) into DIR (default:
<project root>/gov-cache/philgeps, outside the repo). Raw data is never committed.
Writes src/data/philgeps/awards.json and aggregates.json.

MATCH RULES ("Oriental Mindoro", conservative; matchBy = delivery | entity | both)
 delivery: area_of_delivery contains "Oriental Mindoro" (the export publishes
   province-level areas; no municipality-only values exist, so bare municipality
   names are not used for delivery). "Occidental Mindoro" never matches. Multi-province
   areas that list Oriental Mindoro do match.
 entity: (a) when the export carries procuring_entity_province (46-column CSV layouts)
   that column decides: province = "Oriental Mindoro". The column wins over the name
   (a "... OPOL, ORIENTAL MINDORO" school filed under Misamis Oriental is NOT matched).
   (b) when the column is null, the entity NAME decides: it names "Oriental Mindoro"
   (also "Mindoro Oriental", "Or. Mindoro", "Oriental, Mindoro") and not Occidental/Occ.;
   or it contains one of the municipality names that never appear with another province
   in rows where the province column IS present: Bansud, Calapan, Mansalay, Naujan,
   Pinamalayan, Pola, Puerto Galera. Ambiguous names (Baco, Bongabong, Bulalacao, Gloria,
   Roxas, San Teodoro, Socorro, Victoria) and a bare "Mindoro" are NOT matched by name
   alone; such entities are still caught by (a) or by delivery when their rows say so.
Awards: rows with award_reference_no, deduped on (award ref, awardee, amount).
Year/date: award_date; null when outside 2000-2025 or the typed layer flags
 award_before_bid_published (one of the two dates is wrong; we cannot tell which).
Never reads created_by / awardee_contact_person (they are not in the dataset).
"""
import argparse, datetime as dt, json, os, sys, urllib.request
import duckdb

REPO = "bettergovph/philgeps-v2"
FILE = "philgeps-2000-2025-typed.parquet"
UA = "BetterOrientalMindoro-data-fetch (volunteer civic project)"
BASE = f"https://huggingface.co/datasets/{REPO}/resolve/main/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "philgeps")
SAFE_MUNIS = ["bansud", "calapan", "mansalay", "naujan", "pinamalayan", "pola", "puerto galera"]
NAME_RE = r"ORIENTAL[ ,]*MINDORO|MINDORO[ ,]*(ORIENTAL|OR\.)|\bOR\.? ?MINDORO"
OCC_RE = r"OCCIDENTAL|OCCIENTAL|OCCDENTAL|\bOCC\b|OCC\."


def get(name, dest):
    """Resumable download via HTTP Range."""
    url = BASE + name
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": UA})
    size = int(urllib.request.urlopen(req).headers["Content-Length"])
    have = os.path.getsize(dest) if os.path.exists(dest) else 0
    if have == size:
        return
    print(f"downloading {name} ({size} bytes, have {have})", file=sys.stderr)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Range": f"bytes={have}-"})
    with urllib.request.urlopen(req) as r, open(dest, "ab" if have else "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)


def hf_sha():
    try:
        req = urllib.request.Request(f"https://huggingface.co/api/datasets/{REPO}", headers={"User-Agent": UA})
        return json.load(urllib.request.urlopen(req))["sha"]
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=os.path.abspath(os.path.join(ROOT, "..", "..", "gov-cache", "philgeps")))
    ap.add_argument("--recent-years", type=int, default=3)
    a = ap.parse_args()
    os.makedirs(a.cache, exist_ok=True)
    pq = os.path.join(a.cache, "philgeps-typed.parquet")
    get(FILE, pq)
    get("manifest.json", os.path.join(a.cache, "manifest.json"))
    manifest = json.load(open(os.path.join(a.cache, "manifest.json")))
    typed = next(f for f in manifest["files"] if f["file"] == FILE)

    c = duckdb.connect()
    safe = "|".join(SAFE_MUNIS)
    name_hit = (f"(regexp_matches(upper(procuring_entity_name), '{NAME_RE}') "
                f"and not regexp_matches(upper(procuring_entity_name), '{OCC_RE}')) "
                f"or regexp_matches(lower(procuring_entity_name), '\\b({safe})\\b')")
    c.execute(f"""
    create table m as select
      award_reference_no ar, bid_reference_no br, line_item_no li, item_name,
      coalesce(award_title, notice_title) title, business_category cat,
      procuring_entity_name ent, area_of_delivery area,
      awardee_organization_name awardee, contract_amount::double amount,
      award_date, award_notice_status status, procurement_mode mode,
      list_contains(_cleaning_issues, 'award_before_bid_published') bad_order,
      coalesce(area_of_delivery ilike '%oriental mindoro%', false) d,
      coalesce(case when procuring_entity_province is not null
             then procuring_entity_province = 'Oriental Mindoro'
           else {name_hit} end, false) e
    from '{pq}'
    where area_of_delivery ilike '%oriental mindoro%'
       or procuring_entity_province = 'Oriental Mindoro'
       or (procuring_entity_province is null and procuring_entity_name is not null and ({name_hit}))
    """)
    q = lambda s: c.execute(s).fetchall()
    raw = q("select count(*) from m")[0][0]
    by_rule_rows = dict(q("select case when d and e then 'both' when d then 'delivery' else 'entity' end, count(*) from m group by 1"))
    lines_award = q("select count(*) from m where ar is not null")[0][0]
    distinct_refs = q("select count(distinct ar) from m where ar is not null")[0][0]
    pre_dedupe = q("select count(*) from (select distinct ar, awardee, amount, br, li from m where ar is not null)")[0][0]

    c.execute("""
    create table a as select
      ar, any_value(awardee) awardee, amount,
      arg_min(br, coalesce(li, 0)) br, arg_min(title, coalesce(li, 0)) title,
      arg_min(item_name, coalesce(li, 0)) item1, arg_min(cat, coalesce(li, 0)) cat,
      arg_min(ent, coalesce(li, 0)) ent, arg_min(area, coalesce(li, 0)) area,
      arg_min(status, coalesce(li, 0)) status, arg_min(mode, coalesce(li, 0)) mode,
      min(award_date) ad, bool_or(bad_order) bad_order,
      count(distinct coalesce(li::varchar, item_name, br)) items,
      case when bool_or(d) and bool_or(e) then 'both' when bool_or(d) then 'delivery' else 'entity' end matchby
    from m where ar is not null group by ar, awardee, amount
    """)
    dist_awards = q("select count(*) from a")[0][0]
    c.execute("""create table f as select *,
      case when ad is null or bad_order or year(ad) < 2000 or year(ad) > 2025 then null else ad end good_date
      from a""")
    bad_dates = q("select count(*) from f where ad is not null and good_date is null")[0][0]
    no_date = q("select count(*) from f where ad is null")[0][0]
    no_amount = q("select count(*) from f where amount is null")[0][0]
    no_awardee = q("select count(*) from f where awardee is null or trim(awardee) = ''")[0][0]
    by_rule_awards = dict(q("select matchby, count(*) from f group by 1"))

    def top(col, n, order):
        return [dict(name=r[0], awards=r[1], amount=round(r[2] or 0, 2)) for r in q(
            f"select {col}, count(*), sum(amount) from f where {col} is not null group by 1 "
            f"order by {order} desc, 1 limit {n}")]
    aggs = dict(
        byYear=[dict(year=r[0], awards=r[1], amount=round(r[2] or 0, 2)) for r in q(
            "select year(good_date), count(*), sum(amount) from f where good_date is not null group by 1 order by 1")],
        undated=dict(awards=q("select count(*) from f where good_date is null")[0][0],
                     amount=round(q("select coalesce(sum(amount),0) from f where good_date is null")[0][0], 2)),
        topEntitiesByAmount=top("ent", 25, "coalesce(sum(amount),0)"),
        topEntitiesByCount=top("ent", 25, "count(*)"),
        topAwardeesByAmount=top("awardee", 25, "coalesce(sum(amount),0)"),
        topAwardeesByCount=top("awardee", 25, "count(*)"),
        topCategories=top("cat", 15, "count(*)"),
        procurementModes=[dict(name=r[0], awards=r[1], share=round(r[1] / dist_awards, 4)) for r in q(
            "select coalesce(mode, '(blank)'), count(*) from f group by 1 order by 2 desc")],
        missing=dict(amount=no_amount, awardee=no_awardee, awardDate=no_date, implausibleOrFlaggedDate=bad_dates),
        total=dict(awards=dist_awards, amount=round(q("select coalesce(sum(amount),0) from f")[0][0], 2)),
    )
    ent30 = [dict(name=r[0], awards=r[1]) for r in q("select ent, count(*) from f group by 1 order by 2 desc, 1 limit 30")]
    ent30_rows = [dict(name=r[0], rows=r[1]) for r in q("select ent, count(*) from m where e group by 1 order by 2 desc, 1 limit 30")]

    def trim(s, n):
        return None if s is None else (s if len(s) <= n else s[: n - 1] + "…")

    rows = q("select ar, br, title, item1, cat, ent, area, awardee, amount, status, matchby, good_date, items from f "
             "order by good_date desc nulls last, ar")
    # Compact table: dictionary-encoded repeated strings, rows as arrays (src/lib/philgeps.ts expands them).
    DKEYS = ["category", "entity", "area", "awardee", "status", "matchBy"]
    d = {k: {} for k in DKEYS}
    ix = lambda k, v: None if v is None else d[k].setdefault(v, len(d[k]))
    awards = []
    for ar, br, title, item1, cat, ent, area, awardee, amount, status, mb, gd, items in rows:
        if gd is None:
            continue  # undated awards: aggregates only
        awards.append([gd.date().isoformat(), br, ar, trim(title or item1, 120), ix("category", cat or None),
                       ix("entity", ent), ix("area", area), ix("awardee", awardee), amount,
                       ix("status", status), ix("matchBy", mb), items or 1])
    maxy = max(int(r[0][:4]) for r in awards)
    cutoff = maxy - a.recent_years + 1
    kept = [r for r in awards if int(r[0][:4]) >= cutoff]
    table = dict(v=1, f=["awardDate", "bidRef", "awardRef", "title", "category", "entity", "area", "awardee", "amount",
                         "status", "matchBy", "items"], d={k: list(d[k]) for k in DKEYS}, r=kept)
    os.makedirs(OUT, exist_ok=True)
    dump = lambda o, p: open(os.path.join(OUT, p), "w").write(json.dumps(o, separators=(",", ":"), ensure_ascii=False))
    dump(table, "awards.json")
    aggs["meta"] = dict(
        dataset=REPO, datasetSha=hf_sha(), manifestBuiltAt=manifest.get("built_at"),
        manifestPipelineCommit=manifest["pipeline"]["commit"], sourceCommit=manifest["pipeline"]["source_commit"],
        file=FILE, fileSha256=typed["sha256"], license="CC0-1.0",
        counts=dict(rawRowsMatched=raw, rawRowsByRule=by_rule_rows, rowsWithAwardRef=lines_award,
                    distinctAwardRefs=distinct_refs, lineItemsAfterRepublishDedupe=pre_dedupe,
                    distinctAwardsAfterDedupe=dist_awards, awardsByRule=by_rule_awards, awardsKeptInAwardsJson=len(kept)),
        awardsJson=f"Full detail kept for award years {cutoff}-{maxy} only ({len(kept)} awards). Older years and awards with no usable date appear only in aggregates (computed from all {dist_awards} awards).",
        matchDefinition=__doc__.split("MATCH RULES", 1)[1].split("Never reads")[0].strip(),
        topEntitiesMatchedByAwards=ent30, topEntitiesMatchedByRows=ent30_rows,
        caveats=[
            "One source row is a notice line item, not an award; each award is counted once (deduped on award reference, awardee and amount).",
            "Quarters were republished, so the exports contain duplicate rows; they are collapsed by the award dedupe.",
            "Amounts have no stated currency; PHP is assumed, not confirmed.",
            "Award dates can be wrong as published. Dates outside 2000-2025, or flagged award_before_bid_published, are stored as null and the award is excluded from year series.",
            "Figures are what the exports publish, not verified spending. An award, amount or flag does not by itself establish wrongdoing.",
            "Coverage differs by export layout: procuring-entity location columns exist only in some exports, so entity matching falls back to names there.",
            "Names are as published; no entity or supplier has been merged. Joint ventures are not split.",
            "Multi-province delivery areas that list Oriental Mindoro are included in full.",
            "Names of private individuals (notice posters and supplier representatives) are withheld by the dataset and are not in this output.",
        ],
        nulls="year/awardDate null when implausible or flagged; amount null when blank; category null when blank; datasetSha is the Hugging Face git commit at build time (null if the API was unreachable).",
        builtAt=dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
    )
    dump(aggs, "aggregates.json")
    print(json.dumps(aggs["meta"]["counts"], indent=1))
    print("top entities (awards):")
    for e in ent30:
        print(" ", e["awards"], e["name"])
    for p in ("awards.json", "aggregates.json"):
        print(p, os.path.getsize(os.path.join(OUT, p)))


if __name__ == "__main__":
    main()
