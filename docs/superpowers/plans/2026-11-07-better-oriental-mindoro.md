# Better Oriental Mindoro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1 of Better Oriental Mindoro: a clean, mobile-first civic site with the MaHalTaNa home page, four story pages, province map, 15 municipality pages, hotlines, one DPWH data page and the BetterGov-family footer.

**Architecture:** Next.js App Router, statically generated from typed data modules in `src/data/`. Boundaries are the GeoJSON already in `public/data/`. Hotlines and DPWH rows are produced by scripts into `src/data/*.json` and mirrored to Supabase later (schema in Task 7). Local first: nothing is created on Supabase, Vercel, GitHub or a domain without owner approval.

**Tech Stack:** Next.js 16, React, Tailwind, MapLibre GL, Vitest (pure data/helpers only), Supabase (later), Vercel (later).

**Spec:** `docs/superpowers/specs/2026-11-07-better-oriental-mindoro-design.md`

## Global Constraints

- Site name "Better Oriental Mindoro"; MaHalTaNa is the story and tagline inside it, never the site name.
- Icons: Ma = Mangyan, Hal = Mount Halcon, Ta = Tamaraw, Na = Naujan Lake. Palette (guess): Ma #b5532f, Hal #2f6b4f, Ta #6b4a2f, Na #1f7a8c on warm off-white #fbf7f0; footer navy.
- Footer text includes: "volunteer-led civic website under BetterGov.PH initiative", "Not affiliated with or representing the Oriental Mindoro provincial government or any LGU", "100% free, volunteer-run and community-based", "MIT License. All public data sourced from official government portals."
- Quick Links: Sitemap, Terms of Use, Privacy Policy, Accessibility, FAQ. Facebook and GitHub icons.
- Province filter: `ADM2_EN === "Oriental Mindoro"`; 14 municipalities plus Calapan City; 426 barangays.
- Ma page ships as a marked "in preparation" page, no imagery; its tile stays visible.
- Badyet and Halalan strip links show "coming soon" in v1. No analytics. No accounts. No secrets in git.
- Every data point shows source and license; every hotline has `source` and `verifiedAt`.
- Mobile-first, accessible (semantic landmarks, contrast AA, keyboard nav). Clean and spacious.

## Review Focus

- Municipality with no matching hotlines or projects: page renders an empty state, not a crash.
- Municipality slug that does not exist: 404.
- Hotline with missing `verifiedAt`: build fails (data test).
- DPWH row with no location field: counted at province level only, never mis-assigned.
- Map with JS or WebGL unavailable: municipality list is still reachable as plain links.

## File Structure

- `src/lib/brand.ts`: icon definitions and palette.
- `src/lib/municipalities.ts`: slugs and lookup from `public/data/*.geojson`.
- `src/data/hotlines.json`, `src/data/dpwh.json`: generated/seeded data.
- `src/components/`: `Header`, `Footer`, `IconTile`, `Map`, `HotlineList`.
- `src/app/`: `page.tsx`, `[icon]/page.tsx` (ma, hal, ta, na), `bayan/page.tsx`, `bayan/[slug]/page.tsx`, `hotlines/page.tsx`, `proyekto/page.tsx`, legal pages, `sitemap.ts`.
- `supabase/migrations/0001_init.sql`.
- `scripts/`: `fetch-boundaries.mjs` (done), `fetch-dpwh.mjs`, `seed-hotlines.mjs`.

---

### Task 1: Brand, layout shell and footer

**Files:** Create `src/lib/brand.ts`, `src/components/Header.tsx`, `src/components/Footer.tsx`; Modify `src/app/layout.tsx`, `src/app/globals.css`; Test `src/lib/brand.test.ts`.

**Interfaces:** Produces `type IconKey = "ma"|"hal"|"ta"|"na"`; `ICONS: Record<IconKey,{key:IconKey;short:string;name:string;color:string;blurb:string}>`.

