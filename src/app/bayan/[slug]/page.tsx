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
import { StatCard } from "@/components/kit/Parts";
import { HotlineCard } from "@/components/kit/Ui";
import { Tabs } from "@/components/kit/Interactive";
import LineChart from "@/components/kit/LineChart";
import { Divider } from "@/components/kit/Motifs";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { getBarangays, getMunicipalities, getMunicipality } from "@/lib/municipalities";
import { fmtInt, fmtPct, fmtPeso, getProvinceStats, getStats, popGrowth } from "@/lib/stats";
import { hotlinesForBayan } from "@/lib/hotlines";
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

  const panels = [
    { id: "pangkalahatan", label: "town.overview", panel: (
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className={h3}><T k="town.pop.over" /></p>
          {pop.length ? <LineChart series={[{ name: m.name, points: pop.map((p) => ({ year: p.year, value: p.value })) }]} label="common.town" /> : <BayanEmpty title="bayan.nopop" body="bayan.nopop.p" />}
        </div>
        <div>
        <dl className="space-y-3 text-sm">
          <div><dt className="text-black/70"><T k="town.type" /></dt><dd className="font-semibold"><T k={m.isCity ? "town.city" : "town.town"} />{cls ? ` · ${cls}` : ""}</dd></div>
          <div><dt className="text-black/70"><T k="town.revenue" /> ({stats?.revenue?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.revenue?.value)}</dd></div>
          <div><dt className="text-black/70"><T k="town.spend" /> ({stats?.expenditure?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.expenditure?.value)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-black/70"><T k="bayan.source.note" /></p>
        </div>
      </div>
    ) },
    { id: "hotlines", label: "town.hotlines", badge: String(local.length + province.length), panel: (
      <div className="space-y-6">
        {local.length ? (
          <div><p className={h3}><T k="town.in" /> {m.name}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{local.map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div></div>
        ) : <BayanEmpty title="bayan.nohot" body="bayan.nohot.p" name={m.name} />}
        <div><p className={h3}><T k="town.province" />{local.length ? null : <> <T k="bayan.forthis" /></>}</p>
          {province.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{province.slice(0, 6).map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div> : <p className="text-sm text-black/70"><T k="bayan.noprov" /></p>}
        </div>
        <Link href="/hotlines" className={link}><T k="bayan.allhot" /></Link>
      </div>
    ) },
    { id: "proyekto", label: "town.projects", badge: String(projects.length), panel: projects.length ? (
      <SplitSticky side={<div><p className={h3}><T k="bayan.status.h" /></p><BigDonut slices={slices} format={(n) => n.toLocaleString("en-PH")} centerLabel="bayan.projects.lc" /></div>}>
        <div className="space-y-6">
        <div>
          <p className={h3}><T k="bayan.top.h" /></p>
          <ul className="space-y-3">
            {top.map((p) => <li key={p.id}><ProjectRow id={p.id} title={p.title} year={p.year} status={p.status} cost={p.cost} category={p.category} max={top[0].cost} /></li>)}
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
          <StatCard label="town.pop" value={fmtInt(last?.value)} hint={last ? `Census ${last.year}` : "town.nodata"} icon="people" />
          <StatCard label="town.growth" value={growth == null ? "-" : `${growth >= 0 ? "+" : ""}${fmtPct(growth)}`} hint={pop.length > 1 ? `${pop[0].year}-${pop.at(-1)!.year}` : "town.nodata"} icon="mountain" color={FIESTA_DEEP.green} />
          <StatCard label="town.share" value={last && provPop ? fmtPct(last.value / provPop.value) : "-"} hint="town.share.h" icon="pin" color={FIESTA_DEEP.orange} />
          <StatCard label="town.proj" value={projects.length ? fmtInt(projects.length) : "-"} hint={projects.length ? "town.proj.h" : "bayan.noproj.hint"} icon="road" color={FIESTA.red} />
        </section>
        <div className="mt-12"><Tabs tabs={panels} /></div>
      </div>
    </main>
  );
}
