// Extract structured facts from the OCR cache and write src/data/gov/{procurement-docs,projects,flags}.json.
// Usage (full set, deterministic): GOV_CACHE=../gov-cache node --experimental-strip-types scripts/gov-extract.mjs
// Defaults: cache = ../../gov-cache relative to this repo (the worktree layout), override with GOV_CACHE. Read-only on the cache.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extract, summarize, reconcile, buildProjects } from "../src/lib/gov-extract.mjs";
import { buildFlags, summarizeFlags } from "../src/lib/gov-flags.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = process.env.GOV_CACHE ? path.resolve(process.env.GOV_CACHE) : path.join(root, "..", "..", "gov-cache");
const gov = (f) => path.join(root, "src", "data", "gov", f);
const proc = JSON.parse(fs.readFileSync(gov("procurement.json"), "utf8"));
const today = process.env.GOV_TODAY || new Date().toISOString().slice(0, 10);

const items = proc.items.map((it) => {
  const base = { id: it.id, refNo: it.refNo, type: it.type, title: it.title, date: it.date, url: it.url };
  const f = path.join(cache, "ocr", `${it.id}.json`);
  let o = null;
  try { o = JSON.parse(fs.readFileSync(f, "utf8")); } catch { /* not OCR'd yet */ }
  if (!o || !Array.isArray(o.pages) || o.error) return { ...base, ocr: false, pageCount: o?.pageCount ?? null, fields: {}, confidence: {}, summary: null, summaryFil: null, evidence: [], ocrChars: 0 };
  const r = extract(it.type, o.pages);
  return { ...base, ocr: true, pageCount: o.pageCount ?? o.pages.length, fields: r.fields, confidence: r.confidence, evidence: r.evidence, ocrChars: o.pages.join("").length, summary: null, summaryFil: null };
});
reconcile(items.filter((i) => i.ocr));
for (const it of items) if (it.ocr) { const s = summarize(it); it.summary = s.en; it.summaryFil = s.fil; }

const docs = items.filter((i) => i.ocr);
const projects = buildProjects(items, items);
const flags = buildFlags(projects, items, { today });

// Published data keeps business names only: the notices also name the owner or managing officer, and those people are not repeated here.
for (const it of items) {
  for (const k of ["officer", "officerTitle"]) { delete it.fields?.[k]; delete it.confidence?.[k]; }
  if (it.evidence) it.evidence = it.evidence.filter((e) => !["officer", "officerTitle", "contractor", "winner"].includes(e.field)).filter((e) => !/president|proprietor|authorized\s*managing/i.test(e.quote ?? "")).map((e) => ({ ...e, quote: e.quote?.replace(/\s*\b(?:MR|MRS|MS|ENGR|ATTY|DR|ARCH)\.[\s\S]*$/i, " […]") }));
}
for (const f of flags) f.evidence = f.evidence.map((e) => ({ ...e, quote: e.quote?.replace(/\s*\b(?:MR|MRS|MS|ENGR|ATTY|DR|ARCH)\.[\s\S]*$/i, " […]") ?? e.quote }));
const out = (f, o) => fs.writeFileSync(gov(f), JSON.stringify(o, null, 1) + "\n");
out("procurement-docs.json", { source: proc.source, fetchedAt: proc.fetchedAt, extractedAt: today, items });
out("projects.json", { source: proc.source, extractedAt: today, projects });
out("flags.json", { extractedAt: today, summary: summarizeFlags(flags), flags });

const byType = {};
for (const i of items) { const t = (byType[i.type] ??= { listed: 0, ocr: 0 }); t.listed++; if (i.ocr) t.ocr++; }
console.log(`docs ${items.length} (OCR'd ${docs.length}); projects ${projects.length}; flags ${flags.length}`, byType, summarizeFlags(flags));
