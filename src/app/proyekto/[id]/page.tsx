import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/kit/Ui";
import { StatCard } from "@/components/kit/Parts";
import KitIcon from "@/components/kit/KitIcon";
import ProjectMap from "@/components/site/ProjectMapLoader";
import { StatusBadge, iconFor, peso } from "@/components/site/ProjectBits";
import { getMunicipality } from "@/lib/municipalities";
import { cleanTitle, durationDays, getProject, getProjects } from "@/lib/projects";

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
          <h1 className="font-serif text-2xl font-bold leading-snug md:text-3xl">{title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status={p.status} />{!m && <span className="text-sm text-black/70">Hindi tiyak ang bayan</span>}</p>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="PUBLISHED NA BUDGET" value={peso(p.cost)} hint="Budget ayon sa dokumento, hindi aktwal na gastos." icon="budget" color="#a63a1c" />
        <StatCard label={days != null ? "TAGAL" : "TAON AT KATAYUAN"} value={days != null ? `${days.toLocaleString("en-PH")} araw` : `${p.year ?? "-"}`} hint={days != null ? "mula simula hanggang katapusan, ayon sa dokumento" : (p.status ?? "Walang katayuan") + ". Walang petsa ng simula at katapusan."} icon="calendar" color="#2b4fa3" />
      </div>

      {p.start && p.end && (
        <section aria-labelledby="oras" className="mt-8">
          <h2 id="oras" className="text-sm font-semibold tracking-widest text-black/60">TIMELINE</h2>
          <div className="mt-3 rounded-2xl border border-black/10 bg-white p-5">
            <div className="relative h-3 rounded-full bg-fiesta-blue/15" aria-hidden>
              <span className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-fiesta-navy" />
              <span className="absolute inset-y-0 left-0 right-0 m-auto h-1.5 rounded-full bg-fiesta-blue" />
              <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-fiesta-green" />
            </div>
            <dl className="mt-3 flex justify-between gap-4 text-sm">
              <div><dt className="text-black/70">Simula</dt><dd className="font-semibold">{fmt(p.start)}</dd></div>
              <div className="text-right"><dt className="text-black/70">Katapusan</dt><dd className="font-semibold">{fmt(p.end)}</dd></div>
            </dl>
          </div>
        </section>
      )}

      {hasPin && (
        <section aria-labelledby="lokasyon" className="mt-8">
          <h2 id="lokasyon" className="mb-3 text-sm font-semibold tracking-widest text-black/60">LOKASYON</h2>
          <ProjectMap points={[{ id: p.id, lat: p.lat!, lon: p.lon! }]} label={`Mapa na nagpapakita ng lokasyon ng proyekto sa ${p.lat!.toFixed(4)}, ${p.lon!.toFixed(4)}`} />
          <p className="mt-2 text-sm text-black/70">Coordinates: {p.lat!.toFixed(5)}, {p.lon!.toFixed(5)}</p>
        </section>
      )}

      <section aria-labelledby="detalye" className="mt-8">
        <h2 id="detalye" className="text-sm font-semibold tracking-widest text-black/60">DETALYE</h2>
        <dl className="mt-3 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
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
