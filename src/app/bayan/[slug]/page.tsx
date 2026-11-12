import SplitSticky from "@/components/site/SplitSticky";
import BigDonut from "@/components/site/BigDonut";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DynNote from "@/components/site/DynNote";
import DynSurnames from "@/components/site/DynSurnames";
import { WinnersGrid } from "@/components/site/DynGrid";
import WinnersViews from "@/components/site/WinnersViews";
import { BayanCrumbs, BayanEmpty, BayanTitle } from "@/components/site/BayanBits";
import { T } from "@/lib/i18n/i18n";
import TownEmblem from "@/components/kit/TownEmblem";
import TownStat from "@/components/stats/TownStat";
import HotlineTile from "@/components/site/HotlineTile";
import { Tabs } from "@/components/kit/Interactive";
import LineChart from "@/components/kit/LineChart";
import { Divider } from "@/components/kit/Motifs";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { getBarangays, getBounds, getMunicipalities, getMunicipality } from "@/lib/municipalities";
import { fmtInt, fmtPct, fmtPeso, getProvinceStats, getStats, popGrowth } from "@/lib/stats";
import { hotlinesForBayan } from "@/lib/hotlines";
import LguDirectory from "@/components/site/LguDirectory";
import { getLguDirectory } from "@/lib/lgu-directory";
import LguContactCard from "@/components/site/LguContactCard";
import TownHazard from "@/components/site/TownHazard";
import TownOfficials from "@/components/site/TownOfficials";
import ProjectRow from "@/components/site/ProjectRow";
import { getProjects } from "@/lib/projects";
import { getProvince, getTown, sharedSurnames, surnameOf, titleCase, winnersGrid } from "@/lib/dynasties";

export const generateStaticParams = () => getMunicipalities().map((m) => ({ slug: m.slug }));

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipality(slug);
  return m ? { title: m.name, description: `${m.name}: populasyon, hotline, proyekto ng DPWH at halalan.` } : { robots: { index: false } };
}

const h3 = "mb-3 text-sm font-semibold";
const link = "inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2";

