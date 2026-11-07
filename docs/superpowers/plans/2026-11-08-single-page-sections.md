# Single-page Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the site as one main page per section, with records laid out well on it and each record opening its own detail page, using the owner's updated design kit and templates.

**Architecture:** Branch `feat/rebuild2` (kit re-synced). Each section is one route with its content laid out in kit components; records link to detail routes. Detail pages with several facets use the kit `Tabs` inside one page (the owner's `/design-kit/town/[slug]` template), never separate routes. Old URLs redirect from `next.config.ts`. The earlier hub/record work on `main` is the data and logic base; page layouts are redone on the kit's new components.

**Tech Stack:** Next.js 16 (cacheComponents on), Tailwind 4, the kit in `src/components/kit` (read-only snapshot of `worktrees/design-kit`), vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-page-structure-redesign.md` (principles still hold; its route table and the Datos hub are superseded by this plan), `docs/superpowers/specs/2026-11-07-better-oriental-mindoro-design.md` (brand, honesty).

## Global Constraints

- Sections (nav, in order): MaHalTaNa, Bayan, Serbisyo, Hotlines, Proyekto, Estatistika, Badyet, Dinastiya. **No Datos hub**: `/datos` redirects to `/estatistika`.
- One main page per section. A record's detail opens as its own page; facets of one record are in-page `Tabs`, not routes.
- Follow the owner's templates in `src/app/design-kit/{home,town,story}` for layout and component choice; the kit is read-only here. Gaps go in the report, not into the kit.
- Honesty rules unchanged: dash means no data; NEP and House-bill totals never summed; "not spending" and "pattern, not proof" lines visible in the HTML without JS; unconfirmed hotlines flagged; no invented numbers; Ma has no imagery and no `ikat` pattern.
- Home headline is "Better Oriental Mindoro.org" (already built); `PennantHero` stays.
- Language: the kit's EN/FIL toggle only switches `dict.ts` keys. Pages keep their current Filipino text unless the owner decides to move them onto the dictionary; do not half-translate a page.
- Next 16 rules: no `new Date()` in prerender, no route-segment config, params async; client kit components stay client.
- Build gate stays `vitest run && next build`; authorship Renthel Cueto, no Claude trailers; no push.

## Review Focus

- Old links: every previous route (`/datos`, `/bayan/[slug]/{tulong,proyekto,halalan,datos}`, `/serbisyo/[category]`, `/hotlines?bayan=`) lands on a working page, not a 404.
- A town page for a town with no hotlines, no projects, no election rows: each tab shows an empty state, never a zero presented as known.
- Tabs inside one page: all panels are in the server HTML or reachable without JS (hidden panels must not make content unreachable for crawlers or no-JS readers where the spec requires it: the one-line notes stay visible).
- Main pages with long lists (projects 2,746): the main page shows a bounded list with in-page "Ipakita pa" (searchParams on the same route), not thousands of cards.
- Kit drift: re-sync before merging and rebuild.

---

### Task 0: Shell and redirects (controller)
**Files:** `src/components/site/nav.ts`, `src/components/site/SiteShell.tsx`, `next.config.ts`; delete `src/app/datos/page.tsx`.
**Interfaces:** Produces `NAV` with the eight sections; `redirects()` mapping old routes (308).
- [ ] Update `NAV`/footer links; remove the Datos hub; add redirects: `/datos` to `/estatistika`; `/bayan/:slug/(tulong|proyekto|halalan|datos)` to `/bayan/:slug`; `/serbisyo/:category` (single segment) to `/serbisyo`; keep `/hotlines` and query params as they are.
- [ ] `npm run build` passes; commit.

### Task 1: Home and MaHalTaNa (agent A)
**Files:** `src/app/page.tsx`, `src/app/mahaltana/page.tsx`, `src/app/{ma,hal,ta,na}/page.tsx`.
- [ ] Home follows `design-kit/home`: hero (kept), stat cards, pillars, categories as ServiceRows, population BarChart + Choropleth; links point to the new section pages. `/mahaltana`: the main page for the section with the four pillars as records. Story pages follow `design-kit/story` (HalconScroll, NaujanScroll, HeroBg panels/dawn); Ma keeps "in preparation" and no `ikat`.

### Task 2: Bayan (agent B)
**Files:** `src/app/bayan/page.tsx`, `src/app/bayan/[slug]/page.tsx` (delete the sub-route folders), `src/lib/bayan.ts`.
- [ ] Main page: map with preview, kit BarChart/Choropleth, a sortable `DataTable` of the 15 towns, `CompareTowns`, plain link list. Detail: the `design-kit/town` template with real data and tabs Pangkalahatan, Hotlines, Proyekto, Halalan (winners grid from `src/lib/dynasties.ts`), empty states, Breadcrumbs. Remove tab sub-routes.

### Task 3: Proyekto (agent C)
**Files:** `src/app/proyekto/page.tsx`, `src/app/proyekto/[id]/page.tsx`, `src/components/site/Project*.tsx`.
- [ ] Main page keeps stat strip, map, by-year bars, chip filters, bounded card list ("Ipakita pa" via searchParams); adopt kit `Donut`/`DataTable` where they fit. Record page unchanged in content, restyled with kit parts.

### Task 4: Estatistika and Badyet (agent D)
**Files:** `src/app/estatistika/page.tsx`, `src/app/badyet/page.tsx`, `src/app/badyet/[district]/page.tsx`, site components.
- [ ] Estatistika main: metric-driven Choropleth + BarChart, growth `LineChart`, `CompareTowns`, ranked list; rows link to the town page. Badyet main: two district records laid out as cards with the NEP and House totals side by side and the one-line "hindi ito ang nagastos, hindi paratang"; each opens `/badyet/[district]` (`1st`, `2nd`) with the proportion bar, enacted-by-year bars, notes in `Accordion`. Redirect `/badyet#d2` style anchors to the detail pages.

### Task 5: Dinastiya, Serbisyo, Hotlines (agent E)
**Files:** `src/app/dynasties/**`, `src/app/serbisyo/**`, `src/app/hotlines/page.tsx`.
- [ ] Dinastiya main: kit `Network` of towns linked by shared surnames (every node and edge in text on the page too), winners grid, repeated-surname chips; town detail keeps grid, surnames, councilors in `Accordion`. Serbisyo main: search, life events, categories and their services laid out on the one page (category anchors), service record unchanged in content. Hotlines: one page, bayan selector links, `HotlineCard` grid.

### Task 6: Integrate and verify (controller)
- [ ] Merge slices, re-sync kit, `npm test`, `npm run build`, axe on every route at 390 and 1280, redirect smoke test of every old route, no-WebGL check, clean-copy install build; present to the owner before merging to `main`.
