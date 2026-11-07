// Snapshots the two Oriental Mindoro congressional districts from the BetterGov Budget API into src/data/badyet.json.
// Run: node scripts/fetch-badyet.mjs   (network needed; output is committed, site never calls upstream)
import { writeFileSync } from "node:fs";

const API = "https://budget.bettergov.ph/api/v1";
const IDS = ["leg:oriental-mindoro:1st", "leg:oriental-mindoro:2nd"];
const pick = (o, ks) => Object.fromEntries(ks.map((k) => [k, o[k] ?? null]));

let meta, disclaimers;
const districts = [];
for (const id of IDS) {
  const r = await fetch(`${API}/hgab/2027/districts/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`${id} ${r.status}`);
  const j = await r.json();
  meta ??= j.meta;
  disclaimers ??= j.disclaimers;
  const d = j.data;
  districts.push({
    id: d.id,
    label: d.label,
    url: d.url,
    attribution: pick(d.attribution, ["code", "label", "meaning"]),
    representative: pick(d.representative, ["name", "seat", "bill_count", "profile_url", "bills_url"]),
    offices: d.offices.map((o) => ({
      ...pick(o, ["id", "name", "kind_label", "tier", "tier_text", "co_served_districts", "years_note", "by_congress", "notes", "projects_url"]),
      years: o.years.map((y) => pick(y, ["fy", "stage", "stage_label", "scope", "php"])),
      fy2027: {
        ...pick(o.fy2027, ["nep_php", "hgab3_php", "nep_records", "hgab3_records"]),
        groups: Object.fromEntries(
          Object.entries(o.fy2027.bridge.groups).map(([k, g]) => [k, pick(g, ["label", "sub", "rows", "php", "unconfirmed_rows", "unconfirmed_php"])]),
        ),
        net_php: o.fy2027.bridge.net_php,
        unconfirmed_rows: o.fy2027.annotations?.unconfirmed_rows ?? 0,
        unconfirmed_php: o.fy2027.annotations?.unconfirmed_php ?? 0,
        office_change: o.fy2027.office_change ? pick(o.fy2027.office_change, ["rows", "nep_php", "hgab3_php"]) : null,
      },
    })),
  });
  console.log(id, d.representative.name, d.offices.map((o) => o.name).join(", "));
}

writeFileSync(
  new URL("../src/data/badyet.json", import.meta.url),
  JSON.stringify({
    meta: pick(meta, ["built_at", "source_repo", "source_commit", "notice", "representatives_note"]),
    disclaimers: disclaimers.map((x) => pick(x, ["title", "body", "url"])),
    districts,
  }),
);
