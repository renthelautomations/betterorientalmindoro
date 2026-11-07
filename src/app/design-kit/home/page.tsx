import type { Metadata } from "next";
import Link from "next/link";
import { HeroBg, Divider } from "@/components/kit/Motifs";
import { Button, PillarCard, StatCard, ServiceRow } from "@/components/kit/Parts";
import { BarChart, Choropleth } from "@/components/kit/Charts";
import SiteSearch, { type SearchItem } from "@/components/kit/SiteSearch";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import type { KitIconName } from "@/components/kit/KitIcon";
import { getMunicipalities } from "@/lib/municipalities";
import { getProvinceStats, getStats, fmtInt } from "@/lib/stats";
import { getHotlines } from "@/lib/hotlines";
import { getProjectStats } from "@/lib/projects";
import { getCategories, getServices } from "@/lib/services";
import { SITE } from "@/lib/brand";
import { T } from "@/lib/i18n/i18n";
import { DemoLangBar } from "@/components/kit/Layout";

export const metadata: Metadata = { title: "Home template (draft)", robots: { index: false } };

const CAT_ICON: Record<string, KitIconName> = { certificates: "doc", business: "budget", social: "people", health: "health", taxation: "budget", agriculture: "farm" };

export default function HomeTemplate() {
  const towns = getMunicipalities().map((m) => ({ ...m, pop: getStats(m.slug)?.population.at(-1)?.value ?? null }));
  const prov = getProvinceStats().population.at(-1);
  const search: SearchItem[] = [
    ...towns.map((t) => ({ type: "bayan" as const, title: t.name, sub: t.isCity ? "Lungsod" : "Bayan", href: `/bayan/${t.slug}` })),
    ...getServices().map((s) => ({ type: "serbisyo" as const, title: s.title, sub: s.summary, href: `/serbisyo/${s.category}/${s.id}` })),
    ...getHotlines().map((h) => ({ type: "hotline" as const, title: h.name, sub: h.number, href: "tel:" + h.number.replace(/[^\d+]/g, "") })),
  ];
  return (
    <main>
      <DemoLangBar />
      <HeroBg variant="banners">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 md:pb-24 md:pt-20">
          <p className="text-sm font-semibold tracking-[0.2em] text-fiesta-blue">MAHALTANA</p>
          <h1 className="mt-3 max-w-xl font-serif text-4xl font-bold leading-tight md:text-6xl">{SITE.tagline}</h1>
          <p className="mt-5 max-w-lg text-lg text-black/70"><T k="home.p" /></p>
          <div className="mt-8"><SiteSearch items={search} /></div>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/serbisyo"><Button variant="pill" icon="arrow"><T k="home.btn.services" /></Button></Link><Link href="/hotlines"><Button variant="outline" icon="phone"><T k="home.btn.hotlines" /></Button></Link></div>
        </div>
      </HeroBg>
      <Divider variant="mahaltana" />

      <div className="mx-auto max-w-6xl px-4">
        <section aria-label="Sa numero" className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="home.towns" value={String(towns.length)} hint="home.towns.h" icon="pin" />
          <StatCard label="home.pop" value={fmtInt(prov?.value)} hint={`Census ${prov?.year ?? ""}`} icon="people" color={FIESTA_DEEP.orange} />
          <StatCard label="home.hotlines" value={String(getHotlines().length)} hint="home.hotlines.h" icon="phone" color={FIESTA.red} />
          <StatCard label="home.projects" value={fmtInt(getProjectStats().total)} hint="home.projects.h" icon="road" color={FIESTA_DEEP.green} />
        </section>

        <section aria-label="MaHalTaNa" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/ma"><PillarCard short="Ma" name="Mangyan" blurb="Kultura at tradisyon." color={FIESTA.blue} pattern="ikat" /></Link>
          <Link href="/hal"><PillarCard short="Hal" name="Mount Halcon" blurb="Ang bundok ng lalawigan." color={FIESTA_DEEP.green} pattern="peaks" /></Link>
          <Link href="/ta"><PillarCard short="Ta" name="Tamaraw" blurb="Tanging sa Mindoro." color={FIESTA.red} pattern="horns" /></Link>
          <Link href="/na"><PillarCard short="Na" name="Naujan Lake" blurb="Ang pinakamalaking lawa." color={FIESTA_DEEP.sky} pattern="wave" /></Link>
        </section>

        <section aria-label="Para sa bayan" className="py-14">
          <h2 className="font-serif text-3xl font-bold"><T k="home.services" /></h2>
          <div className="mt-2 h-1 w-16 rounded-full bg-fiesta-orange" />
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {getCategories().map((c, i) => <Link key={c.slug} href={`/serbisyo/${c.slug}`} className="block min-w-0"><ServiceRow icon={CAT_ICON[c.slug] ?? "doc"} title={c.name} sub={c.blurb} color={[FIESTA.blue, FIESTA.orange, FIESTA.green, FIESTA.red][i % 4]} /></Link>)}
          </div>
        </section>

        <section aria-label="Populasyon" className="border-t border-black/10 py-14">
          <h2 className="font-serif text-3xl font-bold"><T k="home.popchart" /></h2>
          <div className="mt-2 h-1 w-16 rounded-full bg-fiesta-blue" />
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <BarChart rows={towns.filter((t) => t.pop != null).map((t) => ({ label: t.name, value: t.pop as number, href: `/bayan/${t.slug}` }))} format={fmtInt} />
            <Choropleth rows={towns.map((t) => ({ pcode: t.pcode, name: t.name, value: t.pop, href: `/bayan/${t.slug}` }))} format={fmtInt} unit="population" />
          </div>
        </section>
      </div>
    </main>
  );
}
