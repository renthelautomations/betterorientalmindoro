# Page structure and UX redesign

Companion to `2026-11-07-better-oriental-mindoro-design.md`. That document still governs brand, data honesty and scope; this one restructures how pages are organised and presented. It covers structure and visual hierarchy only. **Visual branding (colours, patterns, buttons, placeholders, illustration) is being built separately in the owner's design-kit worktree** (the `/design-kit` page seen on localhost:3100); this work must consume those components and tokens and not invent a competing style.

## Intent
Today every page is one long, flat column: a heading, paragraphs, boxes and a long table, all with equal weight. A resident cannot tell what matters, and detail overwhelms the summary. The goal is a site where each screen has one idea, a summary comes first, and every item opens its own page with the detail. More of the content should be seen (maps, charts) rather than read.

## Goals
- One idea per screen: a headline number strip, then one visual, then a short list.
- Progressive disclosure: hubs show a few items and "see all"; every item links to its own record page with breadcrumb and back.
- By place first: people think "what is in Baco?", so the municipality page becomes the centre and the cross-province data pages become hubs that link into it.
- Visualise with data already on hand (boundaries, project coordinates, yearly figures, election grids), using small hand-built SVG/CSS charts, no heavy chart library.
- Fewer top-level choices: the nav goes from 7 items to 4.
- Mobile-first; works without JavaScript for reading; keyboard and screen-reader usable.

## Non-goals
- No new brand, palette, pattern or illustration work (design-kit worktree owns it).
- No new data sources beyond what is needed to feed the new views (see Data).
- No user accounts, submissions or analytics.
- No change to the honesty rules or the Mangyan content policy.

## Anti-goals
- A page that hides a disclaimer or source that the old page showed. Collapsing is allowed only when one line stays visible.
- Rankings or comparisons that read as accusations (especially budget and dynasties).
- Charts with misleading baselines, or NEP and House-bill totals ever shown as a sum.
- A "dashboard" feel that makes the site look official or authoritative.

## Information architecture
Top nav (4): **MaHalTaNa** (the four story pages), **Bayan** (map hub and municipality pages), **Serbisyo** (services directory, with hotlines folded in as "Tulong ngayon"), **Datos** (hub linking Estatistika, Proyekto, Badyet, Dinastiya). The emergency strip stays above the nav; the sticky nav stays.

Routes (existing routes keep working or redirect):

| Route | Type | Notes |
|---|---|---|
| `/` | Home | |
| `/ma` `/hal` `/ta` `/na` | Story | unchanged scope, adopt record layout |
| `/bayan` | Hub | map with preview panel + list |
| `/bayan/[slug]` | Record | tabs as sub-routes: `/bayan/[slug]` (Buod), `/tulong`, `/proyekto`, `/halalan`, `/datos` |
| `/serbisyo`, `/serbisyo/[category]`, `/serbisyo/[category]/[service]` | Hub / Record | exists; add search and life-event-first |
| `/hotlines` | Hub | kept, linked from Serbisyo |
| `/datos` | Hub | four cards linking the data hubs |
| `/estatistika` | Hub | |
| `/proyekto`, `/proyekto/[id]` | Hub / Record | new record page per project |
| `/badyet` | Hub | district switch (1st, 2nd) |
| `/dynasties` (kept as route), `/dynasties/[town]`, `/dynasties/person/[id]` | Hub / Record | person page is new |

## The two page types
**Hub** (browse many): title with one-line promise; headline number strip (3 numbers); one primary visual; filter chips and search; a short card list (3 to 5 shown, then "Ipakita pa"/"Tingnan lahat"); a collapsed "Paano basahin & sources" bar whose first line stays visible. No full tables.

**Record** (one thing in depth): breadcrumb; header with a small shape/icon and the entity name; key-facts strip (3 numbers); sticky in-page tabs or anchors; sections that each hold one visual and a preview list with "see all"; "Kailangan ng tulong ngayon?" call strip where relevant; a collapsed "Sources & huling tingin" bar. Tables appear only inside a record, never on a hub, and only on wide screens; narrow screens get cards.

Shared rules: one headline strip, then one visual, then the list; max 5 items before "see all"; disclaimers collapse to one visible line and are never removed; every list item is a link; every number that comes from data shows its source on the record or in the collapsed bar.

## Page specs
- **Home:** search ("Hanapin: bayan, serbisyo, hotline"), province map (click a bayan), a "Kailangan ng tulong ngayon?" strip (911 and confirmed provincial numbers), the four pillars, then "Ang lalawigan sa numero" (population, bayan, DPWH projects) where each number links to a Datos hub.
- **/bayan hub:** map left, preview panel right showing the hovered or tapped bayan (population, barangays, hotline count, projects) with "Buksan"; list under it for no-WebGL and keyboard users.
- **/bayan/[slug] record:** header (shape, name, class, barangays, area); strip (population, income class, project count); tabs Buod, Tulong, Proyekto, Halalan, Datos. Buod shows call strip, top 3 projects with a mini map, top 3 repeated surnames, a population sparkline. Each tab is its own route so it can be linked and statically generated.
- **/proyekto hub:** strip (count, total budget as published, share completed), map of project points (click a bayan to filter) and a by-year bar chart, filter chips (bayan, taon, katayuan, kategorya) and search, card list with "Ipakita pa". **Record `/proyekto/[id]`:** cleaned title with original title shown, cost, status timeline (start to completion), map pin when coordinates exist, bayan link, category, source.
- **/estatistika hub:** metric chips (populasyon, laki, kita, barangay) re-shade a map; ranked top-5 bars with "ipakita lahat"; province growth line with province/bayan toggle; "Ihambing ang dalawang bayan" side by side. Data comes from `src/data/stats.json`.
- **/badyet hub:** district switch; representative line with House profile link; NEP and House bill totals side by side and never summed; a "what changed" proportion bar by number of budget lines (pareho, tumaas, nasa House lang, nasa NEP lang; unconfirmed marked) where choosing a segment opens that group's lines on its own page or panel; enacted 2020 to 2026 bars; one-line expandable "Paano basahin" that always shows "hindi ito ang nagastos, hindi paratang".
- **/dynasties hub and town:** one-line expandable "pattern, not proof" note; province/town switch; year-by-seat grid of winners where a cell opens the person's page; repeated-surname chips (two or more different people) linking to a filtered view. Person page shows all years and seats from the data and the same note. Wording stays neutral.
- **/serbisyo:** life-event tiles and search first, categories second; service record pages already show steps; add a step-by-step layout and the source/draft flag.
- **/hotlines:** big tap-to-call cards by category, a bayan selector at top, copy-number button, unconfirmed flag kept.

