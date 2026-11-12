// Snapshots the FY2027 project rows of Oriental Mindoro from the BetterGov Budget API (House bill set against the NEP)
// for the programs in the People's Budget Coalition (PBC) red-flag basket that list projects one by one:
// DPWH, DA farm-to-market roads (fmr), DOH health facilities (hfep) and NIA irrigation (nia).
// Writes src/data/redflags.json. Run: node scripts/fetch-redflags.mjs   (network needed; output is committed, the site never calls upstream)
import { writeFileSync } from "node:fs";
import { titleTown } from "../src/lib/dpwh-assign.mjs";

const API = "https://budget.bettergov.ph/api/v1";
const UA = { "User-Agent": "BetterOrientalMindoro-data-fetch (volunteer civic project)" };
const KEYS = ["dpwh", "fmr", "hfep", "nia"];
const OFFICES = /mindoro oriental|southern mindoro/i;     // the two DEOs that serve Oriental Mindoro
const inProvince = (r) => /oriental mindoro/i.test(r.title) || OFFICES.test(r.office || "");

let meta;
const rows = [];
for (const key of KEYS) {
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API}/hgab/2027/datasets/${key}/projects?region=MIMAROPA&limit=500&offset=${offset}`, { headers: UA });
    if (!res.ok) throw new Error(`${key} ${res.status}`);
    const j = await res.json();
    meta ??= j.meta;
    for (const r of j.data.rows) if (inProvince(r) && !/occidental mindoro/i.test(r.office || "")) {
      rows.push({
        id: r.id, dataset: key, title: r.title, program: r.program ?? null, pap: r.pap ?? null, office: r.office ?? null,
        town: titleTown(r.title) ?? null,
        group: r.bridge_group, held: !!r.held, flags: r.flags ?? [],
        nep: r.nep_php ?? null, house: r.house_php ?? null, delta: r.delta_php ?? null,
        pages: { nep: r.pdf_url?.nep ?? null, house: r.pdf_url?.hgab3 ?? null },
        url: r.url,
      });
    }
    if (!j.data.next_offset || !j.data.rows.length) break;
    offset = j.data.next_offset;
    await new Promise((s) => setTimeout(s, 400));
  }
}
const out = { source: "https://budget.bettergov.ph/api/v1/hgab/2027", docs: "https://budget.bettergov.ph/docs", builtAt: meta.built_at, repo: meta.source_repo, notice: meta.notice, items: rows.sort((a, b) => (b.house ?? 0) - (a.house ?? 0)) };
writeFileSync(new URL("../src/data/redflags.json", import.meta.url), JSON.stringify(out) + "\n");
const by = {};
for (const r of rows) by[r.dataset] = (by[r.dataset] ?? 0) + 1;
console.log(rows.length, "rows", by);