export default async function Bayan({ params }: PageProps<"/bayan/[slug]">) {
  const { slug } = await params;
  const m = getMunicipality(slug);
  if (!m) notFound();
  const stats = getStats(slug);
  const pop = stats?.population ?? [];
  const last = pop.at(-1);
  const growth = popGrowth(pop);
  const provPop = getProvinceStats().population.at(-1);
  const { local, province } = hotlinesForBayan(slug);
  const projects = getProjects(slug); // only rows assigned to this slug
  const top = [...projects].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).slice(0, 8);
  const byStatus = new Map<string, number>();
  for (const p of projects) byStatus.set(p.status ?? "bayan.nostatus", (byStatus.get(p.status ?? "bayan.nostatus") ?? 0) + 1);
  const slices = [...byStatus].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const dyn = getTown(slug);
  const years = getProvince().elections.map((e) => e.year);
  const surnames = dyn ? sharedSurnames(dyn.contests) : [];
  const cls = stats?.incomeClass?.value;
  const all = getMunicipalities();
  const maxOf = (f: (m: (typeof all)[number]) => number | null | undefined) => Math.max(...all.map((x) => f(x) ?? 0), 1);
  const rel = (v: number | null | undefined, max: number) => (v == null ? null : v / max);
  const maxPop = maxOf((x) => getStats(x.slug)?.population.at(-1)?.value);
  const maxRev = maxOf((x) => getStats(x.slug)?.revenue?.value);
  const maxSpend = maxOf((x) => getStats(x.slug)?.expenditure?.value);
  const maxArea = maxOf((x) => x.areaKm2);
  const bounds = getBounds(m.pcode);
  const nBrgy = getBarangays(m.pcode).length;
  const maxBrgy = maxOf((x) => getBarangays(x.pcode).length);

  const panels = [
    { id: "pangkalahatan", label: "town.overview", panel: (
      <div className="space-y-8">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className={h3}><T k="town.pop.over" /></p>
          {pop.length ? <LineChart series={[{ name: m.name, points: pop.map((p) => ({ year: p.year, value: p.value })) }]} label="common.town" /> : <BayanEmpty title="bayan.nopop" body="bayan.nopop.p" />}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-widest text-black/65"><T k="uxc.fin.h" /></h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <TownStat label="town.type" value={<><T k={m.isCity ? "town.city" : "town.town"} />{cls ? ` · ${cls}` : ""}</>} hint={stats?.incomeClass ? <>{stats.incomeClass.year}</> : <T k="town.nodata" />} icon="shield" color={FIESTA.blue} />
            <TownStat label="town.revenue" value={fmtPeso(stats?.revenue?.value)} hint={stats?.revenue?.year ? String(stats.revenue.year) : <T k="town.nodata" />} icon="budget" color={FIESTA_DEEP.green} share={rel(stats?.revenue?.value, maxRev)} barLabel="uxc.vsbig" />
            <TownStat label="town.spend" value={fmtPeso(stats?.expenditure?.value)} hint={stats?.expenditure?.year ? String(stats.expenditure.year) : <T k="town.nodata" />} icon="doc" color={FIESTA_DEEP.orange} share={rel(stats?.expenditure?.value, maxSpend)} barLabel="uxc.vsbig" />
          </div>
          <p className="mt-3 text-xs text-black/70"><T k="bayan.source.note" /></p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-widest text-black/65"><T k="uxc.land.h" /></h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TownStat label="finance.area" value={fmtInt(m.areaKm2)} hint="km²" icon="mountain" color={FIESTA_DEEP.sky} share={rel(m.areaKm2, maxArea)} barLabel="uxc.vsbig" />
            <TownStat label="finance.brgy" value={fmtInt(nBrgy)} hint={<T k="bayan.brgy.lc" />} icon="pin" color={FIESTA.navy} share={rel(nBrgy, maxBrgy)} barLabel="uxc.vsbig" />
          </div>
        </div>
      </div>
    ) },
    { id: "hotlines", label: "town.hotlines", badge: String(local.length + province.length), panel: (
      <div className="space-y-6">
        <LguContactCard slug={m.slug} name={m.name} />
        {local.length ? (
          <div><p className={h3}><T k="town.in" /> {m.name}</p><div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">{local.map((h) => <HotlineTile key={h.id} h={h} tone={h.category} />)}</div></div>
        ) : <BayanEmpty title="bayan.nohot" body="bayan.nohot.p" name={m.name} />}
        <div><p className={h3}><T k="town.province" />{local.length ? null : <> <T k="bayan.forthis" /></>}</p>
          {province.length ? <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">{province.slice(0, 6).map((h) => <HotlineTile key={h.id} h={h} tone={h.category} />)}</div> : <p className="text-sm text-black/70"><T k="bayan.noprov" /></p>}
        </div>
        <Link href="/hotlines" className={link}><T k="bayan.allhot" /></Link>
      </div>
    ) },
    { id: "opisyal", label: "off.tab", panel: <TownOfficials slug={m.slug} isCity={m.isCity} /> },
    ...(bounds ? [{ id: "hazard", label: "hz.tab", panel: <TownHazard name={m.name} bounds={bounds} /> }] : []),
    ...(getLguDirectory(m.slug) ? [{ id: "direktoryo", label: "lgu.dir.tab", badge: String(getLguDirectory(m.slug)!.offices.length), panel: <LguDirectory slug={m.slug} name={m.name} /> }] : []),
    { id: "proyekto", label: "town.projects", badge: String(projects.length), panel: projects.length ? (
      <SplitSticky side={<div><p className={h3}><T k="bayan.status.h" /></p><BigDonut slices={slices} format={(n) => n.toLocaleString("en-PH")} centerLabel="bayan.projects.lc" /></div>}>
        <div className="space-y-6">
        <div>
          <p className={h3}><T k="bayan.top.h" /></p>
          <ul className="grid auto-rows-fr gap-3">
            {top.map((p) => <li key={p.id} className="h-full"><ProjectRow id={p.id} title={p.title} year={p.year} status={p.status} cost={p.cost} category={p.category} max={top[0].cost} /></li>)}
          </ul>
        </div>
        <Link href={`/proyekto?bayan=${slug}`} className={link}><T k="bayan.allproj.pre" /> {fmtInt(projects.length)} <T k="bayan.allproj.post" /></Link>
        </div>
      </SplitSticky>
    ) : <BayanEmpty title="bayan.noproj" body="bayan.noproj.p" /> },
    { id: "halalan", label: "town.elections", panel: dyn ? (
      <div className="space-y-6">
        <DynNote />
        <div><p className={h3}><T k="bayan.winners.h" /></p>
          <WinnersViews single years={years} table={<WinnersGrid towns={[{ slug, name: m.name, contests: dyn.contests }]} years={years} caption={`Mga nanalong mayor at vice mayor ng ${m.name} ayon sa taon ng halalan`} />}
            towns={[{ slug, name: m.name, seats: winnersGrid(dyn.contests, years).rows.map((r) => ({ position: r.position, cells: r.cells.map((c) => ({ year: c.year, surname: c.winners[0] ? titleCase(surnameOf(c.winners[0].ballot) || c.winners[0].name) : null, full: c.winners.map((w) => titleCase(w.name)).join(", ") })) })) }]} /></div>
        <div><p className={h3}><T k="bayan.surnames.h" /></p><DynSurnames rows={surnames} towns={[dyn]} names={{ [slug]: m.name }} /></div>
        <Link href={`/dynasties/${slug}`} className={link}><T k="bayan.fullelect" /> {m.name} →</Link>
      </div>
    ) : <BayanEmpty title="bayan.noelect" body="bayan.noelect.p" /> },
  ];

  return (
    <main>
      <div className="bg-fiesta-mint">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
          <BayanCrumbs items={[{ label: "bayan.home", href: "/" }, { label: "nav.towns", href: "/bayan" }, { label: m.name, plain: true }]} />
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <TownEmblem slug={slug} name={m.name} className="h-24 w-24 shrink-0" capital={slug === "calapan-city"} />
            <div>
              <BayanTitle eyebrow={m.isCity ? "bayan.e.city" : "bayan.e.town"} title={m.name} plain />
              <p className="mt-3 text-black/70">Oriental Mindoro · {m.areaKm2.toLocaleString("en-PH")} km² · {getBarangays(m.pcode).length} <T k="bayan.brgy.lc" /></p>
            </div>
          </div>
        </div>
      </div>
      <Divider variant="mahaltana" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section aria-labelledby="nums" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <h2 id="nums" className="sr-only"><T k="bayan.numbers" /></h2>
          <TownStat label="town.pop" value={fmtInt(last?.value)} hint={last ? <>Census {last.year}</> : <T k="town.nodata" />} icon="people" color={FIESTA.blue} share={rel(last?.value, maxPop)} barLabel="uxc.vsbig" />
          <TownStat label="town.growth" value={growth == null ? "-" : `${growth >= 0 ? "+" : ""}${fmtPct(growth)}`} hint={pop.length > 1 ? `${pop[0].year}-${pop.at(-1)!.year}` : <T k="town.nodata" />} icon="mountain" color={FIESTA_DEEP.green} />
          <TownStat label="town.share" value={last && provPop ? fmtPct(last.value / provPop.value) : "-"} hint={<T k="town.share.h" />} icon="pin" color={FIESTA_DEEP.orange} share={last && provPop ? last.value / provPop.value : null} barLabel="uxc.vsprov" />
          <TownStat label="town.proj" value={projects.length ? fmtInt(projects.length) : "-"} hint={<T k={projects.length ? "town.proj.h" : "bayan.noproj.hint"} />} icon="road" color={FIESTA.red} />
        </section>
        <div className="mt-12"><Tabs tabs={panels} /></div>
      </div>
    </main>
  );
}