- [ ] **Step 1:** Write `brand.test.ts`: `Object.keys(ICONS)` equals `["ma","hal","ta","na"]`, `ICONS.ma.name === "Mangyan"`, every `color` matches `/^#[0-9a-f]{6}$/i`.
- [ ] **Step 2:** Run `npx vitest run` (install `vitest` first): FAIL.
- [ ] **Step 3:** Implement `ICONS` per Global Constraints; add colour tokens to `globals.css`; Header nav (Bayan, Serbisyo, Mapa); Footer with every Global Constraints footer string and link.
- [ ] **Step 4:** Run `npx vitest run` and `npm run build`: PASS.
- [ ] **Step 5:** Commit `feat: brand tokens, header, footer`.

### Task 2: Home page "Four Doors"

**Files:** Create `src/components/IconTile.tsx`; Modify `src/app/page.tsx`.

**Interfaces:** Consumes `ICONS`. Produces `IconTile({icon}: {icon: IconKey})` linking to `/${icon}`.

- [ ] **Step 1:** Replace the map page with: hero (headline "Apat na haligi ng Oriental Mindoro." and one-line intro), four `IconTile`s in a 2x2 (mobile) / 4x1 (desktop) grid, civic strip: Hotlines `/hotlines`, Proyekto `/proyekto`, Badyet and Halalan marked "coming soon" (not links).
- [ ] **Step 2:** `npm run build`; open `/` at 390px and 1280px wide and confirm no horizontal scroll and four tiles visible.
- [ ] **Step 3:** Commit `feat: home page`.

### Task 3: Four story pages

**Files:** Create `src/app/[icon]/page.tsx`; Test `src/lib/brand.test.ts` (extend).

**Interfaces:** Consumes `ICONS`. Uses `generateStaticParams` returning the four keys; any other slug calls `notFound()`.

- [ ] **Step 1:** Extend test: a `isIconKey(s: string): s is IconKey` helper returns true for `"ma"`, false for `"xyz"`. Run: FAIL.
- [ ] **Step 2:** Implement `isIconKey` in `brand.ts` and the dynamic page. Ma shows the "in preparation" notice and no image. Hal embeds Open-Meteo current weather for Calapan (client fetch, failure shows a text fallback) and trekking text. Ta and Na carry draft factual copy marked "Draft: for volunteer review"; Na links out to Project NOAH.
- [ ] **Step 3:** `npx vitest run` and `npm run build`: PASS; `/xyz` returns 404.
- [ ] **Step 4:** Commit `feat: MaHalTaNa story pages`.

### Task 4: Municipality lookup and map

**Files:** Create `src/lib/municipalities.ts`, `src/app/bayan/page.tsx`, `src/app/bayan/[slug]/page.tsx`; Modify `src/components/Map.tsx`; Test `src/lib/municipalities.test.ts`.

**Interfaces:** Produces `type Municipality = {slug:string;name:string;pcode:string;areaKm2:number;isCity:boolean}`; `getMunicipalities(): Municipality[]`; `getMunicipality(slug: string): Municipality | undefined`; `getBarangays(pcode: string): string[]`.

- [ ] **Step 1:** Write tests: `getMunicipalities().length === 15`; `getMunicipality("calapan-city")?.isCity === true`; `getMunicipality("nope") === undefined`; `getBarangays` over all 15 sums to 426.
- [ ] **Step 2:** Run: FAIL.
- [ ] **Step 3:** Implement by reading `public/data/municipalities.geojson`, `component_cities.geojson`, `barangays.geojson` with `fs`; slug = lowercase name, spaces to `-`.
- [ ] **Step 4:** `/bayan`: map plus a plain list of 15 links (works without WebGL). Map click navigates to `/bayan/[slug]`. `/bayan/[slug]`: name, area, barangay list, `generateStaticParams`, `notFound()` for unknown slug.
- [ ] **Step 5:** Tests and build PASS; commit `feat: bayan map and municipality pages`.

### Task 5: Hotlines

**Files:** Create `scripts/seed-hotlines.mjs`, `src/data/hotlines.json`, `src/components/HotlineList.tsx`, `src/app/hotlines/page.tsx`; Modify `src/app/bayan/[slug]/page.tsx`; Test `src/data/hotlines.test.ts`.

