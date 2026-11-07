import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadyetNotes, GaaBars, NO_SPEND, ProportionBar, VersionsPair, repLink } from "@/components/site/BadyetDistrict";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import { Acc, Crumbs, R, Title } from "@/components/site/FinanceBits";
import { T } from "@/lib/i18n/i18n";
import { DISTRICT_SLUGS, districtBySlug, getBadyet } from "@/lib/badyet";

export const generateStaticParams = () => DISTRICT_SLUGS.map((district) => ({ district }));

export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
  const d = districtBySlug((await params).district);
  return d ? { title: `Badyet: ${d.label}`, description: `FY2027 NEP at House bill ng ${d.label}, at enacted na budget 2020-2026. ${NO_SPEND}` } : {};
}

const H = "mt-8 text-xs font-semibold tracking-widest text-black/65";

export default async function BadyetDistrictPage({ params }: { params: Promise<{ district: string }> }) {
  const slug = (await params).district;
  const d = districtBySlug(slug);
  if (!d) notFound();
  const { meta } = getBadyet();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Crumbs items={[{ label: "finance.home", href: "/" }, { label: "nav.budget", href: "/badyet" }, { label: d.label }]} />
      <div className="mt-4"><Title eyebrow="finance.b.eyebrow" title={d.label} /></div>
      <p className="mt-3 text-sm text-black/75"><T k="finance.rep.d" /> {repLink(d)}</p>
      <p className="mt-3 font-semibold"><T k="finance.nospend" /></p>

      {d.offices.map((o) => (
        <section key={o.id} aria-label={o.name} className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-serif text-xl font-bold">{o.name}</h2>
          <p className="text-sm text-black/70">{o.kind_label} · {o.tier_text}</p>
          <h3 className={H}><T k="finance.h.versions" /></h3>
          <div className="mt-2"><VersionsPair o={o} /></div>
          <h3 className={H}><T k="finance.h.changed" /></h3>
          <div className="mt-2"><ProportionBar o={o} /></div>
          <h3 className={H}><T k="finance.h.gaa" /></h3>
          <div className="mt-2"><GaaBars o={o} /></div>
          <p className="mt-2 text-xs text-black/65"><T k="finance.gaa.note" /></p>
        </section>
      ))}

      <div className="mt-8"><Acc q="finance.notes.q"><BadyetNotes districts={[d]} /></Acc></div>

      <SourceNote>
        <R k="finance.d.src" v={[meta.built_at.slice(0, 10)]} />
      </SourceNote>
      <div className="mt-3 flex flex-wrap gap-2">
        <SourceLink href={d.url} icon="database"><T k="finance.l.district" /></SourceLink>
        {d.offices.map((o) => <SourceLink key={o.id} href={o.projects_url} icon="database"><T k="finance.l.projects" /> {o.name}</SourceLink>)}
        <SourceLink href={d.representative.profile_url} icon="book"><T k="finance.l.house" /></SourceLink>
        <SourceLink href={meta.source_repo} icon="github">Source repo</SourceLink>
        <SourceLink href="https://lgu.bettergov.ph/BUDGET_GUIDE.html" icon="compass"><T k="finance.l.guide" /></SourceLink>
      </div>
      <p className="mt-6 text-sm"><Link className="font-medium text-fiesta-blue underline" href="/badyet"><T k="finance.l.back" /></Link></p>
    </main>
  );
}
