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
import { FIESTA } from "@/components/kit/Patterns";
import { getMunicipalities, getMunicipality, getBarangays } from "@/lib/municipalities";
import { getStats, getProvinceStats, fmtInt, fmtPeso, fmtPct, popGrowth } from "@/lib/stats";
import { getHotlines } from "@/lib/hotlines";
import { getProjects } from "@/lib/projects";
import { getTown, titleCase } from "@/lib/dynasties";

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
    { id: "pangkalahatan", label: "Pangkalahatan", panel: (
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div><p className="mb-2 text-sm font-semibold">Populasyon sa paglipas ng panahon</p><LineChart series={[{ name: m.name, points: pop.map((p) => ({ year: p.year, value: p.value })) }]} label="Bayan:" /></div>
        <dl className="space-y-3 text-sm">
          <div><dt className="text-black/60">Uri</dt><dd className="font-semibold">{m.isCity ? "Lungsod" : "Bayan"}{stats?.incomeClass ? ` · ${stats.incomeClass.value}` : ""}</dd></div>
          <div><dt className="text-black/60">Kita (taon {stats?.revenue?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.revenue?.value)}</dd></div>
          <div><dt className="text-black/60">Gastos (taon {stats?.expenditure?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.expenditure?.value)}</dd></div>
          <p className="text-xs text-black/55">Pinagmulan: Wikidata / PSA / BLGF. Ang dash ay nangangahulugang walang datos.</p>
        </dl>
      </div>
    ) },
    { id: "hotlines", label: `Hotlines (${town.length + provinceHotlines.length})`, panel: (
      <div className="space-y-6">
        {town.length > 0 && <div><p className="mb-3 text-sm font-semibold">Sa {m.name}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{town.map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div></div>}
        <div><p className="mb-3 text-sm font-semibold">Buong lalawigan</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{provinceHotlines.slice(0, 6).map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div></div>
      </div>
    ) },
    { id: "proyekto", label: `Proyekto (${projects.length})`, panel: projects.length ? (
      <div className="space-y-8">
        <Donut slices={slices} format={fmtPeso} centerLabel="kabuuang gastos" />
        <DataTable caption={`Mga proyekto ng DPWH sa ${m.name}`} filterKey="title" rows={[...projects].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).slice(0, 25).map((p) => ({ title: p.title, status: p.status ?? null, year: p.year ?? null, cost: p.cost ?? null }))} cols={[{ key: "title", label: "Proyekto" }, { key: "status", label: "Status" }, { key: "year", label: "Taon" }, { key: "cost", label: "Halaga", align: "right", format: "peso" }]} />
      </div>
    ) : <p className="text-sm text-black/60">Walang nakalistang proyekto.</p> },
    { id: "pulitika", label: "Halalan", panel: mayors.length ? <div className="max-w-md"><p className="mb-4 text-sm font-semibold">Mga nanalong mayor</p><Timeline items={mayors} /><p className="mt-4 text-xs text-black/55"><Link href={`/dynasties/${slug}`} className="underline">Buong datos ng halalan</Link></p></div> : <p className="text-sm text-black/60">Walang datos ng halalan.</p> },
  ];

  return (
    <main>
      <div className="bg-fiesta-mint">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Home", href: "/design-kit/home" }, { label: "Bayan", href: "/bayan" }, { label: m.name }]} />
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <TownEmblem slug={slug} name={m.name} className="h-24 w-24 shrink-0" capital={slug === "calapan-city"} />
            <div>
              <h1 className="font-serif text-4xl font-bold md:text-5xl">{m.name}</h1>
              <p className="mt-1 text-black/70">{m.isCity ? "Lungsod" : "Bayan"} ng Oriental Mindoro · {m.areaKm2.toLocaleString()} km² · {getBarangays(m.pcode).length} barangay</p>
            </div>
          </div>
        </div>
      </div>
      <Divider variant="mahaltana" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section aria-label="Sa numero" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="POPULASYON" value={fmtInt(last?.value)} hint={last ? `Census ${last.year}` : "Walang datos"} icon="people" />
          <StatCard label="PAGLAGO" value={growth == null ? "-" : `${growth >= 0 ? "+" : ""}${fmtPct(growth)}`} hint={pop.length > 1 ? `${pop[0].year}-${pop.at(-1)!.year}` : "Walang datos"} icon="mountain" color={FIESTA.green} />
          <StatCard label="BAHAGI NG LALAWIGAN" value={last && getProvinceStats().population.at(-1) ? fmtPct(last.value / getProvinceStats().population.at(-1)!.value) : "-"} hint="Ng kabuuang populasyon" icon="pin" color={FIESTA.orange} />
          <StatCard label="PROYEKTO" value={String(projects.length)} hint="Nakalista ng DPWH" icon="road" color={FIESTA.red} />
        </section>
        <div className="mt-12"><Tabs tabs={panels} /></div>
      </div>
    </main>
  );
}
