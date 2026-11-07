# Site Rebuild on the Design Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every page of Better Oriental Mindoro on the owner's design kit, using the hub/record structure in the page-structure spec, with real data wired in.

**Architecture:** A new branch `feat/rebuild` gets a snapshot copy of the kit (`src/components/kit/`, `src/app/design-kit/`, the `globals.css` additions). Phase 0 swaps the site shell (header, footer, nav, search, Datos hub) and enriches data. Phase 1 splits page work across five worktrees with disjoint files; each consumes kit components only. Pure logic (filters, ranking, grouping, search index) gets vitest tests; visual work is checked with screenshots and axe.

**Tech Stack:** Next.js 16 (cacheComponents on), Tailwind 4, the kit's components, MapLibre (existing `Map`), vitest, Supabase untouched.

**Spec:** `docs/superpowers/specs/2026-11-08-page-structure-redesign.md` (structure) and `docs/superpowers/specs/2026-11-07-better-oriental-mindoro-design.md` (brand, honesty). Kit source of truth: `worktrees/design-kit` (owner edits it live; never write there).

## Global Constraints

- Consume the kit; do not restyle it or add a competing style. Kit gaps are listed in the final report, not patched silently.
- Nav has 4 items: MaHalTaNa, Bayan, Serbisyo, Datos. Emergency strip stays; header stays sticky.
- Every figure keeps source, date and licence; a dash means no data, never zero; NEP and House-bill totals are never summed; "pattern, not proof" and "not spending" notes stay (collapsed to one visible line at most).
- No person pages on Dinastiya in v1 (call, pending owner): grid cells and surname chips link to the town view.
- No existing URL moves; unknown dynamic slugs soft-404 with `noindex` (accepted).
- Next 16 rules: no `new Date()` during prerender, no route-segment `dynamicParams`, params are async, kit components that use hooks are client components.
- Charts: inline SVG/CSS, text values present, colour never the only encoding, AA contrast, `prefers-reduced-motion` respected.
- Hub shows at most 5 items before "see all"; tables only inside a record on wide screens.
- Build gate stays `vitest run && next build`. Commits are authored as Renthel Cueto <cuetorenthel@gmail.com> with no Claude trailers.

## Review Focus

- Kit snapshot drift: owner keeps editing the kit; a page importing a kit export that later changes shape breaks the build. Re-sync step and a smoke build are required before merge.
- Bayan page for a bayan with no hotline rows, no projects, or no coordinates: tabs render empty states, never crash or show "0" as if known.
- Project record for a row with no dates, no coordinates, or "hindi tiyak ang bayan": timeline falls back to year plus status; no map pin; not counted in any bayan total.
- Badyet and Dinastiya after collapsing notes: the one-line summary is present in the HTML without JavaScript.
- No-WebGL and no-JS: `/bayan` list, search results page and call strip still usable; tabs are real links.

## File Structure

- `src/components/kit/**`, `src/app/design-kit/**`: snapshot of the kit (read-only here).
- `src/components/site/`: site-specific glue the kit lacks (`SiteShell`, `Hub`, `Record`, `StatStrip`, `ChipFilter`, `CollapsibleNote`), each thin and built from kit parts.
- `src/lib/search-index.ts`: static index of bayan, services, hotlines for `SiteSearch`.
- `src/lib/projects.ts` (+ `.test.ts`): extended with coordinates, dates, filters, by-year and by-status aggregates.
- `src/lib/bayan.ts` (+ test): per-bayan summary joining municipalities, stats, projects, hotlines, dynasties.
- `src/app/**`: rebuilt routes per page task.

---

### Task 0: Branch, kit snapshot, shell, search index, data enrichment (controller, before any parallel work)

**Files:** Create worktree `worktrees/rebuild` on `feat/rebuild` from `v1`; copy kit; Modify `src/app/layout.tsx`, `src/app/globals.css`, `src/components/EmergencyBar.tsx` usage; Create `src/components/site/*`, `src/lib/search-index.ts`, `src/app/datos/page.tsx`; Modify `scripts/fetch-dpwh.mjs`, `src/data/dpwh.json`, `src/lib/projects.ts`; Test `src/lib/search-index.test.ts`, `src/lib/projects.test.ts`.

