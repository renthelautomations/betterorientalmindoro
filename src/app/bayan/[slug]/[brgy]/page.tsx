import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BayanCrumbs, BayanTitle } from "@/components/site/BayanBits";
import TownStat from "@/components/stats/TownStat";
import { Avatar } from "@/components/site/OfficialCards";
import ProjectRow from "@/components/site/ProjectRow";
import TownEmblem from "@/components/kit/TownEmblem";
import { Divider } from "@/components/kit/Motifs";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { T } from "@/lib/i18n/i18n";
import { getAllBarangays, getBarangay, getTownBarangays, projectsIn, townShapes } from "@/lib/barangays";
import { PmcCard } from "@/components/site/PmcCard";
import { pmcForBarangay } from "@/lib/pmc";
import { getBarangayOfficials } from "@/lib/barangay-officials";
import { TF } from "@/components/site/DynBits";
import { getMunicipality } from "@/lib/municipalities";
import { fmtInt, fmtPct, fmtPeso } from "@/lib/stats";

export const generateStaticParams = () => getAllBarangays().map((b) => ({ slug: b.town, brgy: b.slug }));

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]/[brgy]">): Promise<Metadata> {
  const { slug, brgy } = await params;
  const b = getBarangay(slug, brgy), m = getMunicipality(slug);
  return b && m ? { title: `${b.name}, ${m.name}`, description: `${b.name}, ${m.name}: mapa at mga proyekto ng DPWH.` } : { robots: { index: false } };
}

const link = "inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2";

