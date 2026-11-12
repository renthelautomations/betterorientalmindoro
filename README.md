# Better Oriental Mindoro

**Live site: [betterorientalmindoro.vercel.app](https://betterorientalmindoro.vercel.app)**

A free, volunteer-led civic website for the province of Oriental Mindoro, Philippines, under the [BetterGov.PH](https://bettergov.ph) initiative. It helps residents find services, hotlines and offices, and helps anyone see how public money and projects affect their province. It is listed in the [BetterGov LGU directory](https://github.com/jmacj/better-lgu-directory) as the provincial portal.

The story and tagline of the site is **MaHalTaNa**, the four icons of the province:

| | Icon |
|---|---|
| **Ma** | Mangyan, the indigenous peoples of Mindoro |
| **Hal** | Mount Halcon |
| **Ta** | Tamaraw |
| **Na** | Naujan Lake |

> **Not an official government website.** This site is not affiliated with or representing the Oriental Mindoro provincial government or any LGU. Every figure shows its source, and amounts are published budgets, not spending.

## What is in it

Every section is **one main page**, with its records laid out on it; each record opens its own detail page. The whole site switches between **English and Filipino** with the EN / FIL toggle (interface text switches; source data and official titles stay as published). Visual design comes from the design kit in `src/components/kit` and the site components built on it in `src/components/site`.

| Section | Main page | Detail pages |
|---|---|---|
| Home | `/` (smart search, live weather and province facts, headlines from the provincial site) | |
| MaHalTaNa | `/mahaltana` (the four pillars) | `/ma` `/hal` `/ta` `/na` (the Mangyan page is a placeholder until communities approve content) |
| Bayan | `/bayan` (map, chart, sortable table, compare) | `/bayan/[slug]`: one page per bayan with tabs for overview, hotlines, projects, elections and the office directory |
| Serbisyo | `/serbisyo` (search, life events, every category) | `/serbisyo/[category]/[service]` (sourced from the Provincial Citizen's Charter; every entry marked draft) |
| Hotlines | `/hotlines` (smart search, filters by place, type and office; each number has its source and date checked; official contacts and office directories for the LGUs) | |
| Proyekto | `/proyekto` (map, dropdown filters, cards or table, by-year chart) | `/proyekto/[id]` |
| Estatistika | `/estatistika` (shaded map, town cards or table, growth, compare) | rows open `/bayan/[slug]` |
| Badyet | `/badyet` (the two districts, with checks and flags) | `/badyet/1st`, `/badyet/2nd`, `/badyet/redflags` (the People's Budget Coalition's red-flag basket, narrowed to Oriental Mindoro's projects) |
| Dinastiya | `/dynasties` (surname network, winners in three views, repeated surnames) | `/dynasties/[town]` |
| Transparency | `/transparency` (government contracts from PhilGEPS and BIR tax collection, narrowed to Oriental Mindoro) | `/transparency/kontrata` (every award of 2023 to 2025) |
| Pamahalaan | `/pamahalaan` (officials and offices, executive orders, procurement, financial reports, jobs, investment) | `/pamahalaan/eo/[id]`, `/pamahalaan/ulat/[id]`, `/pamahalaan/bidding/[ref]`, `/pamahalaan/dokumento/[id]`, `/pamahalaan/mga-tala` |
| Help | `/terms` `/privacy` `/accessibility` `/faq` | |

Older URLs redirect (`/datos`, `/bayan/[slug]/tulong` and the other tab routes, `/serbisyo/[category]`); see `next.config.ts`.

### Pamahalaan: the provincial government's public records

The Provincial Government publishes its executive orders, bids and reports as **scanned PDFs**. We read them (OCR), write short summaries, pull out the key facts, and give every document its own page that links to the official PDF.

- **Summaries are aids, not the document.** Each page says it was read from a scan and links the official PDF. Numbers and dates can be misread; open the PDF to confirm.
- **Notes to review** (`/pamahalaan/mga-tala`) lists automatic checks (for example a contract price above its approved budget, stage dates out of order, a single bidder, how awards are spread among contractors, an invitation with no award listed). A note is a pointer to look closer, **never an allegation**. Every note shows the rule, the evidence, how to verify it, the legal references, a confidence level and a "report a mistake" link.
- **Privacy:** published data keeps business names only. The names of owners and officers that appear in the notices are not repeated.
- Documents are **not re-hosted**. Titles, dates, extracted facts and links are stored; the PDFs stay on [ormindoro.gov.ph](https://ormindoro.gov.ph).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, static generation, cache components) and React, styled with Tailwind CSS
- [MapLibre GL](https://maplibre.org) for the province map (no basemap tiles, no API key)
- [Supabase](https://supabase.com) Postgres for hotlines, projects, government records and the visit counter (public read only)
- [Vitest](https://vitest.dev) for data and logic tests
- [Vercel](https://vercel.com) hosting, with Vercel Web Analytics (aggregate page views, no cookies)
- Optional, only for reading scanned documents: Python with [PyMuPDF](https://pymupdf.readthedocs.io) and [RapidOCR](https://github.com/RapidAI/RapidOCR)

## Getting started

Requires Node.js 22 or newer.

```bash
npm install
cp .env.example .env.local        # fill in only what you need (see below)
npm run dev                       # http://localhost:3000
```

The site runs without any environment variables: the pages read committed JSON snapshots in `src/data/` and GeoJSON in `public/data/`. (Without the Supabase variables the footer visit counter is simply hidden.)

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm test` | Runs the data and logic tests |
| `npm run build` | Runs the tests, then builds. A failing data test blocks the build |
| `npm start` | Serves the production build |

### Environment variables

Copy `.env.example` to `.env.local` (git-ignored). Never commit secrets.

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sitemap and robots URLs (set to your real domain in production) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reading from Supabase and the footer visit counter (publishable key only; fine to expose, row-level security protects the data) |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` | Seeding and migrations only. Server side, never exposed to the browser, never set as public variables |
| `GITHUB_TOKEN`, `GITHUB_REPO`, `VERCEL_*` | Optional tooling |

## Data

Data is snapshotted into the repository so the site never depends on an upstream service at runtime. Refresh a snapshot by re-running its script:

| Script | Writes | Source |
|---|---|---|
| `node scripts/fetch-boundaries.mjs` | `public/data/*.geojson` | NAMRIA/PSA boundaries via [BetterGov Open Data](https://data.bettergov.ph) (MIT) |
| `node scripts/fetch-dpwh.mjs` | `src/data/dpwh.json` | DPWH Infrastructure Transparency Dataset via BetterGov Open Data (CC0) |
| `node scripts/fetch-dynasties.mjs` | `src/data/dynasties/` | [Dynasties by BetterGov](https://dynasties.bettergov.ph) API, from Open Halalan, PSA and PSGC |
| `node scripts/fetch-badyet.mjs` | `src/data/badyet.json` | [BetterGov Budget API](https://budget.bettergov.ph/api/v1) ([docs](https://budget.bettergov.ph/docs); it also has an [MCP server](https://budget.bettergov.ph/docs#mcp) for AI tools) |
| `node scripts/fetch-redflags.mjs` | `src/data/redflags.json` | The same API: FY2027 House bill rows (DPWH, farm-to-market roads, health facilities) in Oriental Mindoro, set against the NEP. The red-flag basket itself (`src/data/redflags-basket.json`) is the [People's Budget Coalition](https://budget.bettergov.ph/hgab/2027/1T-redflags)'s assessment, copied with attribution |
| `node scripts/fetch-stats.mjs` | `src/data/stats.json` | PSA and BLGF/COA figures via Wikidata (CC0) |
| `node scripts/fetch-gov.mjs` | `src/data/gov/*.json` | Public pages and feeds of [ormindoro.gov.ph](https://ormindoro.gov.ph) (one polite pass, volunteer User-Agent, no PDFs downloaded) |
| `python scripts/gov-ocr.py <shard> <shards>` | local cache `../gov-cache` (not committed) | Downloads each listed PDF once and reads it with OCR. Setup: `python3 -m venv venv && venv/bin/pip install pymupdf rapidocr-onnxruntime` |
| `node --experimental-strip-types scripts/gov-extract.mjs` | `src/data/gov/{procurement-docs,projects,flags}.json` | Extracts facts from the OCR cache and runs the checks (set `GOV_CACHE` if the cache is elsewhere) |
| `node scripts/fetch-bir.mjs` | `src/data/bir.json` | BIR tax collection by area and month, 2020-2024, via the BetterGov [BIR dataset](https://huggingface.co/datasets/bettergovph/bir-tax-collection) (CC0). Millions of pesos |
| `python scripts/fetch-philgeps.py` | `src/data/philgeps/*.json` | The Oriental Mindoro slice of the open [PhilGEPS dataset](https://huggingface.co/datasets/bettergovph/philgeps-v2) (CC0, 18.5 million line items): awards counted once, matched by delivery area or procuring office. Needs `duckdb` (`venv/bin/pip install duckdb`) |
| `node scripts/seed-supabase.mjs` | Supabase tables | Loads hotlines and projects (needs `SUPABASE_DB_URL`) |
| `node scripts/seed-gov.mjs` | Supabase `gov_items`, `gov_meta` | Loads every `src/data/gov/*.json` (needs `SUPABASE_DB_URL`; safe to re-run) |

`src/data/hotlines.json`, `src/data/lgu-contacts.json`, `src/data/lgu-directory.json` and `src/data/services.ts` are curated by hand from official pages. Each entry carries its source and the date it was checked. The summaries in `src/data/gov/eo-docs.json` and `reports-docs.json` were written from the OCR text with every quote checked against it.

### Honesty rules

- A dash means "no data", never zero.
- Budget amounts and contract prices are what the documents publish, not spending. The NEP and the House bill are two versions of one budget and are never added together.
- Comparison groups such as "in the House bill only" and automatic notes are things to check, not findings, and never allegations about any office, official or business.
- A shared surname is a pattern, not proof of kinship or wrongdoing.
- Hotlines not taken from the provincial government site are marked "unconfirmed".
- Figures read from scans carry a confidence level; the PDF is always one click away.

### Database

Migrations in `supabase/migrations/`:

- `0001_init.sql`: `hotlines` and `projects` tables.
- `0003_gov.sql`: `gov_items` and `gov_meta` for the government records.
- `0003_lgu_contacts.sql`: official LGU contacts.
- `0002_visits.sql`: the anonymous visit counter (`site_stats`, closed to direct access; the site only calls `bump_views()` and `get_views()`; one number, no personal data).

All tables use row-level security with public read-only policies. The seed scripts apply what they need and upsert the data. Use the service role key only for seeding.

## Translations

Interface strings live in `src/lib/i18n/dict/*.ts` as `[English, Filipino]` pairs; a test requires both and catches untranslated sentences. The Filipino drafts need review by a native speaker. `node scripts/export-translations.mjs` writes `docs/translation-review.csv` (every string, with sensitive wording flagged) for reviewers to correct.

## Design kit

`src/components/kit` is a synced snapshot of the design kit, not edited by hand. `scripts/sync-kit.sh` refreshes it and `scripts/kit-patches.sh` re-applies the small site-specific changes after every sync (see `docs/kit-sync.md`).

## Project layout

```
src/app/          routes (App Router)
src/components/   UI components (kit/ is the design kit; site/ is glue built from it)
src/lib/          data access and pure logic, each with a .test.ts
src/data/         committed data snapshots (gov/ holds the provincial government records)
public/data/      Oriental Mindoro boundaries (GeoJSON)
scripts/          data fetch, OCR, extraction and seed scripts
supabase/         SQL migrations
docs/             design spec, plans, kit sync notes, translation review list
```

## Contributing

This is a volunteer project and contributions are welcome: code, corrections, translations, and verified local information. If a hotline, fee, office hour, summary or automatic note is wrong or out of date, please [open an issue](https://github.com/renthelautomations/betterorientalmindoro/issues/new) with a link to the official source. Run `npm test` before opening a pull request.

Mangyan culture content is published only together with Mangyan communities and with their approval and credit. Please do not add it without that.

The portal is registered in the [BetterGov LGU directory](https://github.com/jmacj/better-lgu-directory); see its [CONTRIBUTING.md](https://github.com/jmacj/better-lgu-directory/blob/main/CONTRIBUTING.md) for how entries are kept up to date.

## Maintainer

[@renthelautomations](https://github.com/renthelautomations) (Renthel Cueto) and volunteers from Oriental Mindoro.

## License

[MIT](LICENSE). Public data keeps the license of its source, shown where the data appears. Government documents remain on their official site.
