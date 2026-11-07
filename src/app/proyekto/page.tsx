import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, EmptyState } from "@/components/kit/Ui";
import { StatCard } from "@/components/kit/Parts";
import ProjectCard from "@/components/site/ProjectCard";
import ProjectMap from "@/components/site/ProjectMapLoader";
import { YearBars, pesoShort } from "@/components/site/ProjectBits";
import { getMunicipalities } from "@/lib/municipalities";
import { cleanTitle, countsByStatus, countsByYear, filterProjects, getProjects, hubHref, topCategories } from "@/lib/projects";

export const metadata: Metadata = { title: "Proyekto", description: "Mga proyekto ng DPWH sa Oriental Mindoro: halaga ayon sa dokumento, katayuan, at lokasyon." };

const PAGE = 20;
type SP = { [k: string]: string | string[] | undefined };
type F = { bayan?: string; taon?: string; katayuan?: string; kategorya?: string; q?: string; page?: number };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default function Proyekto({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl px-4 py-10"><h1 className="font-serif text-3xl font-bold">Mga proyekto ng DPWH</h1></main>}>
      <Hub searchParams={searchParams} />
    </Suspense>
  );
}

function Chip({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={on ? "true" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${on ? "border-fiesta-navy bg-fiesta-navy text-white" : "border-black/25 bg-white hover:bg-fiesta-mint"}`}>
      {children}
    </Link>
  );
}

async function Hub({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = getProjects();
  const munis = getMunicipalities();
  const names = Object.fromEntries(munis.map((m) => [m.slug, m.name]));
  const f: F = { bayan: one(sp.bayan), taon: one(sp.taon), katayuan: one(sp.katayuan), kategorya: one(sp.kategorya), q: one(sp.q)?.slice(0, 80) };
  const page = Math.max(1, Math.min(Number(one(sp.page)) || 1, 200));
  const year = f.taon && /^\d{4}$/.test(f.taon) ? Number(f.taon) : undefined;
  const flt = { bayan: f.bayan, status: f.katayuan, category: f.kategorya, q: f.q };
  const rows = filterProjects(all, { ...flt, year });
  const sorted = [...rows].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
  const shown = sorted.slice(0, page * PAGE);

  const total = rows.reduce((s, p) => s + (p.cost ?? 0), 0);
  const withStatus = rows.filter((p) => p.status).length;
  const done = rows.filter((p) => p.status === "Completed").length;
  const points = rows.filter((p) => p.lat != null && p.lon != null).map((p) => ({ id: p.id, lat: p.lat!, lon: p.lon! }));
  const listOnly = rows.length - points.length;
  const years = countsByYear(all).map(([y]) => y);
  const statuses = countsByStatus(all).map(([s]) => s);
  const cats = topCategories(all, 5);
  const filtered = Boolean(f.bayan || f.taon || f.katayuan || f.kategorya || f.q);
  const link = (patch: F) => hubHref({ ...f, ...patch });

  const group = (label: string, key: "bayan" | "taon" | "katayuan" | "kategorya", items: { v: string; t: string }[]) => (
    <div role="group" aria-label={label}>
      <p className="mb-2 text-xs font-semibold tracking-widest text-black/60">{label.toUpperCase()}</p>
      <div className="flex flex-wrap gap-2">
        <Chip href={link({ [key]: undefined })} on={!f[key]}>Lahat</Chip>
        {items.map((i) => <Chip key={i.v} href={link({ [key]: f[key] === i.v ? undefined : i.v })} on={f[key] === i.v}>{i.t}</Chip>)}
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Mga proyekto ng DPWH</h1>
      <p className="mt-2 max-w-2xl text-black/75">Ano ang itinayo at magkano ang nakasulat na budget, bayan por bayan, mula sa pampublikong datos.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="BILANG NG PROYEKTO" value={rows.length.toLocaleString("en-PH")} hint={filtered ? "ayon sa napiling filter" : "sa buong lalawigan"} icon="doc" color="#2b4fa3" />
        <StatCard label="PUBLISHED NA BUDGET" value={pesoShort(total)} hint="Halaga sa dokumento. Hindi ito ang aktwal na nagastos." icon="budget" color="#a63a1c" />
        <StatCard label="KUMPLETO NA" value={withStatus ? `${Math.round((done / withStatus) * 100)}%` : "-"} hint={`${done.toLocaleString("en-PH")} sa ${withStatus.toLocaleString("en-PH")} proyektong may katayuan`} icon="check" color="#1f6b3a" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="mapa" className="min-w-0">
          <h2 id="mapa" className="mb-2 text-sm font-semibold tracking-widest text-black/60">MAPA NG MGA PROYEKTO</h2>
          {points.length ? <ProjectMap points={points} label={`Mapa ng ${points.length} proyekto ayon sa coordinates`} /> : <p className="rounded-2xl bg-black/5 p-6 text-sm text-black/70">Walang coordinates ang mga napiling proyekto.</p>}
          <p className="mt-2 text-sm text-black/70">{points.length.toLocaleString("en-PH")} proyekto ang nasa mapa. {listOnly.toLocaleString("en-PH")} projects are list-only (no coordinates). Ang mga punto ay nasa totoong coordinates, kahit hindi tiyak ang bayan.</p>
        </section>
        <section aria-labelledby="taon" className="min-w-0">
          <h2 id="taon" className="mb-3 text-sm font-semibold tracking-widest text-black/60">PROYEKTO KADA TAON</h2>
          <YearBars rows={countsByYear(filterProjects(all, flt))} current={year} href={(y) => link({ taon: y ? String(y) : undefined })} />
        </section>
      </div>

      <section aria-labelledby="salain" className="mt-10 space-y-5">
        <h2 id="salain" className="text-sm font-semibold tracking-widest text-black/60">SALAIN</h2>
        <form action="/proyekto" method="get" role="search" className="flex flex-wrap gap-2">
          {(["bayan", "taon", "katayuan", "kategorya"] as const).map((k) => f[k] && <input key={k} type="hidden" name={k} value={f[k]} />)}
          <label className="min-w-0 flex-1 basis-60"><span className="sr-only">Hanapin sa pamagat</span>
            <input name="q" defaultValue={f.q} placeholder="Hanapin sa pamagat, hal. bridge" className="min-h-11 w-full rounded-lg border border-black/25 bg-white px-3 text-sm outline-none focus:border-fiesta-blue focus:ring-2 focus:ring-fiesta-blue/25" /></label>
          <button className="min-h-11 rounded-lg bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue">Hanapin</button>
          {filtered && <Link href="/proyekto" className="inline-flex min-h-11 items-center px-3 text-sm underline">Alisin lahat ng filter</Link>}
        </form>
        {group("Bayan", "bayan", munis.map((m) => ({ v: m.slug, t: m.name })))}
        {group("Taon", "taon", years.map((y) => ({ v: String(y), t: String(y) })))}
        {group("Katayuan", "katayuan", statuses.map((s) => ({ v: s, t: s })))}
        {group("Kategorya", "kategorya", cats.map((c) => ({ v: c, t: c })))}
      </section>

      <section aria-labelledby="lista" className="mt-10">
        <h2 id="lista" className="text-sm font-semibold tracking-widest text-black/60">MGA PROYEKTO, PINAKAMALAKI MUNA</h2>
        <p className="mt-1 text-sm text-black/70">Ipinapakita ang {shown.length.toLocaleString("en-PH")} sa {rows.length.toLocaleString("en-PH")}, ayon sa published na budget.</p>
        {shown.length ? (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {shown.map((p) => (
              <li key={p.id} className="min-w-0"><ProjectCard id={p.id} title={cleanTitle(p.title)} bayan={p.municipality ? names[p.municipality] : undefined} year={p.year} status={p.status} cost={p.cost} category={p.category} /></li>
            ))}
          </ul>
        ) : (
          <div className="mt-4"><EmptyState title="Walang tugma na proyekto">Subukan ang ibang filter o <Link href="/proyekto" className="underline">alisin ang lahat</Link>.</EmptyState></div>
        )}
        {shown.length < rows.length && (
          <p className="mt-5"><Link href={link({ page: page + 1 })} scroll={false} className="inline-flex min-h-11 items-center rounded-lg border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white">Ipakita pa ({Math.min(PAGE, rows.length - shown.length)} dagdag)</Link></p>
        )}
      </section>

      <section className="mt-10" aria-label="Paano basahin at source">
        <Accordion items={[{
          q: "Budget ito, hindi aktwal na gastos. Paano basahin & source",
          a: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Ang halaga ay ang budget na nakasulat sa dokumento ng proyekto, hindi ang nagastos.</li>
              <li>Ang bayan ay hinuhulaan mula sa coordinates at pamagat. Kapag hindi magkatugma, hindi ito inaassign at tinatawag na &quot;hindi tiyak ang bayan&quot;; hindi ito nabibilang sa alinmang bayan.</li>
              <li>Pamagat: ginawang mas madaling basahin ang orihinal na ALL-CAPS; ang orihinal ay nasa pahina ng bawat proyekto.</li>
              <li>Source: DPWH Infrastructure Transparency Dataset via BetterGov Open Data (CC0). Mga proyekto ng Mindoro Oriental DEO at nasa loob ng mga hangganan ng lalawigan lamang.</li>
            </ul>
          ),
        }]} />
      </section>
    </main>
  );
}
