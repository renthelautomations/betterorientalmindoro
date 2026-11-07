import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadyetNotes, GaaBars, NO_SPEND, ProportionBar, VersionsPair, repLink } from "@/components/site/BadyetDistrict";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import { Accordion, Breadcrumbs } from "@/components/kit/Ui";
import PageTitle from "@/components/site/PageTitle";
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
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Badyet", href: "/badyet" }, { label: d.label }]} />
      <div className="mt-4"><PageTitle eyebrow="BADYET" title={d.label} /></div>
      <p className="mt-3 text-sm text-black/75">Kinatawan ng distrito: {repLink(d)}</p>
      <p className="mt-3 font-semibold">{NO_SPEND}</p>

      {d.offices.map((o) => (
        <section key={o.id} aria-label={o.name} className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-serif text-xl font-bold">{o.name}</h2>
          <p className="text-sm text-black/70">{o.kind_label} · {o.tier_text}</p>
          <h3 className={H}>FY2027: DALAWANG BERSYON NG IISANG BUDGET</h3>
          <div className="mt-2"><VersionsPair o={o} /></div>
          <h3 className={H}>ANO ANG NAGBAGO: BILANG NG LINYA NG BUDGET</h3>
          <div className="mt-2"><ProportionBar o={o} /></div>
          <h3 className={H}>ENACTED NA BUDGET (GAA) 2020-2026</h3>
          <div className="mt-2"><GaaBars o={o} /></div>
          <p className="mt-2 text-xs text-black/65">Buong opisina, ayon sa nakalathala. Hindi ito ang aktwal na nagastos. Ang &quot;-&quot; ay walang datos, hindi zero.</p>
        </section>
      ))}

      <div className="mt-8"><Accordion items={[{ q: "Mga paalala at paliwanag", a: <BadyetNotes districts={[d]} /> }]} /></div>

      <SourceNote>
        Data mula sa BetterGov Budget API, kinuha noong {meta.built_at.slice(0, 10)}. Malaya at hindi opisyal ang pahinang ito (independent and unofficial); hindi ito ang talaan ng budget department. Pangalan ng kinatawan: House of Representatives of the Philippines.
      </SourceNote>
      <div className="mt-3 flex flex-wrap gap-2">
        <SourceLink href={d.url} icon="database">Distrito sa BetterGov Budget</SourceLink>
        {d.offices.map((o) => <SourceLink key={o.id} href={o.projects_url} icon="database">Mga proyekto ng {o.name}</SourceLink>)}
        <SourceLink href={d.representative.profile_url} icon="book">Profile sa House</SourceLink>
        <SourceLink href={meta.source_repo} icon="github">Source repo</SourceLink>
        <SourceLink href="https://lgu.bettergov.ph/BUDGET_GUIDE.html" icon="compass">Gabay</SourceLink>
      </div>
      <p className="mt-6 text-sm"><Link className="font-medium text-fiesta-blue underline" href="/badyet">Bumalik sa Badyet</Link></p>
    </main>
  );
}
