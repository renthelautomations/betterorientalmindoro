import type { Metadata } from "next";
import Link from "next/link";
import { PatternFill, PATTERNS, FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";
import { Halcon, Tamaraw, Lake, Mangyan, Sun, Divider, DIVIDERS, HeroBg, BG_LABELS, type BgKey, type DividerKey } from "@/components/kit/Motifs";
import KitIcon, { KIT_ICONS, type KitIconName } from "@/components/kit/KitIcon";
import { Button, Badge, SectionHeader, PillarCard, StatCard, ServiceRow, Callout, type BtnVariant } from "@/components/kit/Parts";

import { getMunicipalities } from "@/lib/municipalities";
import { getStats, fmtInt } from "@/lib/stats";
import { BarChart, Choropleth } from "@/components/kit/Charts";
import DataTable from "@/components/kit/DataTable";
import HalconScroll from "@/components/kit/HalconScroll";
import { Donut, Treemap, Timeline, type TimelineItem } from "@/components/kit/Charts2";
import { Network, type NetEdge } from "@/components/kit/Network";
import CompareTowns from "@/components/kit/CompareTowns";
import LineChart from "@/components/kit/LineChart";
import Terrain3D from "@/components/kit/Terrain3D";
import { KitHeader, KitFooter } from "@/components/kit/Layout";
import { Accordion, Stepper, Checklist, Breadcrumbs, Tooltip, Skeleton, EmptyState, AlertBanner, Field, INPUT } from "@/components/kit/Ui";
import { Tabs, ToastDemo } from "@/components/kit/Interactive";
import TownEmblem from "@/components/kit/TownEmblem";
import NaujanScroll from "@/components/kit/NaujanScroll";
import SiteSearch, { type SearchItem } from "@/components/kit/SiteSearch";
import { HotlineCard } from "@/components/kit/Ui";
import { getHotlines } from "@/lib/hotlines";
import { getServices } from "@/lib/services";
import { getProjects } from "@/lib/projects";
import { getProvince, getTown, surnameOf, titleCase } from "@/lib/dynasties";
import { fmtPeso } from "@/lib/stats";

export const metadata: Metadata = { title: "Design kit (draft)", robots: { index: false } };

const C = { ma: FIESTA.blue, hal: FIESTA.green, ta: FIESTA.red, na: FIESTA.sky, navy: FIESTA.navy };
const Sec = ({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) => (
  <section id={id} className="border-t border-black/10 py-10">
    <h2 className="font-serif text-2xl font-bold">{title}</h2>
    {note && <p className="mt-1 max-w-2xl text-sm text-black/60">{note}</p>}
    <div className="mt-6">{children}</div>
  </section>
);
const Tag = ({ children }: { children: React.ReactNode }) => <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs font-semibold">{children}</code>;

export default function DesignKit() {
  // --- derived data for the extra charts ---
  const sum = (key: "status" | "category") => {
    const m = new Map<string, number>();
    for (const p of getProjects()) m.set(p[key] ?? "Walang kategorya", (m.get(p[key] ?? "Walang kategorya") ?? 0) + (p.cost ?? 0));
    return [...m].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };
  const byStatus = sum("status");
  const byCategory = sum("category").slice(0, 8);
  const series = getMunicipalities().map((m) => ({ name: m.name, points: (getStats(m.slug)?.population ?? []).map((p) => ({ year: p.year, value: p.value })) })).filter((s) => s.points.length > 1);
  const dyn = getProvince().towns.map((slug) => getTown(slug)!).filter(Boolean);
  const label = (slug: string) => getMunicipalities().find((m) => m.slug === slug)?.name ?? slug;
  const surnames = new Map<string, Set<string>>();
  for (const t of dyn) for (const c of t.contests) for (const w of c.winners) { const sn = surnameOf(w.ballot); if (sn) (surnames.get(sn) ?? surnames.set(sn, new Set()).get(sn)!).add(t.slug); }
  const pair = new Map<string, string[]>();
  for (const [sn, set] of surnames) { const a = [...set].sort(); for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) { const k = a[i] + "|" + a[j]; pair.set(k, [...(pair.get(k) ?? []), sn]); } }
  const edges: NetEdge[] = [...pair].map(([k, sn]) => { const [a, b] = k.split("|"); return { a, b, weight: sn.length, note: `${label(a)} - ${label(b)}: ${sn.slice(0, 5).map(titleCase).join(", ")}${sn.length > 5 ? "…" : ""}` }; }).sort((x, y) => y.weight - x.weight).slice(0, 28);
  const mayors: TimelineItem[] = (getTown("calapan-city")?.contests ?? []).filter((c) => c.position === "MAYOR" && c.winners[0]?.ballot).sort((a, b) => b.year - a.year).map((c) => ({ year: c.year, title: titleCase(c.winners[0]?.ballot.split(",").reverse().join(" ").trim() ?? "-"), sub: [c.winners[0]?.party, c.winners[0]?.votes ? `${c.winners[0].votes.toLocaleString("en-PH")} boto` : null].filter(Boolean).join(" · ") }));

  const searchItems: SearchItem[] = [
    ...getMunicipalities().map((t) => ({ type: "bayan" as const, title: t.name, sub: t.isCity ? "Lungsod" : "Bayan", href: `/bayan/${t.slug}` })),
    ...getServices().map((x) => ({ type: "serbisyo" as const, title: x.title, sub: x.summary, href: `/serbisyo/${x.category}/${x.id}` })),
    ...getHotlines().map((h) => ({ type: "hotline" as const, title: h.name, sub: h.number, href: "tel:" + h.number.replace(/[^\d+]/g, "") })),
  ];
  const towns = getMunicipalities().map((m) => {
    const pop = getStats(m.slug)?.population.at(-1);
    return { ...m, pop: pop?.value ?? null, year: pop?.year ?? null };
  });
  const patterns = Object.keys(PATTERNS) as PatternKey[];
  const bgs = Object.keys(BG_LABELS) as BgKey[];
  const dividers = Object.keys(DIVIDERS) as DividerKey[];
  const icons = Object.keys(KIT_ICONS) as KitIconName[];
  const btns: BtnVariant[] = ["solid", "outline", "soft", "pill"];
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <header className="py-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--na)]">DRAFT · NOT COMMITTED</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">Design kit: pick what we keep</h1>
        <p className="mt-3 max-w-2xl text-black/70">Every option has an ID. Tell me e.g. <Tag>PAT-mosaic, BG-banners, DIV-tiles, BTN-pill, ICON-duo</Tag> and I will wire only those into the site.</p>
      </header>

      <Sec id="patterns" title="Patterns" note="Seamless tiles. Flat, bold, multi-color. The ikat diamond is Mangyan-weave inspired; needs community review before shipping.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {patterns.map((p) => (
            <figure key={p}>
              <div className="relative h-36 overflow-hidden rounded-xl bg-white ring-1 ring-black/10"><PatternFill variant={p} colors={p === "mosaic" ? [FIESTA.orange, FIESTA.blue, FIESTA.green, FIESTA.pink] : [FIESTA.blue, FIESTA.orange]} /></div>
              <figcaption className="mt-2 text-sm"><Tag>PAT-{p}</Tag> <span className="text-black/60">{PATTERNS[p].label}</span></figcaption>
            </figure>
          ))}
        </div>
      </Sec>

      <Sec id="backgrounds" title="Hero backgrounds" note="Same headline over each, to judge legibility.">
        <div className="grid gap-5 md:grid-cols-2">
          {bgs.map((b) => (
            <figure key={b}>
              <HeroBg variant={b} className="rounded-2xl ring-1 ring-black/10">
                <div className="px-6 pb-44 pt-10 sm:max-w-[52%]"><p className="text-xs font-semibold tracking-[0.2em] opacity-80">MAHALTANA</p><p className="mt-2 max-w-xs font-serif text-3xl font-bold leading-tight">Apat na haligi ng Oriental Mindoro.</p></div>
              </HeroBg>
              <figcaption className="mt-2 text-sm"><Tag>BG-{b}</Tag> <span className="text-black/60">{BG_LABELS[b]}</span></figcaption>
            </figure>
          ))}
        </div>
      </Sec>

      <Sec id="motifs" title="Vector motifs" note="Single-color SVG, recolorable. Modeled on the four pennant emblems. Placeholders; the Mangyan sign needs community review.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {([["halcon", <Halcon key="h" color={C.hal} />], ["tamaraw", <Tamaraw key="t" color={C.ta} className="h-28 w-auto" />], ["lake", <Lake key="l" color={C.na} />], ["mangyan", <Mangyan key="m" color={C.ma} />], ["sun", <Sun key="s" color={FIESTA.orange} />]] as const).map(([k, el]) => (
            <figure key={k} className="rounded-xl bg-white p-5 text-center ring-1 ring-black/10"><div className="flex h-28 items-center justify-center">{el}</div><figcaption className="mt-3"><Tag>MOTIF-{k}</Tag></figcaption></figure>
          ))}
        </div>
      </Sec>

      <Sec id="dividers" title="Section dividers">
        <div className="space-y-6">
          {dividers.map((d) => (
            <figure key={d}><div className="bg-white ring-1 ring-black/10"><Divider variant={d} /></div><figcaption className="mt-2"><Tag>DIV-{d}</Tag> <span className="text-black/60">{DIVIDERS[d].label}</span></figcaption></figure>
          ))}
        </div>
      </Sec>

      <Sec id="icons" title="Civic icons (24 glyphs, 3 styles)" note="Pick one style: line, duo (tinted fill), or badge (white on color).">
        {(["line", "duo", "badge"] as const).map((v) => (
          <div key={v} className="mb-8">
            <p className="mb-3"><Tag>ICON-{v}</Tag></p>
            <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
              {icons.map((n, i) => (
                <li key={n} className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-black/10">
                  <KitIcon name={n} variant={v} color={Object.values(C)[i % 4]} className={v === "badge" ? "h-10 w-10" : "h-7 w-7"} />
                  <span className="text-xs text-black/60">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Sec>


      <Sec id="data" title="Data components" note="Built on the real municipality and population data. BarChart and Choropleth render on the server (no chart library, no WebGL); the table is the only client piece.">
        <p className="mb-3 text-sm font-semibold">Ranked bars <Tag>CHART-bars</Tag> and choropleth map <Tag>CHART-choropleth</Tag></p>
        <div className="grid gap-8 md:grid-cols-2">
          <BarChart rows={towns.filter((t) => t.pop != null).map((t) => ({ label: t.name, value: t.pop as number, href: `/bayan/${t.slug}` }))} format={fmtInt} highlight="Calapan City" />
          <Choropleth rows={towns.map((t) => ({ pcode: t.pcode, name: t.name, value: t.pop, href: `/bayan/${t.slug}` }))} format={fmtInt} unit="population" />
        </div>
        <p className="mb-3 mt-10 text-sm font-semibold">Sortable, filterable table <Tag>TABLE-data</Tag></p>
        <DataTable
          caption="Mga bayan at lungsod ng Oriental Mindoro"
          filterKey="name"
          rows={towns.map((t) => ({ name: t.name, kind: t.isCity ? "Lungsod" : "Bayan", pop: t.pop, trend: getStats(t.slug)?.population.map((p) => p.value) ?? null, area: t.areaKm2 }))}
          cols={[{ key: "name", label: "table.name" }, { key: "kind", label: "table.kind" }, { key: "pop", label: "table.pop", align: "right", format: "int" }, { key: "trend", label: "table.trend", format: "spark" }, { key: "area", label: "table.area", align: "right", format: "int" }]}
        />
      </Sec>


      <Sec id="more-charts" title="More charts" note="Line chart (pick a town), donut and treemap of DPWH project cost, a dynasty-style network and an election timeline. All use real data in this repo.">
        <div className="grid gap-10 md:grid-cols-2">
          <div><p className="mb-3 text-sm font-semibold">Line with town picker <Tag>CHART-line</Tag></p><LineChart series={series} label="common.town" /></div>
          <div><p className="mb-3 text-sm font-semibold">Donut: project cost by status <Tag>CHART-donut</Tag></p><Donut slices={byStatus} format={fmtPeso} centerLabel="kabuuang gastos" /></div>
          <div className="md:col-span-2"><p className="mb-3 text-sm font-semibold">Treemap: project cost by category <Tag>CHART-treemap</Tag></p><Treemap items={byCategory} format={fmtPeso} /></div>
          <div><p className="mb-3 text-sm font-semibold">Network: towns sharing winning surnames (hover a town) <Tag>CHART-network</Tag></p><Network nodes={dyn.map((t) => ({ id: t.slug, label: label(t.slug) }))} edges={edges} /><p className="mt-2 text-xs text-black/60">Same surname only. This is a hint, never proof of relation.</p></div>
          <div><p className="mb-3 text-sm font-semibold">Timeline: Calapan City mayors <Tag>TIMELINE</Tag></p><Timeline items={mayors} /></div>
        </div>
      </Sec>


      <Sec id="compare" title="Compare two towns" note="Pick any two. Each row is scaled to the larger of the pair. CHART-compare.">
        <CompareTowns initial={["naujan", "pinamalayan"]} towns={getMunicipalities().map((t) => ({ slug: t.slug, name: t.name }))} metrics={[
          { label: "metric.pop", values: Object.fromEntries(getMunicipalities().map((t) => [t.slug, getStats(t.slug)?.population.at(-1)?.value ?? null])) },
          { label: "metric.area", values: Object.fromEntries(getMunicipalities().map((t) => [t.slug, t.areaKm2])) },
          { label: "metric.projects", values: Object.fromEntries(getMunicipalities().map((t) => [t.slug, getProjects(t.slug).length])) },
          { label: "metric.revenue", unit: "peso", values: Object.fromEntries(getMunicipalities().map((t) => [t.slug, getStats(t.slug)?.revenue?.value ?? null])) },
        ]} />
      </Sec>

      <Sec id="terrain" title="3D terrain" note="Drag to rotate, right-drag or ctrl-drag to tilt. Needs WebGL and loads public elevation tiles. TERRAIN-3d.">
        <Terrain3D />
      </Sec>


      <Sec id="emblems" title="Town emblems" note="Placeholder marks, one per town, generated from the slug so a town always gets the same one. The capital gets a star. Not official coats of arms. EMBLEM-town.">
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {getMunicipalities().map((t) => <li key={t.slug} className="text-center"><TownEmblem slug={t.slug} name={t.name} className="mx-auto h-20 w-20" capital={t.slug === "calapan-city"} /><p className="mt-2 text-xs font-medium">{t.name}</p></li>)}
        </ul>
      </Sec>

      <Sec id="search" title="Search and hotline cards" note="Type a town, a service or a number (try: calapan, birth, 911). Enter opens the first result. SEARCH-site, CARD-hotline.">
        <div className="min-h-72">
          <SiteSearch items={searchItems} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getHotlines("province").slice(0, 3).map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}
          </div>
        </div>
      </Sec>

      <Sec id="templates" title="Page templates" note="Full pages built only from kit pieces and real data. TEMPLATE-home, TEMPLATE-town.">
        <ul className="grid gap-3 sm:grid-cols-3">
          <li><a href="/design-kit/home" className="block rounded-2xl bg-fiesta-navy p-5 font-semibold text-white hover:bg-fiesta-blue">Home template →</a></li>
          <li><Link href="/design-kit/town/naujan" className="block rounded-2xl bg-fiesta-green-deep p-5 font-semibold text-white hover:opacity-90">Town profile: Naujan →</Link></li>
          <li><Link href="/design-kit/town/calapan-city" className="block rounded-2xl bg-fiesta-orange-deep p-5 font-semibold text-white hover:opacity-90">Town profile: Calapan City →</Link></li>
          <li><Link href="/design-kit/not-found-demo" className="block rounded-2xl bg-fiesta-red p-5 font-semibold text-white hover:opacity-90">404 page →</Link></li>
          <li><Link href="/design-kit/story/hal" className="block rounded-2xl bg-fiesta-sky-deep p-5 font-semibold text-white hover:opacity-90">Pillar story: Halcon →</Link></li>
        </ul>
      </Sec>

      <Sec id="scene" title="Scroll scene" note="Scroll through it: sunrise, clouds and foothills move with scroll position, using only CSS variables (no animation library). Static with reduced motion. TAB: SCENE-halcon.">
        <div className="-mx-4 md:mx-0 md:overflow-hidden md:rounded-2xl"><HalconScroll /></div>
      </Sec>

      <Sec id="scene-naujan" title="Scroll scene: Naujan Lake" note="Sun sinks, birds cross, water ripples. Copy is placeholder; verify the facts before using. SCENE-naujan.">
        <div className="-mx-4 md:mx-0 md:overflow-hidden md:rounded-2xl"><NaujanScroll /></div>
      </Sec>


      <Sec id="tokens" title="Design tokens" note="Now in globals.css as Tailwind theme colors. Use bg-fiesta-blue, text-fiesta-navy, ring-fiesta-orange and so on. TOKENS-fiesta.">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["orange", "blue", "green", "yellow", "pink", "navy", "sky", "red", "mint", "cream"] as const).map((k) => (
            <li key={k} className="overflow-hidden rounded-xl ring-1 ring-black/10"><div className="h-14" style={{ background: FIESTA[k] }} /><p className="p-2 text-xs"><span className="font-semibold">fiesta-{k}</span><br /><span className="text-black/60">{FIESTA[k]}</span></p></li>
          ))}
        </ul>
      </Sec>

      <Sec id="layout" title="Header and footer" note="Header: stripe, logo, EN/FIL toggle, inline links on desktop, native menu on phones. Footer: Ma Hal Ta Na strip, links, disclaimer. Try the EN | FIL switch: header, footer, search, tables, cards, scenes and templates all follow it. LAYOUT-header, LAYOUT-footer, LANG-toggle.">
        <div className="overflow-hidden rounded-2xl ring-1 ring-black/10">
          <KitHeader links={[{ label: "nav.towns", href: "#a" }, { label: "nav.services", href: "#b" }, { label: "nav.hotlines", href: "#c" }, { label: "nav.projects", href: "#d" }, { label: "nav.stats", href: "#e" }]} />
          <div className="h-16 bg-white" />
          <KitFooter links={[{ label: "nav.sitemap", href: "#a" }, { label: "nav.privacy", href: "#b" }, { label: "nav.faq", href: "#c" }]} sources={[{ label: "GitHub", href: "#d" }, { label: "BetterGov.PH", href: "#e" }]} />
        </div>
      </Sec>

      <Sec id="service-parts" title="Service page parts" note="FAQ accordion, how-to-apply stepper, requirements checklist, breadcrumbs. All native HTML where possible, so they work without JavaScript. ACC-faq, STEP-apply, CHECK-reqs, CRUMBS.">
        <Breadcrumbs items={[{ label: "Home", href: "#" }, { label: "Serbisyo", href: "#" }, { label: "Kalusugan", href: "#" }, { label: "Health card" }]} />
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div><p className="mb-3 text-sm font-semibold">Stepper</p><Stepper steps={[{ title: "Ihanda ang mga dokumento", body: "Kumpletuhin ang listahan sa kanan." }, { title: "Pumunta sa munisipyo", body: "Sa opisina ng kalusugan, Lunes hanggang Biyernes." }, { title: "Bayaran ang fee", body: "Kumuha ng resibo sa cashier." }, { title: "Kunin ang card", body: "Karaniwang handa sa loob ng 3 araw." }]} /></div>
          <div className="space-y-6"><Checklist title="MGA KAILANGAN" items={["Valid ID", "Barangay clearance", "2x2 na litrato", "Resibo ng bayad"]} /><Accordion items={[{ q: "Magkano ang bayad?", a: "Depende sa munisipyo. Tingnan ang opisyal na pahina ng LGU." }, { q: "Maaari bang ipadala ang ibang tao?", a: "Oo, may authorization letter at kopya ng ID." }]} /></div>
        </div>
      </Sec>

      <Sec id="ui-pieces" title="UI pieces" note="Alerts, tabs, tooltip, toast, form fields, skeleton, empty state. ALERT, TABS, TOOLTIP, TOAST, FIELD, SKELETON, EMPTY.">
        <div className="space-y-3"><AlertBanner level="warning" title="Typhoon signal no. 2 sa Oriental Mindoro">Maghanda sa malakas na hangin at ulan. Sumunod sa PDRRMO.</AlertBanner><AlertBanner level="advisory" title="Posibleng pagbaha sa Naujan">Bantayan ang lebel ng ilog.</AlertBanner></div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Tabs tabs={[{ id: "a", label: "Pangkalahatan", panel: <p className="text-sm text-black/75">Ang Oriental Mindoro ay may 15 bayan at lungsod.</p> }, { id: "b", label: "Kasaysayan", panel: <p className="text-sm text-black/75">Itinatag ang lalawigan noong 1950.</p> }, { id: "c", label: "Mga link", panel: <p className="text-sm text-black/75">Gamitin ang arrow keys para lumipat ng tab.</p> }]} />
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4"><Tooltip tip="Tawag sa PDRRMO, 24/7"><button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-fiesta-navy px-4 text-sm font-semibold"><KitIcon name="phone" className="h-4 w-4" />(043) 948 146 0382</button></Tooltip><ToastDemo /></div>
            <Field id="town" label="Bayan" hint="Pumili ng iyong bayan."><select id="town" className={INPUT} defaultValue=""><option value="" disabled>Pumili…</option><option>Calapan City</option><option>Naujan</option></select></Field>
            <Field id="num" label="Numero na itatama" error="Maglagay ng valid na numero."><input id="num" aria-invalid="true" aria-describedby="num-err" className={INPUT} defaultValue="123" /></Field>
          </div>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-3"><Skeleton className="h-6 w-1/2" /><Skeleton /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-24 w-full rounded-2xl" /></div>
          <EmptyState title="Walang tugma">Subukan ang ibang salita sa paghahanap.</EmptyState>
        </div>
      </Sec>

      <Sec id="components" title="Components">
        <p className="mb-3 text-sm font-semibold">Buttons</p>
        <div className="flex flex-wrap items-center gap-3">{btns.map((b) => <div key={b} className="flex flex-col items-start gap-1"><Button variant={b} icon="arrow">Tingnan</Button><Tag>BTN-{b}</Tag></div>)}</div>
        <p className="mb-3 mt-8 text-sm font-semibold">Badges</p>
        <div className="flex flex-wrap gap-3"><Badge kind="wip">WIP</Badge><Badge kind="verified">Verified</Badge><Badge kind="new">New</Badge><Badge kind="soon">Coming soon</Badge></div>
        <p className="mb-3 mt-8 text-sm font-semibold">Section headers <Tag>HDR-ornament</Tag></p>
        <div className="grid gap-8 md:grid-cols-2"><SectionHeader eyebrow="PARA SA BAYAN" title="Mga serbisyo" /><SectionHeader eyebrow="MAHALTANA" title="Ang ating kuwento" color={C.na} align="center" /></div>
        <p className="mb-3 mt-8 text-sm font-semibold">Pillar cards <Tag>CARD-pillar</Tag> (pattern per pillar)</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <PillarCard short="Ma" name="Mangyan" blurb="Kultura at tradisyon." color={C.ma} pattern="ikat" />
          <PillarCard short="Hal" name="Mount Halcon" blurb="Ang bundok ng lalawigan." color={FIESTA_DEEP.green} pattern="peaks" />
          <PillarCard short="Ta" name="Tamaraw" blurb="Tanging sa Mindoro." color={C.ta} pattern="horns" />
          <PillarCard short="Na" name="Naujan Lake" blurb="Ang pinakamalaking lawa." color={FIESTA_DEEP.sky} pattern="wave" />
        </div>
        <p className="mb-3 mt-8 text-sm font-semibold">Stat cards <Tag>CARD-stat</Tag></p>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="BAYAN" value="15" hint="Mga bayan at lungsod" icon="pin" />
          <StatCard label="HOTLINES" value="120+" hint="Na-verify na numero" icon="phone" color={C.ma} />
          <StatCard label="PROYEKTO" value="1,284" hint="DPWH projects" icon="road" color={C.hal} />
        </div>
        <p className="mb-3 mt-8 text-sm font-semibold">Service rows <Tag>CARD-row</Tag></p>
        <div className="grid gap-3 md:grid-cols-2">
          <ServiceRow icon="health" title="Kalusugan" sub="Ospital at health centers" color={C.ma} />
          <ServiceRow icon="flood" title="Baha at sakuna" sub="Babala at evacuation centers" color={C.na} />
          <ServiceRow icon="school" title="Edukasyon" sub="Paaralan at scholarship" color={C.hal} />
          <ServiceRow icon="ferry" title="Biyahe" sub="Pantalan at ferry" color={C.ta} />
        </div>
        <p className="mb-3 mt-8 text-sm font-semibold">Callouts <Tag>CALLOUT</Tag></p>
        <div className="grid gap-3 md:grid-cols-2"><Callout kind="emergency" title="Emergency: 911">Para sa sunog, krimen, at medikal na emergency.</Callout><Callout kind="info" title="Na-verify noong Nobyembre 2026">Pinagmulan: opisyal na website ng LGU.</Callout></div>
      </Sec>
    </main>
  );
}
