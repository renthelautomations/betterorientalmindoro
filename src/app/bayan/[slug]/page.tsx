import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DynNote from "@/components/site/DynNote";
import DynSurnames from "@/components/site/DynSurnames";
import { WinnersGrid } from "@/components/site/DynGrid";
import PageTitle from "@/components/site/PageTitle";
import TownEmblem from "@/components/kit/TownEmblem";
import { StatCard } from "@/components/kit/Parts";
import { Breadcrumbs, EmptyState, HotlineCard } from "@/components/kit/Ui";
import { Tabs } from "@/components/kit/Interactive";
import LineChart from "@/components/kit/LineChart";
import { Donut } from "@/components/kit/Charts2";
import { Divider } from "@/components/kit/Motifs";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { getBarangays, getMunicipalities, getMunicipality } from "@/lib/municipalities";
import { fmtInt, fmtPct, fmtPeso, getProvinceStats, getStats, popGrowth } from "@/lib/stats";
import { hotlinesForBayan } from "@/lib/hotlines";
import ProjectRow from "@/components/site/ProjectRow";
import { getProjects } from "@/lib/projects";
import { getProvince, getTown, sharedSurnames } from "@/lib/dynasties";

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
  for (const p of projects) byStatus.set(p.status ?? "Walang status", (byStatus.get(p.status ?? "Walang status") ?? 0) + 1);
  const slices = [...byStatus].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const dyn = getTown(slug);
  const years = getProvince().elections.map((e) => e.year);
  const surnames = dyn ? sharedSurnames(dyn.contests) : [];
  const cls = stats?.incomeClass?.value;

  const panels = [
    { id: "pangkalahatan", label: "Pangkalahatan", panel: (
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className={h3}>Populasyon sa paglipas ng panahon</p>
          {pop.length ? <LineChart series={[{ name: m.name, points: pop.map((p) => ({ year: p.year, value: p.value })) }]} label="common.town" /> : <EmptyState title="Walang datos ng populasyon">Walang naitalang populasyon para sa bayang ito. Hindi ito zero.</EmptyState>}
        </div>
        <div>
        <dl className="space-y-3 text-sm">
          <div><dt className="text-black/70">Uri</dt><dd className="font-semibold">{m.isCity ? "Lungsod" : "Bayan"}{cls ? ` · ${cls}` : ""}</dd></div>
          <div><dt className="text-black/70">Kita ({stats?.revenue?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.revenue?.value)}</dd></div>
          <div><dt className="text-black/70">Gastos ({stats?.expenditure?.year ?? "-"})</dt><dd className="font-semibold">{fmtPeso(stats?.expenditure?.value)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-black/70">Pinagmulan: Wikidata / PSA / BLGF. Ang &quot;-&quot; ay nangangahulugang walang datos, hindi zero.</p>
        </div>
      </div>
    ) },
    { id: "hotlines", label: "Hotlines", badge: String(local.length + province.length), panel: (
      <div className="space-y-6">
        {local.length ? (
          <div><p className={h3}>Sa {m.name}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{local.map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div></div>
        ) : <EmptyState title={`Walang naitalang hotline ng ${m.name}`}>Walang hotline ng bayan sa aming talaan. Narito ang mga numero ng buong lalawigan.</EmptyState>}
        <div><p className={h3}>Buong lalawigan{local.length ? "" : " (para sa bayang ito)"}</p>
          {province.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{province.slice(0, 6).map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div> : <p className="text-sm text-black/70">Walang naitalang numero ng lalawigan.</p>}
        </div>
        <Link href="/hotlines" className={link}>Lahat ng hotline →</Link>
      </div>
    ) },
    { id: "proyekto", label: "Proyekto", badge: String(projects.length), panel: projects.length ? (
      <div className="space-y-6">
        <div className="max-w-md"><p className={h3}>Proyekto ng DPWH ayon sa status</p><Donut slices={slices} format={fmtInt} centerLabel="proyekto" /></div>
        <div>
          <p className={h3}>Pinakamalalaking proyekto</p>
          <ul className="space-y-3">
            {top.map((p) => <li key={p.id}><ProjectRow id={p.id} title={p.title} year={p.year} status={p.status} cost={p.cost} category={p.category} max={top[0].cost} /></li>)}
          </ul>
        </div>
        <Link href={`/proyekto?bayan=${slug}`} className={link}>Lahat ng {fmtInt(projects.length)} proyekto →</Link>
      </div>
    ) : <EmptyState title="Walang natukoy na proyekto">Walang proyekto ng DPWH na natukoy ang bayan sa dataset. Hindi ito nangangahulugang walang proyekto.</EmptyState> },
    { id: "halalan", label: "Halalan", panel: dyn ? (
      <div className="space-y-6">
        <DynNote />
        <div><p className={h3}>Mayor at Vice Mayor bawat halalan</p><WinnersGrid towns={[{ slug, name: m.name, contests: dyn.contests }]} years={years} caption={`Mga nanalong mayor at vice mayor ng ${m.name} ayon sa taon ng halalan`} /></div>
        <div><p className={h3}>Paulit-ulit na apelyido</p><DynSurnames rows={surnames} towns={[dyn]} names={{ [slug]: m.name }} /></div>
        <Link href={`/dynasties/${slug}`} className={link}>Buong datos ng halalan sa {m.name} →</Link>
      </div>
    ) : <EmptyState title="Walang datos ng halalan">Walang naitalang resulta ng halalan para sa bayang ito.</EmptyState> },
  ];

  return (
    <main>
      <div className="bg-fiesta-mint">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bayan", href: "/bayan" }, { label: m.name }]} />
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <TownEmblem slug={slug} name={m.name} className="h-24 w-24 shrink-0" capital={slug === "calapan-city"} />
            <div>
              <PageTitle eyebrow={m.isCity ? "LUNGSOD" : "BAYAN"} title={m.name} color="#8a3a18" />
              <p className="mt-3 text-black/70">Oriental Mindoro · {m.areaKm2.toLocaleString("en-PH")} km² · {getBarangays(m.pcode).length} barangay</p>
            </div>
          </div>
        </div>
      </div>
      <Divider variant="mahaltana" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section aria-label="Sa numero" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="POPULASYON" value={fmtInt(last?.value)} hint={last ? `Census ${last.year}` : "Walang datos"} icon="people" />
          <StatCard label="PAGLAGO" value={growth == null ? "-" : `${growth >= 0 ? "+" : ""}${fmtPct(growth)}`} hint={pop.length > 1 ? `${pop[0].year}-${pop.at(-1)!.year}` : "Walang datos"} icon="mountain" color={FIESTA_DEEP.green} />
          <StatCard label="BAHAGI NG LALAWIGAN" value={last && provPop ? fmtPct(last.value / provPop.value) : "-"} hint="Ng kabuuang populasyon" icon="pin" color={FIESTA_DEEP.orange} />
          <StatCard label="PROYEKTO" value={projects.length ? fmtInt(projects.length) : "-"} hint={projects.length ? "Nakalista ng DPWH" : "Walang natukoy na proyekto"} icon="road" color={FIESTA.red} />
        </section>
        <div className="mt-12"><Tabs tabs={panels} /></div>
      </div>
    </main>
  );
}
