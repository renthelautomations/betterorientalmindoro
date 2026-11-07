# Better Oriental Mindoro

A free, volunteer-led civic website for the province of Oriental Mindoro, Philippines, under the [BetterGov.PH](https://bettergov.ph) initiative. It helps residents find services and hotlines, and helps anyone see how public money and projects affect their province.

The story and tagline of the site is **MaHalTaNa**, the four icons of the province:

| | Icon |
|---|---|
| **Ma** | Mangyan, the indigenous peoples of Mindoro |
| **Hal** | Mount Halcon |
| **Ta** | Tamaraw |
| **Na** | Naujan Lake |

> **Not an official government website.** This site is not affiliated with or representing the Oriental Mindoro provincial government or any LGU. Every figure shows its source, and amounts are published budgets, not spending.

## What is in it

| Route | What it shows |
|---|---|
| `/` | Home: the four MaHalTaNa doors and quick links |
| `/ma` `/hal` `/ta` `/na` | One story page per icon (the Mangyan page is a placeholder until communities approve content) |
| `/bayan`, `/bayan/[slug]` | Province map and a page for each of the 14 municipalities and Calapan City: barangays, hotlines, DPWH projects, statistics |
| `/hotlines` | Province hotlines, each with its source and the date checked |
| `/serbisyo` | Services directory (sourced from the Provincial Citizen's Charter; every entry marked draft) |
| `/estatistika` | Population, income class and finance by municipality |
| `/proyekto` | DPWH infrastructure projects in the province |
| `/badyet` | FY2027 national budget for the two congressional districts, NEP against the House bill |
| `/dynasties`, `/dynasties/[town]` | Election results and repeated surnames, 2001-2025 |
| `/terms` `/privacy` `/accessibility` `/faq` | Legal and help pages |

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, static generation) and React, styled with Tailwind CSS
- [MapLibre GL](https://maplibre.org) for the province map (no basemap tiles, no API key)
- [Supabase](https://supabase.com) Postgres for hotlines and projects (public read only)
- [Vitest](https://vitest.dev) for data and logic tests
- Hosting target: [Vercel](https://vercel.com)

## Getting started

Requires Node.js 22 or newer.

```bash
npm install
cp .env.example .env.local        # fill in only what you need (see below)
npm run dev                       # http://localhost:3000
```

The site runs without any environment variables: the pages read committed JSON snapshots in `src/data/` and GeoJSON in `public/data/`.

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
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reading from Supabase (publishable key only) |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` | Seeding and migrations only. Server side, never exposed to the browser |
| `GITHUB_TOKEN`, `GITHUB_REPO`, `VERCEL_*` | Optional tooling |

## Data

Data is snapshotted into the repository so the site never depends on an upstream service at runtime. Refresh a snapshot by re-running its script:

| Script | Writes | Source |
|---|---|---|
| `node scripts/fetch-boundaries.mjs` | `public/data/*.geojson` | NAMRIA/PSA boundaries via [BetterGov Open Data](https://data.bettergov.ph) (MIT) |
| `node scripts/fetch-dpwh.mjs` | `src/data/dpwh.json` | DPWH Infrastructure Transparency Dataset via BetterGov Open Data (CC0) |
| `node scripts/fetch-dynasties.mjs` | `src/data/dynasties/` | [Dynasties by BetterGov](https://dynasties.bettergov.ph) API, from Open Halalan, PSA and PSGC |
| `node scripts/fetch-badyet.mjs` | `src/data/badyet.json` | [BetterGov Budget API](https://budget.bettergov.ph/api/v1) |
| `node scripts/fetch-stats.mjs` | `src/data/stats.json` | PSA and BLGF/COA figures via Wikidata (CC0) |
| `node scripts/seed-supabase.mjs` | Supabase tables | Loads hotlines and projects (needs `SUPABASE_DB_URL`) |

`src/data/hotlines.json` and `src/data/services.ts` are curated by hand from official pages. Each entry carries its source and the date it was checked.

### Honesty rules

- A dash means "no data", never zero.
- Budget amounts are what the documents publish, not spending. The NEP and the House bill are two versions of one budget and are never added together.
- Comparison groups such as "in the House bill only" are candidates to check, not findings, and not allegations about any office or official.
- A shared surname is a pattern, not proof of kinship or wrongdoing.
- Hotlines not taken from the provincial government site are marked "unconfirmed".

### Database

`supabase/migrations/0001_init.sql` creates the `hotlines` and `projects` tables with row-level security and public read-only policies. `scripts/seed-supabase.mjs` applies it once and upserts the data.

## Project layout

```
src/app/          routes (App Router)
src/components/   UI components, grouped by feature
src/lib/          data access and pure logic, each with a .test.ts
src/data/         committed data snapshots
public/data/      Oriental Mindoro boundaries (GeoJSON)
scripts/          data fetch and seed scripts
supabase/         SQL migrations
docs/superpowers/ design spec and implementation plan
```

## Contributing

This is a volunteer project and contributions are welcome: code, corrections, and verified local information. If a hotline, fee or office hour is wrong or out of date, please open an issue with a link to the official source.

Mangyan culture content is published only together with Mangyan communities and with their approval and credit. Please do not add it without that.

## License

[MIT](LICENSE). Public data keeps the license of its source, shown where the data appears.