export default async function Barangay({ params }: PageProps<"/bayan/[slug]/[brgy]">) {
  const { slug, brgy } = await params;
  const b = getBarangay(slug, brgy), m = getMunicipality(slug);
  if (!b || !m) notFound();
  const projects = projectsIn(b);
  const top = [...projects].sort((a, c) => (c.cost ?? 0) - (a.cost ?? 0)).slice(0, 10);
  const total = projects.reduce((s, p) => s + (p.cost ?? 0), 0);
  const siblings = getTownBarangays(slug);
  const townArea = siblings.reduce((s, x) => s + x.areaKm2, 0);
  const { shapes, P } = townShapes(slug);
  const offs = getBarangayOfficials(b.code);
  const pmcProjects = pmcForBarangay(slug, b.code);
  return (
    <main>
      <div className="bg-fiesta-mint">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
          <BayanCrumbs items={[{ label: "bayan.home", href: "/" }, { label: "nav.towns", href: "/bayan" }, { label: m.name, href: `/bayan/${slug}` }, { label: b.name, plain: true }]} />
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Link href={`/bayan/${slug}`} aria-label={m.name}><TownEmblem slug={slug} name={m.name} className="h-24 w-24 shrink-0" capital={slug === "calapan-city"} /></Link>
            <div><BayanTitle eyebrow="brg.eyebrow" title={b.name} plain />
              <p className="mt-3 text-black/70"><T k="brg.in" /> <Link href={`/bayan/${slug}`} className="font-semibold text-fiesta-blue underline underline-offset-2">{m.name}</Link> · Oriental Mindoro</p></div>
          </div>
        </div>
      </div>
      <Divider variant="mahaltana" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TownStat label="brg.area" value={b.areaKm2.toLocaleString("en-PH", { maximumFractionDigits: 2 })} hint={<T k="brg.area.h" />} icon="mountain" color={FIESTA_DEEP.green} />
          <TownStat label="brg.share" value={townArea ? fmtPct(b.areaKm2 / townArea) : "-"} hint={<T k="brg.share.h" />} icon="pin" color={FIESTA.blue} share={townArea ? b.areaKm2 / townArea : null} barLabel="uxc.vsbig" />
          <TownStat label="brg.proj" value={projects.length ? fmtInt(projects.length) : "-"} hint={<T k="brg.proj.h" />} icon="road" color={FIESTA.red} />
          <TownStat label="brg.cost" value={projects.length ? fmtPeso(total) : "-"} hint={<T k="brg.cost.h" />} icon="doc" color={FIESTA_DEEP.orange} />
        </section>
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <figure>
            <h2 className="mb-3 text-sm font-semibold"><T k="brg.map.h" /></h2>
            <p id="brg-map-cap" className="sr-only"><T k="brg.map.aria" /></p>
            <svg viewBox="0 0 320 320" className="mx-auto h-auto w-full max-w-sm rounded-2xl bg-fiesta-cream ring-1 ring-black/10" role="img" aria-labelledby="brg-map-cap">
              {shapes.map(({ b: x, d }) => x.code === b.code ? null : (
                <Link key={x.code} href={`/bayan/${slug}/${x.slug}`}><path d={d} fill={FIESTA.mint} stroke="#8fbfb1" strokeWidth="1.2" strokeLinejoin="round"><title>{x.name}</title></path></Link>
              ))}
              {shapes.filter(({ b: x }) => x.code === b.code).map(({ d }) => <path key="me" d={d} fill={FIESTA.orange} stroke={FIESTA.navy} strokeWidth="1.8" strokeLinejoin="round" />)}
              {projects.map((p) => { const [x, y] = P(p.lon!, p.lat!); return <circle key={p.id} cx={x} cy={y} r="3" fill={FIESTA.navy} stroke="#fff" strokeWidth="1" />; })}
            </svg>
          </figure>
          <div>
            <h2 className="mb-3 font-serif text-2xl font-bold text-fiesta-navy"><T k="brg.proj.list" /></h2>
            {top.length ? (
              <ul className="grid auto-rows-fr gap-3">{top.map((p) => <li key={p.id} className="h-full"><ProjectRow id={p.id} title={p.title} bayan={m.name} year={p.year} status={p.status} cost={p.cost} category={p.category} max={top[0].cost} /></li>)}</ul>
            ) : <p className="rounded-2xl bg-white p-5 text-black/75 shadow-sm ring-1 ring-black/5"><T k="brg.proj.none" /></p>}
            <p className="mt-3 text-sm text-black/70"><T k="brg.proj.note" /></p>
            <Link href={`/proyekto?bayan=${slug}`} className={link}><T k="brg.all" /> →</Link>
          </div>
        </div>
        {pmcProjects.length > 0 && (
          <section aria-labelledby="brg-pmc" className="mt-12">
            <h2 id="brg-pmc" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="pmc.brg.h" /></h2>
            <ul className="mt-4 grid gap-4 lg:grid-cols-2">{pmcProjects.map((p) => <PmcCard key={p.project + p.cost} p={p} names={Object.fromEntries(siblings.map((x) => [x.code, x.name]))} />)}</ul>
          </section>
        )}
        <section aria-labelledby="brg-off" className="mt-12">
          <h2 id="brg-off" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="brg.off.h" /></h2>
          {offs ? (
            <>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {offs.officials.map((o, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                    <Avatar name={o.name.replace(/^HON\.\s*/i, "")} color={i === 0 ? FIESTA.orange : FIESTA.navy} className="h-11 w-11 text-sm" />
                    <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-widest text-black/65">{o.position}</p><p className="font-serif text-base font-bold leading-tight text-fiesta-navy">{o.name.replace(/^HON\.\s*/i, "").replace(/\b(\w)(\w*)/g, (_: string, a: string, r: string) => a + r.toLowerCase())}</p></div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-black/70"><TF k="brg.off.src" v={[offs.fetchedAt]} /> <a href={offs.site} target="_blank" rel="noopener noreferrer" className="font-semibold text-fiesta-blue underline underline-offset-2"><T k="brg.off.site" /> ↗</a></p>
            </>
          ) : <p className="mt-3 rounded-2xl bg-fiesta-mint p-4 text-sm text-black/75"><T k="brg.off.none" /></p>}
        </section>
        <p className="mt-10 text-xs text-black/65"><T k="brg.src" /></p>
      </div>
    </main>
  );
}