**Interfaces:**
- Produces `getSearchItems(): SearchItem[]` (kit's `SearchItem`: `{type:"bayan"|"serbisyo"|"hotline"; title; sub?; href}`), covering the 15 bayan, every service, every hotline (`href:"tel:..."`).
- Produces `Project` extended: `{lat?:number; lon?:number; start?:string; end?:string; contractor?:string}`; `getProjects(slug?)`, `countsByYear(rows)`, `countsByStatus(rows)`, `filterProjects(rows,{bayan?,year?,status?,category?,q?})`.
- Produces `SiteShell` (KitHeader with 4 nav links, EmergencyBar, KitFooter with GitHub/Discord/BetterGov row, children) used by `layout.tsx`.

- [ ] **Step 1:** Create worktree and branch; copy kit files from `worktrees/design-kit` (cp, never move); merge only the additions of `globals.css`; confirm `npm run build` passes on the unchanged pages.
- [ ] **Step 2:** Write failing tests: `getSearchItems()` has 15 bayan, all service ids, all hotlines, unique hrefs per title; `filterProjects` by bayan/year/status/q; `countsByYear` sums to input length; rows without a municipality never match a bayan filter.
- [ ] **Step 3:** Implement `search-index.ts`, project helpers; extend `scripts/fetch-dpwh.mjs` to keep `latitude`, `longitude`, `startDate`, `completionDate`, `contractor` and regenerate `dpwh.json`; tests pass.
- [ ] **Step 4:** Implement `SiteShell`; layout uses it; `/datos` hub page (four cards: Estatistika, Proyekto, Badyet, Dinastiya, each with its headline number); keep old routes working.
- [ ] **Step 5:** `npm test` and `npm run build` pass; commit `feat: rebuild base (kit snapshot, shell, search index, project data)`.

### Task 1: Home and MaHalTaNa story pages (agent A)

**Files:** `src/app/page.tsx`, `src/app/{ma,hal,ta,na}/page.tsx`, `src/components/site/Home*.tsx`.
**Interfaces:** Consumes `SiteSearch`, `PillarCard`, `StatCard`, `Callout`, `HalconScroll`, `NaujanScroll`, `Terrain3D`, `getSearchItems`.
- [ ] Home per spec: search, province map (existing `Map`), "Kailangan ng tulong ngayon?" Callout with confirmed provincial numbers only, four pillars, "Ang lalawigan sa numero" StatCards linking to Datos hubs. Story pages use kit scroll sections; Ma stays an "in preparation" page with no imagery; Hal keeps Open-Meteo weather with its text fallback; Na keeps the NOAH link; draft labels stay.
- [ ] Verify at 390 and 1280 px; axe clean; commit.

### Task 2: Bayan hub, bayan record tabs, Estatistika (agent B)

**Files:** `src/app/bayan/**`, `src/app/estatistika/page.tsx`, `src/lib/bayan.ts` (+ test), `src/components/site/Bayan*.tsx`.
**Interfaces:** Produces `getBayanSummary(slug)` returning `{name, pcode, areaKm2, barangays, population?, incomeClass?, projectCount, hotlineCount|null, topSurnames[]}`; consumes `Tabs`, `Breadcrumbs`, `TownEmblem`, `StatCard`, `HotlineCard`, `LineChart`, `Charts`, `EmptyState`.
- [ ] Test first: `getBayanSummary` for a bayan with hotlines (calapan-city), without (baco → `hotlineCount: null`), unknown slug → undefined; projects counted exclude uncertain rows.
- [ ] `/bayan`: map with preview panel plus plain link list. `/bayan/[slug]` and sub-routes `/tulong`, `/proyekto`, `/halalan`, `/datos` as real links styled as tabs, each statically generated for the 15 slugs. `/estatistika`: metric chips re-shading an SVG choropleth, ranked top 5, growth line, two-bayan compare.
- [ ] Empty states per Review Focus; screenshots; axe; commit.

### Task 3: Proyekto hub and record (agent C)

**Files:** `src/app/proyekto/**`, `src/components/site/Project*.tsx`.
**Interfaces:** Consumes `filterProjects`, `countsByYear`, `countsByStatus`, `Charts`, `DataTable`, `Map`, `Breadcrumbs`, `Stepper`/timeline.
- [ ] Hub: StatStrip (count, total published budget, share completed), map of points that have coordinates plus "N list-only", by-year bars, chip filters, 20-card list with "Ipakita pa". Record `/proyekto/[id]`: cleaned title and original, cost, start-to-completion timeline or year+status, map pin only when coordinates exist, bayan link or "hindi tiyak ang bayan", source line.
- [ ] Tests for any new pure logic; ids are unique so static params cover all rows; commit.

### Task 4: Badyet and Dinastiya (agent D)

**Files:** `src/app/badyet/page.tsx`, `src/app/dynasties/**`, `src/components/site/Badyet*.tsx`, `Dyn*.tsx`.
**Interfaces:** Consumes `src/lib/badyet.ts`, `src/lib/dynasties.ts`, `Tabs`, `Accordion`, `Charts2`, `Callout`.
- [ ] Badyet: district switch, representative line, NEP and House totals side by side (no sum helper exists or is added), proportion bar of the six groups with unconfirmed marked, enacted-by-year bars, collapsed "Paano basahin" whose summary line (not spending, not an allegation) is visible without JS.
- [ ] Dinastiya: province/town switch, year-by-seat winner grid (cells link to the town view anchor), repeated-surname chips (2+ different people) linking to the filtered town view, collapsed neutral note. No person pages.
- [ ] Tests for grid shaping and chips; commit.

### Task 5: Serbisyo, Hotlines, legal pages (agent E)

**Files:** `src/app/serbisyo/**`, `src/app/hotlines/page.tsx`, `src/app/{terms,privacy,accessibility,faq}/page.tsx`.
**Interfaces:** Consumes `SiteSearch`, `ServiceRow`, `Stepper`, `Checklist`, `Accordion`, `HotlineCard`, `Badge`, `Doc`.
- [ ] Serbisyo: life events and search first, categories second; service record uses Stepper/Checklist and keeps source, `checkedAt`, draft badge; empty categories show EmptyState. Hotlines: big tap cards by category, bayan selector (province fallback, never invented numbers), copy button, unconfirmed badge kept. FAQ uses `Accordion`; legal pages keep their text.
- [ ] Commit.

### Task 6: Integrate, re-sync, verify (controller)

- [ ] Merge the five branches into `feat/rebuild` (resolve `sitemap.ts` by hand); re-copy the kit from `worktrees/design-kit`, rebuild, fix any broken imports.
- [ ] `npm test`, `npm run build`, axe on every route at 390 and 1280, no-WebGL check on `/bayan`, plain `npm install` clean-copy build.
- [ ] Update README routes table; ledger the rulings; present to owner before merging to `main`.
