import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import TownEmblem from "@/components/kit/TownEmblem";
import { StatCard } from "@/components/kit/Parts";
import { Breadcrumbs, HotlineCard } from "@/components/kit/Ui";
import { Tabs } from "@/components/kit/Interactive";
import LineChart from "@/components/kit/LineChart";
import { Donut, Timeline, type TimelineItem } from "@/components/kit/Charts2";
import DataTable from "@/components/kit/DataTable";
import { Divider } from "@/components/kit/Motifs";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { getMunicipalities, getMunicipality, getBarangays } from "@/lib/municipalities";
import { getStats, getProvinceStats, fmtInt, fmtPeso, fmtPct, popGrowth } from "@/lib/stats";
import { getHotlines } from "@/lib/hotlines";
import { getProjects } from "@/lib/projects";
import { getTown, titleCase } from "@/lib/dynasties";
import { T } from "@/lib/i18n/i18n";
import { DemoLangBar } from "@/components/kit/Layout";

export function generateStaticParams() {
  return getMunicipalities().map((m) => ({ slug: m.slug }));
}

export const metadata: Metadata = { title: "Town profile template (draft)", robots: { index: false } };

export default async function TownProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMunicipality(slug);
  if (!m) notFound();
  const stats = getStats(slug);
  const pop = stats?.population ?? [];
  const last = pop.at(-1);
  const growth = popGrowth(pop);
  const provinceHotlines = getHotlines("province");
  const town = getHotlines(slug);
  const projects = getProjects(slug);

  const byStatus = new Map<string, number>();
  for (const p of projects) byStatus.set(p.status ?? "Walang status", (byStatus.get(p.status ?? "Walang status") ?? 0) + (p.cost ?? 0));
  const slices = [...byStatus].map(([label, value]) => ({ label, value })).filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  const mayors: TimelineItem[] = (getTown(slug)?.contests ?? []).filter((c) => c.position === "MAYOR" && c.winners[0]?.ballot).sort((a, b) => b.year - a.year)
    .map((c) => ({ year: c.year, title: titleCase(c.winners[0].ballot.split(",").reverse().join(" ").trim()), sub: [c.winners[0].party, c.winners[0].votes ? `${c.winners[0].votes.toLocaleString("en-PH")} boto` : null].filter(Boolean).join(" · ") }));

  const panels = [
    { id: "pangkalahatan", label: "town.overview", panel: (
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div><p className="mb-2 text-sm font-semibold"><T k="town.pop.over" /></p><LineChart series={[{ name: m.name, points: pop.map((p) => ({ year: p.year, value: p.value })) }]} label="common.town" /></div>
        <dl className="space-y-3 text-sm">
          <div><dt className="text-black/60"><T k="town.type" /></dt><dd className="font-semibold"><T k={m.isCity ? "town.city" : "town.town"} />{stats?.incomeClass ? ` · ${stats.incomeClass.value}` : ""}</dd></div>
          <div><dt className="text-black/60"><T k="town.revenue" /> ({stats?.revenue?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.revenue?.value)}</dd></div>
          <div><dt className="text-black/60"><T k="town.spend" /> ({stats?.expenditure?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.expenditure?.value)}</dd></div>
          <p className="text-xs text-black/65"><T k="town.source" /></p>
        </dl>
      </div>
    ) },
    { id: "hotlines", label: "town.hotlines", badge: String(town.length + provinceHotlines.length), panel: (
      <div className="space-y-6">
        {town.length > 0 && <div><p className="mb-3 text-sm font-semibold"><T k="town.in" /> {m.name}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{town.map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div></div>}
        <div><p className="mb-3 text-sm font-semibold"><T k="town.province" /></p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{provinceHotlines.slice(0, 6).map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div></div>
      </div>
    ) },
    { id: "proyekto", label: "town.projects", badge: String(projects.length), panel: projects.length ? (
      <div className="space-y-8">
        <Donut slices={slices} format={fmtPeso} centerLabel="town.totalcost" />
        <DataTable caption={`Mga proyekto ng DPWH sa ${m.name}`} filterKey="title" rows={[...projects].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).slice(0, 25).map((p) => ({ title: p.title, status: p.status ?? null, year: p.year ?? null, cost: p.cost ?? null }))} cols={[{ key: "title", label: "table.project" }, { key: "status", label: "table.status" }, { key: "year", label: "table.year" }, { key: "cost", label: "table.cost", align: "right", format: "peso" }]} />
      </div>
    ) : <p className="text-sm text-black/60"><T k="town.noproj" /></p> },
    { id: "pulitika", label: "town.elections", panel: mayors.length ? <div className="max-w-md"><p className="mb-4 text-sm font-semibold"><T k="town.mayors" /></p><Timeline items={mayors} /><p className="mt-4 text-xs text-black/65"><Link href={`/dynasties/${slug}`} className="underline"><T k="town.fullelect" /></Link></p></div> : <p className="text-sm text-black/60"><T k="town.noelect" /></p> },
  ];

  return (
    <main>
      <DemoLangBar />
      <div className="bg-fiesta-mint">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Home", href: "/design-kit/home" }, { label: "Bayan", href: "/bayan" }, { label: m.name }]} />
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <TownEmblem slug={slug} name={m.name} className="h-24 w-24 shrink-0" capital={slug === "calapan-city"} />
            <div>
              <h1 className="font-serif text-4xl font-bold md:text-5xl">{m.name}</h1>
              <p className="mt-1 text-black/70"><T k={m.isCity ? "town.city" : "town.town"} /> · Oriental Mindoro · {m.areaKm2.toLocaleString()} km² · {getBarangays(m.pcode).length} barangay</p>
            </div>
          </div>
        </div>
      </div>
      <Divider variant="mahaltana" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section aria-label="Sa numero" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="town.pop" value={fmtInt(last?.value)} hint={last ? `Census ${last.year}` : "town.nodata"} icon="people" />
          <StatCard label="town.growth" value={growth == null ? "-" : `${growth >= 0 ? "+" : ""}${fmtPct(growth)}`} hint={pop.length > 1 ? `${pop[0].year}-${pop.at(-1)!.year}` : "town.nodata"} icon="mountain" color={FIESTA_DEEP.green} />
          <StatCard label="town.share" value={last && getProvinceStats().population.at(-1) ? fmtPct(last.value / getProvinceStats().population.at(-1)!.value) : "-"} hint="town.share.h" icon="pin" color={FIESTA_DEEP.orange} />
          <StatCard label="town.proj" value={String(projects.length)} hint="town.proj.h" icon="road" color={FIESTA.red} />
        </section>
        <div className="mt-12"><Tabs tabs={panels} /></div>
      </div>
    </main>
  );
}