**Interfaces:** Produces `type Hotline = {id:string;scope:"province"|string /*municipality slug*/;category:"emergency"|"medical"|"government"|"utility";name:string;number:string;source:string;verifiedAt:string /*YYYY-MM-DD*/}`; `getHotlines(scope?: string): Hotline[]`.

- [ ] **Step 1:** Write `hotlines.test.ts`: every row has non-empty `source`, `verifiedAt` matching `/^\d{4}-\d{2}-\d{2}$/`, `number` containing a digit, and unique `id`; every non-province `scope` is a valid municipality slug. Run: FAIL (no file).
- [ ] **Step 2:** Seed `hotlines.json` with 911 plus province-level PDRRMO, PNP, BFP and hospital numbers found from official public pages; each row records its source URL. Do not invent numbers; omit any that cannot be sourced.
- [ ] **Step 3:** `HotlineList` renders `tel:` links grouped by category with "Verified {date}" and source; empty state text when none.
- [ ] **Step 4:** Tests and build PASS; commit `feat: hotlines`.

### Task 6: DPWH projects page

**Files:** Create `scripts/fetch-dpwh.mjs`, `src/data/dpwh.json`, `src/app/proyekto/page.tsx`; Test `src/data/dpwh.test.ts`.

**Interfaces:** Produces `type Project = {id:string;title:string;municipality?:string /*slug*/;cost?:number;status?:string;year?:number}`; `getProjects(slug?: string): Project[]`.

- [ ] **Step 1:** Write `dpwh.test.ts`: every row has `id` and `title`; any `municipality` is a valid slug; `getProjects("unknown-slug")` returns `[]`. Run: FAIL.
- [ ] **Step 2:** `fetch-dpwh.mjs` downloads the dataset-19 Parquet (CC0), filters to Oriental Mindoro using its location fields, and writes JSON. Rows whose municipality cannot be matched keep `municipality` undefined (province-level only).
- [ ] **Step 3:** `/proyekto`: table with source and license line; municipality pages link to their projects with the empty state.
- [ ] **Step 4:** Tests and build PASS; commit `feat: DPWH projects`.

### Task 7: Legal pages, sitemap, Supabase schema

**Files:** Create `src/app/{terms,privacy,accessibility,faq}/page.tsx`, `src/app/sitemap.ts`, `supabase/migrations/0001_init.sql`.

- [ ] **Step 1:** Legal pages adapted from betterbinangonan.org wording, with Oriental Mindoro names and "no analytics" in Privacy. `sitemap.ts` lists every static route plus 15 municipality slugs.
- [ ] **Step 2:** `0001_init.sql`: tables `hotlines` and `projects` mirroring the TypeScript types, read-only public RLS policies. Do not apply it; applying needs owner approval.
- [ ] **Step 3:** `npm run build` PASS; `/sitemap.xml` lists 15 `/bayan/...` URLs. Commit `feat: legal pages, sitemap, schema`.

### Task 8: Polish, accessibility, verification

- [ ] **Step 1:** Run Lighthouse (mobile) on `/`, `/bayan`, `/hotlines`: Accessibility >= 95; fix findings.
- [ ] **Step 2:** Screenshot `/` and `/bayan/calapan-city` at 390px and 1280px; confirm clean spacing and no overflow.
- [ ] **Step 3:** Commit `chore: polish and a11y fixes`.

### Task 9: Connect GitHub, Supabase, Vercel (needs owner go-ahead at the time)

- [ ] **Step 1:** Create the GitHub repo (name from owner) and push. Confirm `.env.local` is not tracked: `git ls-files | grep .env.local` prints nothing.
- [ ] **Step 2:** On approval, create the Supabase project, apply `0001_init.sql`, load hotlines and projects.
- [ ] **Step 3:** On approval, create the Vercel project linked to the repo; set env vars from `.env.example`; deploy a preview and confirm the home page loads.
