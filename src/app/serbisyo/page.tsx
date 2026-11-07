import type { Metadata } from "next";
import Link from "next/link";
import SiteSearch from "@/components/kit/SiteSearch";
import { EmptyState } from "@/components/kit/Ui";
import PageHead from "@/components/site/PageHead";
import { ServiceLink } from "@/components/site/ServiceLink";
import { getSearchItems } from "@/lib/search-index";
import { getCategories, getLifeEvents, getServices, servicesForEvent } from "@/lib/services";

export const metadata: Metadata = { title: "Serbisyo", description: "Mga serbisyo ng gobyerno sa Oriental Mindoro: kailangan, bayad, hakbang at opisina, may source bawat isa." };

const H2 = "mb-4 font-serif text-2xl font-bold";

export default function Serbisyo() {
  const cats = getCategories();
  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-8">
      <PageHead crumbs={[{ label: "Home", href: "/" }, { label: "Serbisyo" }]} eyebrow="PARA SA BAYAN" title="Mga serbisyo">
        <p>Alamin kung ano ang kailangan, magkano, at saan pupunta. Bawat entry ay may link sa opisyal na source at petsa ng huling tingin.</p>
        <p className="text-sm text-black/70">Lahat ay <b>draft para sa review ng volunteers</b>. Kapag walang nakumpirmang detalye, nakasulat na &quot;Alamin sa opisina&quot;. Hindi ito opisyal na website ng gobyerno.</p>
      </PageHead>
      <div className="mt-8"><SiteSearch items={getSearchItems()} /></div>

      <section aria-labelledby="events" className="mt-12">
        <h2 id="events" className={H2}>Ano ang nangyayari sa buhay mo?</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {getLifeEvents().map((e) => (
            <li key={e.slug} className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-serif text-lg font-bold">{e.name}</h3>
              <p className="text-sm text-black/65">{e.blurb}</p>
              <ul className="mt-3 space-y-1">
                {servicesForEvent(e.slug).map((s) => (
                  <li key={s.id}><Link href={`/serbisyo/${s.category}/${s.id}`} className="inline-flex min-h-11 items-center text-sm font-medium text-fiesta-blue underline">{s.title}</Link></li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Mga kategorya" className="mt-12">
        <ul className="flex flex-wrap gap-2">
          {cats.map((c) => <li key={c.slug}><a href={`#${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-fiesta-navy/20 px-4 text-sm font-semibold hover:border-fiesta-navy">{c.name}</a></li>)}
        </ul>
      </nav>

      {cats.map((c) => {
        const rows = getServices(c.slug);
        return (
          <section key={c.slug} id={c.slug} aria-labelledby={`h-${c.slug}`} className="mt-12 scroll-mt-28">
            <h2 id={`h-${c.slug}`} className={H2}>{c.name}</h2>
            <p className="-mt-2 mb-4 text-sm text-black/70">{c.blurb}</p>
            {rows.length ? (
              <ul className="space-y-3">{rows.map((s) => <li key={s.id}><ServiceLink s={s} /></li>)}</ul>
            ) : (
              <EmptyState title="Wala pang naka-lista">
                Wala pa kaming nakukumpirmang opisyal na source para dito. May alam ka bang source? Ipaalam sa aming volunteers. Para sa emergency, tingnan ang <Link href="/hotlines" className="underline">mga hotline</Link>.
              </EmptyState>
            )}
          </section>
        );
      })}
    </main>
  );
}
