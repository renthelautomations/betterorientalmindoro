import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { Crumbs } from "@/components/site/ProjectBits";
import GovFlagCard from "@/components/site/GovFlagCard";
import { DocList, PriceCard, ProjectHeader, ProjectSummary, Timeline } from "@/components/site/GovProcProject";
import { card, linkPill } from "@/components/site/GovProcBits";
import { docsOfProject, getAllFlags, getCard, projectSlugs } from "@/lib/gov-proc-data";
import { flagsForProject } from "@/lib/gov-flags";

export const generateStaticParams = () => projectSlugs().map((ref) => ({ ref }));

export async function generateMetadata({ params }: PageProps<"/pamahalaan/bidding/[ref]">): Promise<Metadata> {
  const c = getCard((await params).ref);
  return c ? { title: `${c.refNo} ${c.title}`.slice(0, 70), description: `Procurement documents for ${c.refNo} on ormindoro.gov.ph. Budgets and prices as printed, not spending.` } : {};
}

export default async function BiddingProject({ params }: PageProps<"/pamahalaan/bidding/[ref]">) {
  const c = getCard((await params).ref);
  if (!c) notFound();
  const docs = docsOfProject(c.refNo);
  const flags = flagsForProject(c.refNo, getAllFlags());
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Crumbs items={[{ label: "nav.gov", href: "/pamahalaan" }, { label: "govb.crumb.bids", href: "/pamahalaan#bidding" }, { label: c.refNo }]} />
      <ProjectHeader c={c} />
      <div className="mt-4 space-y-4">
        <ProjectSummary c={c} />
        <Timeline c={c} />
        <PriceCard c={c} />
      </div>
      <section className="mt-10" aria-labelledby="docs">
        <h2 id="docs" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="govb.p.docs" /></h2>
        <div className="mt-4"><DocList docs={docs} /></div>
      </section>
      <section className="mt-10" aria-labelledby="flags">
        <h2 id="flags" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="govb.p.flags" /></h2>
        {flags.length === 0 ? <p className={`${card} mt-4 text-sm text-black/75`}><T k="govb.p.noflags" /></p> : <ul className="mt-4 space-y-3">{flags.map((f) => <li key={f.id}><GovFlagCard flag={f} /></li>)}</ul>}
        <p className="mt-3 text-sm"><Link href="/pamahalaan/mga-tala" className="font-semibold text-fiesta-blue underline underline-offset-2"><T k="govb.notes.link" /></Link></p>
      </section>
      {c.town && (
        <section className="mt-10 flex flex-wrap items-center gap-3">
          <Link href={`/proyekto?bayan=${c.town}`} className={linkPill}><T k="govb.p.dpwh" /> {c.townName}</Link>
          <Link href={`/bayan/${c.town}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2"><T k="govb.p.towninfo" /></Link>
        </section>
      )}
      <p className="mt-8 text-sm text-black/70"><T k="govb.note.short" /></p>
    </main>
  );
}
