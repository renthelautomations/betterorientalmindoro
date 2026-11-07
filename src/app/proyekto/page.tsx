import SplitSticky from "@/components/site/SplitSticky";
import BigDonut from "@/components/site/BigDonut";
import { Suspense } from "react";
import KitIcon from "@/components/kit/KitIcon";
import type { Metadata } from "next";
import Link from "next/link";
import Pager from "@/components/site/Pager";
import ProjectsTable from "@/components/site/ProjectsTable";
import ProjectCard from "@/components/site/ProjectCard";
import ProjectMap from "@/components/site/ProjectMapLoader";
import { Empty, PHead, Sec, Stat, YearBars, pesoShort } from "@/components/site/ProjectBits";
import { SearchInput, TopTable } from "@/components/site/ProjectClient";
import { AutoForm, Pick } from "@/components/site/FilterSelect";
import { T } from "@/lib/i18n/i18n";
import { getMunicipalities } from "@/lib/municipalities";
import { activeFilters, cleanTitle, costBy, countsByStatus, countsByYear, filterProjects, getProjects, hubHref, topByCost, topCategories } from "@/lib/projects";

export const metadata: Metadata = { title: "Proyekto", description: "Mga proyekto ng DPWH sa Oriental Mindoro: halaga ayon sa dokumento, katayuan, at lokasyon." };

const PAGE = 20;
type SP = { [k: string]: string | string[] | undefined };
type F = { bayan?: string; taon?: string; katayuan?: string; kategorya?: string; q?: string; view?: string; page?: number };
const PAGE_T = 10;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default function Proyekto({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl px-4 py-10"><PHead crumbs={[{ label: "proyekto.home", href: "/" }, { label: "nav.projects" }]} eyebrow="proyekto.eyebrow" title="proyekto.title" /></main>}>
      <Hub searchParams={searchParams} />
    </Suspense>
  );
}

async function Hub({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = getProjects();
  const munis = getMunicipalities();
  const names = Object.fromEntries(munis.map((m) => [m.slug, m.name]));
  const f: F = { bayan: one(sp.bayan), taon: one(sp.taon), katayuan: one(sp.katayuan), kategorya: one(sp.kategorya), q: one(sp.q)?.slice(0, 80), view: one(sp.view) === "table" ? "table" : undefined };
  const table = f.view === "table";
  const page = Math.max(1, Math.min(Number(one(sp.page)) || 1, 200));
  const year = f.taon && /^\d{4}$/.test(f.taon) ? Number(f.taon) : undefined;
  const flt = { bayan: f.bayan, status: f.katayuan, category: f.kategorya, q: f.q };
  const rows = filterProjects(all, { ...flt, year });
  const sorted = [...rows].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
  const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_T));
  const tp = Math.min(page, lastPage);
  const shown = table ? sorted.slice((tp - 1) * PAGE_T, tp * PAGE_T) : sorted.slice(0, page * PAGE);

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

  const chips = activeFilters(f, names);
  const chipLabel: Record<string, string> = { bayan: "proyekto.g.bayan", taon: "proyekto.g.taon", katayuan: "proyekto.g.status", kategorya: "proyekto.g.cat", q: "proyekto.g.q" };

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
        <AutoForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {f.view && <input type="hidden" name="view" value={f.view} />}
          <div className="sm:col-span-2 lg:col-span-4"><SearchInput defaultValue={f.q} /></div>
          <Pick name="bayan" label="proyekto.g.bayan" value={f.bayan} items={munis.map((m) => ({ v: m.slug, t: m.name }))} />
          <Pick name="taon" label="proyekto.g.taon" value={f.taon} items={years.map((y) => ({ v: String(y), t: String(y) }))} />
          <Pick name="katayuan" label="proyekto.g.status" value={f.katayuan} items={statuses.map((s) => ({ v: s, t: s }))} />
          <Pick name="kategorya" label="proyekto.g.cat" value={f.kategorya} items={cats.map((c) => ({ v: c, t: c }))} />
          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
            {filtered && <Link href="/proyekto" className="inline-flex min-h-11 items-center px-3 text-sm underline"><T k="proyekto.clear" /></Link>}
          </div>
        </AutoForm>
        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c.key}>
                <Link href={c.href} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-fiesta-mint px-3 text-xs font-medium text-fiesta-navy hover:bg-fiesta-navy hover:text-white">
                  <span className="text-black/60"><T k={chipLabel[c.key]} />:</span> {c.value} <span aria-hidden>×</span><span className="sr-only"><T k="proyekto.remove" /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lista" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="lista" className="font-serif text-3xl font-bold"><T k="proyekto.list.h" /></h2>
          <div role="group" aria-label="View" className="inline-flex rounded-full bg-fiesta-navy/5 p-0.5 text-sm font-semibold">
            {([["cards", "proyekto.view.cards"], ["table", "proyekto.view.table"]] as const).map(([v, k]) => (
              <Link key={v} href={link({ view: v, page: undefined })} aria-current={(v === "table") === table ? "true" : undefined} className={`inline-flex min-h-10 items-center rounded-full px-4 ${(v === "table") === table ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`}><T k={k} /></Link>
            ))}
          </div>
        </div>
        <p className="mt-1 text-sm text-black/70"><T k="proyekto.showing" /> {table && shown.length ? `${((tp - 1) * PAGE_T + 1).toLocaleString("en-PH")}–${((tp - 1) * PAGE_T + shown.length).toLocaleString("en-PH")}` : shown.length.toLocaleString("en-PH")} <T k="proyekto.of" /> {rows.length.toLocaleString("en-PH")}<T k="proyekto.showing.tail" /></p>
        {shown.length && table ? (
          <ProjectsTable rows={shown} names={names} />
        ) : shown.length ? (
          <ul className="mt-4 grid auto-rows-fr gap-3 md:grid-cols-2">
            {shown.map((p) => (
              <li key={p.id} className="h-full min-w-0"><ProjectCard id={p.id} title={p.title} bayan={p.municipality ? names[p.municipality] : undefined} year={p.year} status={p.status} cost={p.cost} category={p.category} /></li>
            ))}
          </ul>
        ) : (
          <div className="mt-4"><Empty title="proyekto.nomatch"><T k="proyekto.nomatch.d1" /> <Link href="/proyekto" className="underline"><T k="proyekto.nomatch.d2" /></Link>.</Empty></div>
        )}
        {table && <Pager page={tp} last={lastPage} href={(p) => link({ page: p })} action="/proyekto" hidden={Object.fromEntries((["bayan", "taon", "katayuan", "kategorya", "q", "view"] as const).flatMap((k) => (f[k] ? [[k, f[k]!]] : [])))} />}
        {!table && shown.length < rows.length && (
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