## Data needs (to feed the views)
- `dpwh.json` must carry coordinates (lat, lon) and, where present, start and completion dates, for the map and the record page. Re-run `scripts/fetch-dpwh.mjs` with those fields; the assignment rules and the "hindi tiyak ang bayan" handling stay.
- Dynasties person pages need per-person records from the snapshot (`scripts/fetch-dynasties.mjs`); extend only if the existing snapshot lacks them.
- A small static search index (bayan, services, hotlines) generated at build time; client-side search, no server.
- No other new sources.

## Constraints
- Next.js 16 (see `AGENTS.md`): cacheComponents is on, no `new Date()` during prerender, no route-segment config such as dynamicParams; unknown dynamic slugs soft-404 with `noindex` (accepted).
- Charts are inline SVG or CSS, accessible: values available as text, colour never the only encoding, contrast AA.
- Keep the build gate (`vitest run && next build`); add tests for any new pure logic (filtering, ranking, grouping, search index).
- Reuse design-kit components and tokens once available; until then build structural components (Hub, Record, StatStrip, Tabs, Collapsible, ChipFilter) unstyled-by-brand so the kit can skin them.
- Existing URLs keep working; moved content redirects.
- Every figure keeps its source, date and license; a dash means no data.

## Decided by the owner
- Direction: restructure into hubs and records, place first, progressive disclosure, more visuals.
- Nav reduced to four items; municipality page is the centre with tabs; Datos holds the four data hubs.
- Branding is out of scope (separate worktree).
- The four wireframed pages (Home, Badyet, Dinastiya, Estatistika) and the Hub/Record templates as shown.

## My calls (not yet confirmed)
- Municipality tabs as sub-routes, not client-side tabs.
- Dynasties route keeps the name `/dynasties` to avoid breaking links; the label stays "Dinastiya".
- Hotlines stay a page of their own under Serbisyo rather than being merged into it.
- Compare feature is bayan versus bayan for stats only in v1.
- Search is client-side over a static index.

## More calls after the builder check (mine, not yet confirmed)
- **Project dates:** the DPWH parquet has them (1,502 of 1,534 Mindoro Oriental DEO rows have a start date, 1,429 a completion date), so the record page shows a start-to-completion timeline when both exist and falls back to year plus status otherwise. Re-run `scripts/fetch-dpwh.mjs` to add `startDate`, `completionDate`, `lat`, `lon` (and contractor) to `dpwh.json`.
- **Project map:** only about 1,275 of 1,534 DEO rows have coordinates, so the map shows those and says how many projects are list-only. Rows marked "hindi tiyak ang bayan" appear on the map at their coordinates but are not counted in any bayan's project count; province totals include them.
- **Hotlines per bayan:** `hotlines.json` has municipal rows only for Calapan City, Naujan and Puerto Galera. The preview panel and the Tulong tab show province numbers as the fallback and "-" for the bayan count where there are none; no number is ever invented.
- **Maps:** reuse the existing MapLibre map for `/bayan` and the project-points map; hand-built SVG from the boundary files for mini-maps and the Estatistika choropleth. The plain list stays as the no-WebGL path.
- **Shared views:** `/bayan/[slug]/halalan`, `/proyekto` filtered by bayan and `/estatistika` rows reuse the same view components as `/dynasties/[town]`, `/proyekto` and `/estatistika`. The hub URL is canonical for cross-province data; the bayan tab is canonical for place. No existing URL moves, so no redirects are needed. If one ever must move, use a permanent (308) redirect.
- **Badyet what-changed:** v1 ships the proportion bar plus a per-group summary (rows and amount, unconfirmed marked). Opening the line-by-line list is a later step.
- **Compare:** bayan versus bayan for population, area, barangays and income class only, in v1.

## Left to the builder
- Component APIs, file layout, chart implementation details, animation, exact breakpoints.
- How to integrate the design-kit once its components exist.
- The text of new Filipino/English microcopy (flag as draft for volunteer review).

## Open (needs the owner)
- **Design kit:** it lives in `worktrees/design-kit` (branch `feat/design-kit`, no commits yet; work in progress with Layout, Charts, DataTable, SiteSearch, Interactive, motifs, terrain scroll components and `/design-kit/home|town|badyet` prototypes). Needed: that the kit owns the structural components and visual style; the commit/branch the page work should build against and when it is ready; and who wires the real pages (this plan assumes: the kit worktree commits first, then page work consumes `src/components/kit`).
- **Dinastiya person pages:** do they ship in v1, given they name individuals? If not, grid cells and surname chips link to the filtered town view instead.
