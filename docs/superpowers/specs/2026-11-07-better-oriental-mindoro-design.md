# Better Oriental Mindoro: Design

## Intent
A free, volunteer-run civic website for the province of Oriental Mindoro, Philippines, in the BetterGov.PH family (like betterbinangonan.org and bettergeneraltrias.org). It helps residents find services and hotlines, and helps anyone see how public money and projects affect their province. Culture draws people in; civic data keeps them.

The people behind it are civilian volunteers from Oriental Mindoro, associated with BetterGov.PH. They are not the provincial government.

## Brand
- **Site name:** Better Oriental Mindoro (domain to be chosen; family style is `better<place>.org`).
- **Story and tagline:** MaHalTaNa, an acronym for the province's four icons:
  - **Ma** Mangyan (indigenous peoples of Mindoro)
  - **Hal** Mount Halcon
  - **Ta** Tamaraw
  - **Na** Naujan Lake
- MaHalTaNa is the culture identity inside the site, not the site's name.
- **Tagline:** not decided. Candidate: "Apat na haligi ng Oriental Mindoro." (builder may propose alternatives).
- **Logo:** a white-on-navy mark in the style of the family (Binangonan uses its town outline drawn with bamboo stalks). Oriental Mindoro's outline (boundary data already in the repo) is the starting point. Builder's call on the final mark.
- **Voice:** plain, practical, citizen-facing, Filipino and English mixed.
- **Palette (guess, not agreed):** terracotta (Ma), forest green (Hal), brown (Ta), teal (Na) on a warm off-white. Navy for the footer, to match the BetterGov family.

## Home page (chosen: "Four Doors")
- Header with wordmark and nav: Bayan, Serbisyo, Mapa.
- Hero: headline and one-line intro.
- Four coloured tiles, one per icon, each opening that icon's story page.
- A quiet strip of civic links below: Hotlines, Proyekto (DPWH), Badyet, Halalan.
- Clean, spacious, mobile-first. "Well laid and clean" is an explicit requirement.

## Footer (modelled on betterbinangonan.org)
Navy background; white logo; bold tagline; "volunteer-led civic website under BetterGov.PH initiative" paragraph; "Not affiliated with or representing the Oriental Mindoro provincial government or any LGU"; "100% free, volunteer-run and community-based"; Quick Links (Sitemap, Terms of Use, Privacy Policy, Accessibility, FAQ); Facebook and GitHub icons; "MIT License. All public data sourced from official government portals."

## Scope of the first version
1. Home page as above.
2. Four MaHalTaNa story pages (Ma, Hal, Ta, Na). Naujan Lake links to hazard information; Halcon to weather and trekking.
3. Province map (built: `web/src/components/Map.tsx`) with 14 municipalities plus Calapan City; each opens a municipality page.
4. Municipality pages (15): barangays, hotlines, related projects.
5. Hotlines directory (tap-to-call).
6. One data page: DPWH projects or budget, filtered to Oriental Mindoro.
7. Footer and legal pages (Terms, Privacy, Accessibility, FAQ, Sitemap).

## Goals
- Useful and trustworthy for a resident in under a minute.
- Visually clean and distinctive, with the culture story front and centre.
- Every data point shows its source and license.
- Cheap to run on free tiers; open source (MIT).

## Non-goals
- Not an official government site; no transactions or permit processing.
- No user accounts or community submissions in v1.
- No news, e-commerce, or social features in v1.

## Anti-goals (failure even if it works)
- Looks like a generic template or reads as "official" government.
- Mangyan culture used decoratively or without the communities' involvement.
- Stale or unsourced hotline numbers.

## Constraints
- Stack: Next.js (App Router) on Vercel, Supabase (Postgres/PostGIS) for data, GitHub for code. These were stated by the project owner.
- Data sources and licenses:
  - **BetterGov Open Data catalog:** `data.bettergov.ph`. Read-only API with spec at `/openapi.json`. MCP endpoint at `/mcp`. It is a catalog of downloadable files, not a province-queryable API.
  - **Boundaries (MIT):** the NAMRIA/PSA barangay boundary dataset.
  - **DPWH projects and flood control (CC0).**
  - **OpenHalalan elections (ODbL).** Needs attribution and share-alike.
  - **Project NOAH hazard maps (ODC-ODbL).** A 5.5 GB PMTiles file; a province clip is needed.
  - **BLGF LGU fiscal data (public domain).** XLSX/PDF, needs parsing.
- No health, education, population, tourism or weather-station data for the province exists in the catalog; these come from PSA, PAGASA, DepEd, DOH, or volunteers.
- No external accounts or deployments are created without the owner's approval.

## Already built (scaffold, local only)
- `web/`: Next.js 16 app with a MapLibre province map.
- `web/scripts/fetch-boundaries.mjs`: downloads and filters boundaries to Oriental Mindoro.
- `web/public/data/`: provinces, municipalities, Calapan City and 426 barangays as GeoJSON.
- Note: the MapLibre worker is served from `public/maplibre-gl-worker.mjs` because it fails under Turbopack otherwise; re-copy it when upgrading `maplibre-gl`.

## Decided by the project owner
- Name and brand structure (above).
- Home direction A, "Four Doors".
- Footer pattern as in the Binangonan screenshot.
- Volunteer group, associated with BetterGov.PH.
- Everything in "Scope of the first version" is wanted, laid out cleanly.

## My calls (not yet confirmed)
- Colour palette, typography and the candidate tagline.
- Filipino/English mixed voice.
- Inner-page structure for the four story pages.
- Filtering by ADM2_EN "Oriental Mindoro" for provincial data.

## More calls made after the builder check (mine, not confirmed)
- **v1 data page:** DPWH projects only. Badyet and Halalan tiles in the home strip show "coming soon" in v1.
- **Municipality projects:** match DPWH records to a municipality by the dataset's location field when it has one, otherwise show province-level projects with a note.
- **Hal page:** weather from Open-Meteo (as Binangonan does); trekking as written text. **Na page:** link out to Project NOAH in v1; the province PMTiles clip is a later task.
- **Copy:** I draft factual copy for Hal, Ta and Na from published sources, marked draft for volunteer review.
- **Assets:** flat colour and illustration are fine for v1 where photos are missing. The logo mark is part of v1.
- **Accounts and deployment:** build local first. Supabase holds hotlines and projects; nothing is created on Supabase, Vercel, GitHub or a domain without approval.
- **Legal pages:** adapted from the Binangonan/BetterGov wording. No analytics in v1.
- **Hotlines:** seeded from public sources (PDRRMO, PNP, BFP, hospitals). Every entry carries a source and a "last verified" date.

## Left to the builder
- Component structure, database schema, ETL scheduling.
- Final logo mark and visual polish within the stated direction.
- Hosting layout for large files such as the NOAH tiles.
- Accessibility and performance approach.

## Decided after the builder check (owner)
- **Ma page:** ships in v1 as a clearly marked "in preparation" page with no imagery; the owner's group will update it once Mangyan content and community approval are in hand. The tile stays visible. (Owner said "we update it"; my reading is that the placeholder is acceptable.)
- **Hotlines:** seeded from public sources with a source and "last verified" date per entry, as proposed. The owner agreed; no named verifier or schedule yet.

## Open (needs the owner)
- Who approves Mangyan content later, and how consent and credit work.
- Domain name.
- Photography sources and licensing.
- Who verifies hotline numbers and how often (no named verifier yet).
