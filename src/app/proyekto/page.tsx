import TownEmblem from "@/components/kit/TownEmblem";
import SplitSticky from "@/components/site/SplitSticky";
import BigDonut from "@/components/site/BigDonut";
import { Suspense } from "react";
import KitIcon from "@/components/kit/KitIcon";
import type { Metadata } from "next";
import Link from "next/link";
import ProjectCard from "@/components/site/ProjectCard";
import ProjectMap from "@/components/site/ProjectMapLoader";
import { Empty, PHead, Sec, Stat, YearBars, pesoShort } from "@/components/site/ProjectBits";
import { SearchInput, TopTable } from "@/components/site/ProjectClient";
import { T } from "@/lib/i18n/i18n";
import { getMunicipalities } from "@/lib/municipalities";
import { cleanTitle, costBy, countsByStatus, countsByYear, filterProjects, getProjects, hubHref, topByCost, topCategories } from "@/lib/projects";

export const metadata: Metadata = { title: "Proyekto", description: "Mga proyekto ng DPWH sa Oriental Mindoro: halaga ayon sa dokumento, katayuan, at lokasyon." };

const PAGE = 20;
type SP = { [k: string]: string | string[] | undefined };
type F = { bayan?: string; taon?: string; katayuan?: string; kategorya?: string; q?: string; page?: number };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default function Proyekto({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl px-4 py-10"><PHead crumbs={[{ label: "proyekto.home", href: "/" }, { label: "nav.projects" }]} eyebrow="proyekto.eyebrow" title="proyekto.title" /></main>}>
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
  const slices = costBy(rows, "status", "proyekto.nostatus");
  const top = topByCost(rows, 10).map((p) => ({ title: cleanTitle(p.title), year: p.year ?? null, cost: p.cost ?? null }));
  const years = countsByYear(all).map(([y]) => y);
  const statuses = countsByStatus(all).map(([s]) => s);
  const cats = topCategories(all, 5);
  const filtered = Boolean(f.bayan || f.taon || f.katayuan || f.kategorya || f.q);
  const link = (patch: F) => hubHref({ ...f, ...patch });

  const group = (label: string, key: "bayan" | "taon" | "katayuan" | "kategorya", items: { v: string; t: string }[]) => (
    <div role="group" aria-labelledby={`g-${key}`}>
      <p id={`g-${key}`} className="mb-2 text-xs font-semibold uppercase tracking-widest text-black/60"><T k={label} /></p>
      <div className="flex flex-wrap gap-2">
        <Chip href={link({ [key]: undefined })} on={!f[key]}><T k="proyekto.all" /></Chip>
        {items.map((i) => <Chip key={i.v} href={link({ [key]: f[key] === i.v ? undefined : i.v })} on={f[key] === i.v}>{key === "bayan" && <TownEmblem slug={i.v} name="" className="mr-2 -ml-1.5 h-6 w-6 rounded-md" capital={i.v === "calapan-city"} />}{i.t}</Chip>)}
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <PHead crumbs={[{ label: "proyekto.home", href: "/" }, { label: "nav.projects" }]} eyebrow="proyekto.eyebrow" title="proyekto.title">
        <p><T k="proyekto.lede" /></p>
      </PHead>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="proyekto.stat.count" value={rows.length.toLocaleString("en-PH")} hint={<T k={filtered ? "proyekto.stat.filtered" : "proyekto.stat.all"} />} icon="doc" color="#2b4fa3" />
        <Stat label="proyekto.stat.budget" value={pesoShort(total)} hint={<T k="proyekto.stat.budgethint" />} icon="budget" color="#a63a1c" />
        <Stat label="proyekto.stat.done" value={withStatus ? `${Math.round((done / withStatus) * 100)}%` : "-"} hint={<>{done.toLocaleString("en-PH")} <T k="proyekto.of" /> {withStatus.toLocaleString("en-PH")} <T k="proyekto.stat.withstatus" /></>} icon="check" color="#1f6b3a" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="min-w-0">
          <div className="mb-3"><Sec eyebrow="proyekto.loc" title="proyekto.map.h" /></div>
          {points.length ? <ProjectMap points={points} label="proyekto.map.label" vars={{ n: points.length }} /> : <p className="rounded-2xl bg-black/5 p-6 text-sm text-black/70"><T k="proyekto.map.none" /></p>}
          <p className="mt-2 text-sm text-black/70">{points.length.toLocaleString("en-PH")} <T k="proyekto.map.onmap" /> {listOnly.toLocaleString("en-PH")} <T k="proyekto.map.listonly" /> <T k="proyekto.map.note" /></p>
        </section>
        <section className="min-w-0">
          <div className="mb-3"><Sec eyebrow="proyekto.peryear" title="proyekto.peryear.h" /></div>
          <YearBars rows={countsByYear(filterProjects(all, flt)).map(([y, n]) => ({ y, n, on: year === y, href: link({ taon: year === y ? undefined : String(y) }) }))} />
        </section>
      </div>

      <section className="mt-12">
        <SplitSticky
          side={
            <div>
              <Sec eyebrow="proyekto.bystatus" title="proyekto.bystatus.h" />
              <div className="mt-4">{slices.length ? <BigDonut slices={slices} format={pesoShort} centerLabel="proyekto.center" /> : <Empty title="proyekto.nobudget"><T k="proyekto.nobudget.d" /></Empty>}</div>
              <p className="mt-3 text-xs text-black/65"><T k="proyekto.bystatus.note" /></p>
            </div>
          }
        >
          <Sec eyebrow="proyekto.biggest" title="proyekto.top.h" />
          <div className="mt-4">{top.length ? <TopTable rows={top} /> : <Empty title="proyekto.noval"><T k="proyekto.noval.d" /></Empty>}</div>
        </SplitSticky>
      </section>

      <section aria-labelledby="salain" className="mt-12 space-y-5">
        <h2 id="salain" className="font-serif text-3xl font-bold"><T k="proyekto.filter" /></h2>
        <form action="/proyekto" method="get" role="search" className="flex flex-wrap gap-2">
          {(["bayan", "taon", "katayuan", "kategorya"] as const).map((k) => f[k] && <input key={k} type="hidden" name={k} value={f[k]} />)}
          <SearchInput defaultValue={f.q} />
          <button className="min-h-11 rounded-lg bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue"><T k="proyekto.search" /></button>
          {filtered && <Link href="/proyekto" className="inline-flex min-h-11 items-center px-3 text-sm underline"><T k="proyekto.clear" /></Link>}
        </form>
        {group("proyekto.g.bayan", "bayan", munis.map((m) => ({ v: m.slug, t: m.name })))}
        {group("proyekto.g.taon", "taon", years.map((y) => ({ v: String(y), t: String(y) })))}
        {group("proyekto.g.status", "katayuan", statuses.map((s) => ({ v: s, t: s })))}
        {group("proyekto.g.cat", "kategorya", cats.map((c) => ({ v: c, t: c })))}
      </section>

      <section aria-labelledby="lista" className="mt-12">
        <h2 id="lista" className="font-serif text-3xl font-bold"><T k="proyekto.list.h" /></h2>
        <p className="mt-1 text-sm text-black/70"><T k="proyekto.showing" /> {shown.length.toLocaleString("en-PH")} <T k="proyekto.of" /> {rows.length.toLocaleString("en-PH")}<T k="proyekto.showing.tail" /></p>
        {shown.length ? (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {shown.map((p) => (
              <li key={p.id} className="min-w-0"><ProjectCard id={p.id} title={p.title} bayan={p.municipality ? names[p.municipality] : undefined} year={p.year} status={p.status} cost={p.cost} category={p.category} /></li>
            ))}
          </ul>
        ) : (
          <div className="mt-4"><Empty title="proyekto.nomatch"><T k="proyekto.nomatch.d1" /> <Link href="/proyekto" className="underline"><T k="proyekto.nomatch.d2" /></Link>.</Empty></div>
        )}
        {shown.length < rows.length && (
          <p className="mt-5"><Link href={link({ page: page + 1 })} scroll={false} className="inline-flex min-h-11 items-center rounded-lg border-2 border-fiesta-navy px-5 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white"><T k="proyekto.more" /> ({Math.min(PAGE, rows.length - shown.length)} <T k="proyekto.more.n" />)</Link></p>
        )}
      </section>

      <section className="mt-12">
        <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
          <details className="group px-5">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden"><T k="proyekto.how.q" /><KitIcon name="arrow" className="h-5 w-5 shrink-0 rotate-90 text-fiesta-blue transition group-open:-rotate-90" /></summary>
            <div className="pb-5 text-sm leading-relaxed text-black/75">
              <ul className="list-disc space-y-2 pl-5">
                <li><T k="proyekto.how.1" /></li>
                <li><T k="proyekto.how.2" /></li>
                <li><T k="proyekto.how.3" /></li>
                <li><T k="proyekto.how.4" /></li>
              </ul>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
