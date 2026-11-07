import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import ProjectMap from "@/components/site/ProjectMapLoader";
import { Crumbs, Sec, Stat, StatusBadge, Steps, iconFor, peso } from "@/components/site/ProjectBits";
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
    ["proyekto.f.bayan", m ? <Link href={`/bayan/${m.slug}`} className="underline">{m.name}</Link> : <T k="proyekto.unsure" />],
    ["proyekto.f.cat", p.category ?? "-"],
    ["proyekto.f.contractor", p.contractor ?? "-"],
    ["proyekto.f.year", p.year ?? "-"],
    ["proyekto.f.id", p.id],
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Crumbs items={[{ label: "nav.projects", href: "/proyekto" }, { label: p.id }]} />
      <header className="mt-5 flex items-start gap-4">
        <KitIcon name={iconFor(p.category)} variant="badge" color="#1b2a4a" className="h-12 w-12 shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold leading-snug md:text-3xl">{head ?? title}</h1>
          {head && <p className="mt-2 text-sm text-black/65">{title}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status={p.status} />{!m && <span className="text-sm text-black/70"><T k="proyekto.unsure" /></span>}</p>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Stat label="proyekto.stat.budget" value={peso(p.cost)} hint={<T k="proyekto.r.budgethint" />} icon="budget" color="#a63a1c" />
        <Stat label={days != null ? "proyekto.r.duration" : "proyekto.r.yearstatus"} value={days != null ? <>{days.toLocaleString("en-PH")} <T k="proyekto.day" /></> : `${p.year ?? "-"}`} hint={days != null ? <T k="proyekto.r.durhint" /> : <>{p.status ?? <T k="proyekto.nostatus" />}. <T k="proyekto.r.nodates" /></>} icon="calendar" color="#2b4fa3" />
      </div>

      {p.start && p.end && (
        <section className="mt-10">
          <Sec eyebrow="proyekto.r.time" title="proyekto.r.timeline" />
          <div className="mt-5"><Steps items={[{ when: fmt(p.start), title: "proyekto.r.start", sub: <T k="proyekto.r.startsub" /> }, { when: fmt(p.end), title: "proyekto.r.end", sub: days != null ? <>{days.toLocaleString("en-PH")} <T k="proyekto.r.endsub" /></> : undefined }]} /></div>
        </section>
      )}

      {hasPin && (
        <section className="mt-10">
          <div className="mb-4"><Sec eyebrow="proyekto.loc" title="proyekto.r.where" /></div>
          <ProjectMap points={[{ id: p.id, lat: p.lat!, lon: p.lon! }]} label="proyekto.r.maplabel" vars={{ lat: p.lat!.toFixed(4), lon: p.lon!.toFixed(4) }} />
          <p className="mt-2 text-sm text-black/70"><T k="proyekto.r.coords" />: {p.lat!.toFixed(5)}, {p.lon!.toFixed(5)}</p>
        </section>
      )}

      <section className="mt-10">
        <Sec eyebrow="proyekto.r.detail" title="proyekto.r.detail.h" />
        <dl className="mt-5 divide-y divide-black/10 rounded-2xl bg-white shadow-sm">
          {facts.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-black/70"><T k={k} /></dt><dd className="min-w-0 break-words font-medium">{v}</dd></div>
          ))}
          <div className="grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-black/70"><T k="proyekto.r.orig" /></dt><dd className="min-w-0 break-words text-sm">{p.title}</dd></div>
        </dl>
      </section>

      <p className="mt-8 text-sm text-black/70"><T k="proyekto.r.source" /> <Link href="/proyekto" className="underline"><T k="proyekto.r.back" /></Link>.</p>
    </main>
  );
}
