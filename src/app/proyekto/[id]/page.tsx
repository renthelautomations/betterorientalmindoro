import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/kit/Ui";
import { SectionHeader, StatCard } from "@/components/kit/Parts";
import { Timeline } from "@/components/kit/Charts2";
import KitIcon from "@/components/kit/KitIcon";
import ProjectMap from "@/components/site/ProjectMapLoader";
import { StatusBadge, iconFor, peso } from "@/components/site/ProjectBits";
import { getMunicipality } from "@/lib/municipalities";
import { cleanTitle, durationDays, projectDigest, getProject, getProjects } from "@/lib/projects";

export function generateStaticParams() {
  return getProjects().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/proyekto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = getProject(id);
  return p ? { title: cleanTitle(p.title).slice(0, 70), description: `Proyekto ng DPWH ${p.id}${p.year ? `, ${p.year}` : ""}. Published na budget, hindi aktwal na gastos.` } : {};
}

const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export default async function ProjectRecord({ params }: PageProps<"/proyekto/[id]">) {
  const { id } = await params;
  const p = getProject(id);
  if (!p) notFound();
  const title = cleanTitle(p.title);
  const head = projectDigest(p.title).headline;
  const m = p.municipality ? getMunicipality(p.municipality) : undefined;
  const hasPin = p.lat != null && p.lon != null;
  const days = p.start && p.end ? durationDays(p.start, p.end) : undefined;
  const facts: [string, React.ReactNode][] = [
    ["Bayan", m ? <Link href={`/bayan/${m.slug}`} className="underline">{m.name}</Link> : "Hindi tiyak ang bayan"],
    ["Kategorya", p.category ?? "-"],
    ["Contractor", p.contractor ?? "-"],
    ["Taon", p.year ?? "-"],
    ["ID ng proyekto", p.id],
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Proyekto", href: "/proyekto" }, { label: p.id }]} />
      <header className="mt-5 flex items-start gap-4">
        <KitIcon name={iconFor(p.category)} variant="badge" color="#1b2a4a" className="h-12 w-12 shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold leading-snug md:text-3xl">{head ?? title}</h1>
          {head && <p className="mt-2 text-sm text-black/65">{title}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status={p.status} />{!m && <span className="text-sm text-black/70">Hindi tiyak ang bayan</span>}</p>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="PUBLISHED NA BUDGET" value={peso(p.cost)} hint="Budget ayon sa dokumento, hindi aktwal na gastos." icon="budget" color="#a63a1c" />
        <StatCard label={days != null ? "TAGAL" : "TAON AT KATAYUAN"} value={days != null ? `${days.toLocaleString("en-PH")} araw` : `${p.year ?? "-"}`} hint={days != null ? "mula simula hanggang katapusan, ayon sa dokumento" : (p.status ?? "Walang katayuan") + ". Walang petsa ng simula at katapusan."} icon="calendar" color="#2b4fa3" />
      </div>

      {p.start && p.end && (
        <section className="mt-10">
          <SectionHeader eyebrow="ORAS" title="Timeline" />
          <div className="mt-5"><Timeline items={[{ year: fmt(p.start), title: "Simula", sub: "ayon sa dokumento" }, { year: fmt(p.end), title: "Katapusan", sub: days != null ? `${days.toLocaleString("en-PH")} araw mula simula` : undefined }]} /></div>
        </section>
      )}

      {hasPin && (
        <section className="mt-10">
          <div className="mb-4"><SectionHeader eyebrow="LOKASYON" title="Nasaan ito" /></div>
          <ProjectMap points={[{ id: p.id, lat: p.lat!, lon: p.lon! }]} label={`Mapa na nagpapakita ng lokasyon ng proyekto sa ${p.lat!.toFixed(4)}, ${p.lon!.toFixed(4)}`} />
          <p className="mt-2 text-sm text-black/70">Coordinates: {p.lat!.toFixed(5)}, {p.lon!.toFixed(5)}</p>
        </section>
      )}

      <section className="mt-10">
        <SectionHeader eyebrow="DETALYE" title="Detalye ng proyekto" />
        <dl className="mt-5 divide-y divide-black/10 rounded-2xl bg-white shadow-sm">
          {facts.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-black/70">{k}</dt><dd className="min-w-0 break-words font-medium">{v}</dd></div>
          ))}
          <div className="grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-black/70">Orihinal na pamagat</dt><dd className="min-w-0 break-words text-sm">{p.title}</dd></div>
        </dl>
      </section>

      <p className="mt-8 text-sm text-black/70">Source: DPWH Infrastructure Transparency Dataset via BetterGov Open Data (CC0). Ang bayan ay hinuhulaan mula sa coordinates at pamagat. <Link href="/proyekto" className="underline">Balik sa lahat ng proyekto</Link>.</p>
    </main>
  );
}
