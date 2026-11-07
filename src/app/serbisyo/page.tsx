import SplitSticky from "@/components/site/SplitSticky";
import type { Metadata } from "next";
import Link from "next/link";
import SiteSearch from "@/components/kit/SiteSearch";
import Bilingual from "@/lib/i18n/Bilingual";
import { T } from "@/lib/i18n/i18n";
import { TEmptyState, TNav, TPageHead } from "@/components/site/DynBits";
import KitIcon from "@/components/kit/KitIcon";
import { CATEGORY_ICON, ServiceLink } from "@/components/site/ServiceLink";
import { getSearchItems } from "@/lib/search-index";
import { getCategories, getLifeEvents, getServices, servicesForEvent } from "@/lib/services";

export const metadata: Metadata = { title: "Serbisyo", description: "Mga serbisyo ng gobyerno sa Oriental Mindoro: kailangan, bayad, hakbang at opisina, may source bawat isa." };

const H2 = "mb-4 font-serif text-2xl font-bold";

export default function Serbisyo() {
  const cats = getCategories();
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <TPageHead crumbs={[{ label: "dyn.home", href: "/" }, { label: "nav.services" }]} eyebrow="dyn.serbisyo.eyebrow" title="dyn.serbisyo.title">
        <p><T k="dyn.serbisyo.lead" /></p>
        <p className="text-sm text-black/70"><Bilingual
          en={<>Everything here is a <b>draft for volunteer review</b>. Where no detail is confirmed, it says &quot;Check with the office&quot;. This is not an official government website.</>}
          fil={<>Lahat ay <b>draft para sa review ng volunteers</b>. Kapag walang nakumpirmang detalye, nakasulat na &quot;Alamin sa opisina&quot;. Hindi ito opisyal na website ng gobyerno.</>} /></p>
      </TPageHead>
      <div className="mt-8"><SiteSearch items={getSearchItems()} /></div>

      <section aria-labelledby="events" className="mt-12">
        <h2 id="events" className={H2}><T k="dyn.serbisyo.events" /></h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getLifeEvents().map((e) => {
            const svcs = servicesForEvent(e.slug);
            return (
              <li key={e.slug} className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm">
                <KitIcon name={CATEGORY_ICON[svcs[0]?.category] ?? "doc"} variant="badge" color="#1b2a4a" className="h-10 w-10" />
                <h3 className="mt-3 font-serif text-lg font-bold leading-snug"><T k={`svc.ev.${e.slug}`} /></h3>
                <p className="mt-1 text-sm text-black/65"><T k={`svc.ev.${e.slug}.b`} /></p>
                <ul className="mt-3 flex flex-col gap-1 border-t border-black/10 pt-2">
                  {svcs.map((s) => (
                    <li key={s.id}><Link href={`/serbisyo/${s.category}/${s.id}`} className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm font-medium text-fiesta-blue hover:bg-fiesta-mint"><KitIcon name="arrow" className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0">{s.title}</span></Link></li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <SplitSticky className="mt-12" side={<TNav label="dyn.serbisyo.cats">
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:gap-1">
          {cats.map((c) => <li key={c.slug}><a href={`#${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-fiesta-navy/20 px-4 text-sm font-semibold hover:border-fiesta-navy lg:w-full lg:rounded-xl lg:border-0 lg:hover:bg-fiesta-mint"><T k={`svc.cat.${c.slug}`} /></a></li>)}
        </ul>
      </TNav>}>
        <div>
      {cats.map((c) => {
        const rows = getServices(c.slug);
        return (
          <section key={c.slug} id={c.slug} aria-labelledby={`h-${c.slug}`} className="mt-12 scroll-mt-28 first:mt-0 lg:mt-14 lg:first:mt-0">
            <h2 id={`h-${c.slug}`} className={H2}><T k={`svc.cat.${c.slug}`} /></h2>
            <p className="-mt-2 mb-4 text-sm text-black/70"><T k={`svc.cat.${c.slug}.b`} /></p>
            {rows.length ? (
              <ul className="space-y-3">{rows.map((s) => <li key={s.id}><ServiceLink s={s} /></li>)}</ul>
            ) : (
              <TEmptyState title="dyn.serbisyo.empty">
                <T k="dyn.serbisyo.empty.p" /> <Link href="/hotlines" className="underline"><T k="dyn.serbisyo.empty.link" /></Link>.
              </TEmptyState>
            )}
          </section>
        );
      })}
        </div>
      </SplitSticky>
    </main>
  );
}
