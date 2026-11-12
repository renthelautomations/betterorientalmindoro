import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import ProjectMap from "@/components/site/ProjectMapLoader";
import { PatternFill } from "@/components/kit/Patterns";
import ProjectRow from "@/components/site/ProjectRow";
import { relatedProjects } from "@/components/site/ProjectRelated";
import { Crumbs, Sec, StatusBadge, iconFor, peso, statusLook } from "@/components/site/ProjectBits";
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
  const look = statusLook(p.status);
  const related = relatedProjects(getProjects(), p);
  const names = (slug?: string) => (slug ? getMunicipality(slug)?.name : undefined);
  const card = "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5";
  const facts: [string, React.ReactNode][] = [
    ["proyekto.f.year", p.year ?? "-"],
    ["proyekto.f.bayan", m ? <Link href={`/bayan/${m.slug}`} className="underline">{m.name}</Link> : <T k="proyekto.unsure" />],
    ["proyekto.g.status", p.status ? <T k={`proyekto.st.${p.status}`} /> : "-"],
    ["proyekto.f.cat", p.category ?? "-"],
    ["proyekto.f.contractor", p.contractor ?? "-"],
    ["proyekto.r.start", p.start ? fmt(p.start) : "-"],
    ["proyekto.r.end", p.end ? fmt(p.end) : "-"],
    ["proyekto.r.duration", days != null ? <>{days.toLocaleString("en-PH")} <T k="proyekto.day" /></> : "-"],
    ["proyekto.f.id", p.id],
  ];
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Crumbs items={[{ label: "nav.projects", href: "/proyekto" }, { label: p.id }]} />
      <header className="relative isolate mt-5 overflow-hidden rounded-2xl text-white shadow-sm" style={{ background: look.color }}>
        <div className="relative h-16" aria-hidden><PatternFill variant={look.pattern} colors={["#fff"]} opacity={0.16} /></div>
        <div className="flex items-start gap-4 px-5 pb-6 pt-2 md:px-7">
          <KitIcon name={iconFor(p.category)} variant="badge" color="#1b2a4a" className="relative z-10 -mt-10 h-14 w-14 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold leading-snug md:text-3xl">{head ?? title}</h1>
            {head && <p className="mt-2 text-sm text-white">{title}</p>}
            <p className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge status={p.status} />{!m && <span className="text-sm"><T k="proyekto.unsure" /></span>}</p>
          </div>
        </div>
      </header>

      <section aria-labelledby="budget" className={`${card} mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 p-6`}>
        <KitIcon name="budget" variant="duo" color="#a63a1c" className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <h2 id="budget" className="text-xs font-semibold tracking-widest text-black/65"><T k="proyekto.stat.budget" /></h2>
          <p className="font-serif text-4xl font-bold text-[#a63a1c] md:text-5xl">{peso(p.cost)}</p>
          <p className="mt-1 text-sm text-black/70"><T k="proyekto.r.budgethint" /> <T k="uxb.proj.honesty" /></p>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="facts">
        <h2 id="facts" className="sr-only"><T k="uxb.proj.facts" /></h2>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className={`${card} min-w-0`}><dt className="text-xs font-semibold tracking-wide text-black/65"><T k={k} /></dt><dd className="mt-1 break-words font-serif text-lg font-bold text-fiesta-navy">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <Sec eyebrow="proyekto.r.time" title="proyekto.r.timeline" />
        {p.start && p.end ? (
          <div className={`${card} mt-5 p-6`}>
            <div className="h-3 rounded-full" style={{ background: look.color }} role="img" aria-label={`${fmt(p.start)} - ${fmt(p.end)}`} />
            <div className="mt-3 flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold text-black/65"><T k="proyekto.r.start" /></p><p className="font-serif text-lg font-bold">{fmt(p.start)}</p></div>
              {days != null && <p className="self-center text-center text-sm font-semibold text-black/70">{days.toLocaleString("en-PH")} <T k="proyekto.r.endsub" /></p>}
              <div className="text-right"><p className="text-xs font-semibold text-black/65"><T k="proyekto.r.end" /></p><p className="font-serif text-lg font-bold">{fmt(p.end)}</p></div>
            </div>
          </div>
        ) : (
          <p className={`${card} mt-5 text-sm text-black/70`}>- <T k="uxb.proj.undated" />. <T k="proyekto.r.nodates" /></p>
        )}
      </section>

      {hasPin && (
        <section className="mt-10">
          <div className="mb-4"><Sec eyebrow="proyekto.loc" title="proyekto.r.where" /></div>
          <ProjectMap points={[{ id: p.id, lat: p.lat!, lon: p.lon! }]} label="proyekto.r.maplabel" vars={{ lat: p.lat!.toFixed(4), lon: p.lon!.toFixed(4) }} />
          <p className="mt-2 text-sm text-black/70"><T k="proyekto.r.coords" />: {p.lat!.toFixed(5)}, {p.lon!.toFixed(5)}</p>
        </section>
      )}

      <section className="mt-10">
        <Sec eyebrow="proyekto.r.detail" title="proyekto.r.detail.h" />
        <dl className={`${card} mt-5 grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr]`}><dt className="text-sm text-black/70"><T k="proyekto.r.orig" /></dt><dd className="min-w-0 break-words text-sm">{p.title}</dd></dl>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <Sec eyebrow="uxb.proj.relatedeyebrow" title="uxb.proj.related" />
          <p className="mt-3 text-sm text-black/70"><T k="uxb.proj.relatedhint" /></p>
          <ul className="mt-4 grid auto-rows-fr gap-3">
            {related.map((r) => (
              <li key={r.id} className="min-w-0"><ProjectRow id={r.id} title={r.title} bayan={names(r.municipality)} year={r.year} status={r.status} cost={r.cost} category={r.category} /></li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-sm text-black/70"><T k="proyekto.r.source" /> <Link href="/proyekto" className="underline"><T k="proyekto.r.back" /></Link>.</p>
    </main>
  );
}
