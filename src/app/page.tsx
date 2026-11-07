import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import { Divider } from "@/components/kit/Motifs";
import PennantHero from "@/components/site/PennantHero";
import { SectionHeaderT as SectionHeader, PillarCardT as PillarCard, StatCardT as StatCard, Landmark } from "@/components/site/KitT";
import { T } from "@/lib/i18n/i18n";
import SplitSticky from "@/components/site/SplitSticky";
import { BarChart } from "@/components/kit/Charts";
import LinkChoropleth from "@/components/site/LinkChoropleth";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import SmartSearch from "@/components/site/SmartSearch";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { getSearchItems } from "@/lib/search-index";
import { getMunicipalities } from "@/lib/municipalities";
import { getHotlines } from "@/lib/hotlines";
import { getProvinceStats, getStats, fmtInt } from "@/lib/stats";
import { getProjectStats } from "@/lib/projects";
import { getCategories, getServices } from "@/lib/services";
import ServiceTile from "@/components/site/ServiceTile";

const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

export default function Home() {
  const towns = getMunicipalities().map((m) => ({ ...m, pop: getStats(m.slug)?.population.at(-1)?.value ?? null }));
  const slugs = Object.fromEntries(towns.map((m) => [m.pcode, m.slug]));
  const values = Object.fromEntries(towns.map((m) => [m.pcode, m.pop ?? 0]));
  const pop = getProvinceStats().population.at(-1);
  // Only numbers confirmed against the province's published list.
  const hotlineCount = getHotlines().length;
  const hotlines = getHotlines("province").filter((h) => h.confirmed && /^(Police|Fire|Public Safety)$|Operations and Warning/.test(h.name)).slice(0, 4);
  return (
    <main>
      <PennantHero>
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 md:pb-20 md:pt-16">
          <p className="text-sm font-semibold tracking-[0.2em] text-fiesta-blue uppercase"><T k="footer.tagline" /></p>
          <h1 className="mt-3 max-w-xl font-serif text-5xl font-bold leading-[1.05] md:text-7xl">Better<br />Oriental Mindoro<span className="text-fiesta-orange">.org</span></h1>
          <p className="mt-5 max-w-lg text-lg text-black/70"><T k="home.p" /></p>
          <div className="mt-8"><SmartSearch items={getSearchItems()} /></div>
        </div>
      </PennantHero>
      <Divider variant="mahaltana" />

      <div className="mx-auto max-w-6xl px-4">
        <Landmark as="section" label="home.help.aria" className="pt-10">
          <section aria-labelledby="help-h" className="grid gap-6 rounded-3xl bg-fiesta-red/10 p-5 sm:p-7 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a8281b] text-white"><KitIcon name="alert" className="h-6 w-6" /></span>
              <h2 id="help-h" className="mt-4 font-serif text-3xl font-bold leading-tight"><T k="home.help.h" /></h2>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a href="tel:911" className="inline-flex min-h-14 items-center gap-3 rounded-2xl bg-[#a8281b] px-6 font-serif text-3xl font-bold text-white hover:bg-[#8f2015]"><KitIcon name="phone" className="h-6 w-6" />911</a>
                <Link href="/hotlines" className="inline-flex min-h-11 items-center rounded-xl border-2 border-fiesta-navy px-4 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy hover:text-white"><T k="home.help.all" /></Link>
              </div>
            </div>
            {hotlines.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {hotlines.map((h) => (
                  <li key={h.id} className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold leading-snug">{h.name}</p>
                    <a href={tel(h.number)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-fiesta-navy px-3 font-serif text-lg font-bold whitespace-nowrap text-white hover:bg-fiesta-blue"><KitIcon name="phone" className="h-5 w-5 shrink-0" />{h.number}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Landmark>

        <Landmark as="section" label="home.map.aria2" className="py-12">
          <SectionHeader eyebrow="home.map.eyebrow" title="home.map.h" color={FIESTA.blue} />
          <div className="mt-6"><MapLoader slugs={slugs} values={values} /></div>
          <p className="mt-4 text-sm text-black/70">
            <T k="home.map.tap" /> <Link href="/bayan" className="inline-block py-2 font-semibold underline"><T k="home.map.list" /></Link>.
          </p>
        </Landmark>

        <section aria-label="MaHalTaNa" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/ma" className="block h-full"><PillarCard short="Ma" name="Mangyan" blurb="home.pillar.ma" color={FIESTA.blue} pattern="dotblocks" /></Link>
          <Link href="/hal" className="block h-full"><PillarCard short="Hal" name="Mount Halcon" blurb="home.pillar.hal" color={FIESTA_DEEP.green} pattern="peaks" /></Link>
          <Link href="/ta" className="block h-full"><PillarCard short="Ta" name="Tamaraw" blurb="home.pillar.ta" color={FIESTA.red} pattern="horns" /></Link>
          <Link href="/na" className="block h-full"><PillarCard short="Na" name="Naujan Lake" blurb="home.pillar.na" color={FIESTA_DEEP.sky} pattern="wave" /></Link>
        </section>

        <Landmark as="section" label="home.num.aria" className="grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/bayan" className="block h-full"><StatCard label="home.towns" value={String(towns.length)} hint="home.hint.towns" icon="pin" color={FIESTA.blue} /></Link>
          <Link href="/estatistika" className="block h-full"><StatCard label="home.pop" value={fmtInt(pop?.value)} lead={pop ? `Census ${pop.year}.` : undefined} hint="home.hint.stats" icon="people" color={FIESTA_DEEP.orange} /></Link>
          <Link href="/hotlines" className="block h-full"><StatCard label="home.stat.hotline" value={String(hotlineCount)} hint="home.hint.hotlines" icon="phone" color={FIESTA.red} /></Link>
          <Link href="/proyekto" className="block h-full"><StatCard label="home.projects" value={fmtInt(getProjectStats().total)} hint="home.hint.projects" icon="road" color={FIESTA_DEEP.green} /></Link>
        </Landmark>

        <Landmark as="section" label="home.services" className="pb-14">
          <SectionHeader eyebrow="home.svc.eyebrow" title="home.svc.h" color={FIESTA_DEEP.orange} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getCategories().map((c) => <ServiceTile key={c.slug} slug={c.slug} count={getServices(c.slug).length} href={`/serbisyo#${c.slug}`} />)}
          </div>
        </Landmark>

        <Landmark as="section" label="home.pop.aria" className="border-t border-black/10 py-14">
          <SectionHeader eyebrow="home.pop" title="home.pop.h" color={FIESTA.blue} />
          <div className="mt-8"><SplitSticky side={<LinkChoropleth rows={towns.map((t) => ({ pcode: t.pcode, name: t.name, value: t.pop, href: `/bayan/${t.slug}` }))} format={fmtInt} ariaKey="bayan.map.aria" />}>
            <BarChart rows={towns.filter((t) => t.pop != null).map((t) => ({ label: t.name, value: t.pop as number, href: `/bayan/${t.slug}` }))} format={fmtInt} />
          </SplitSticky></div>
        </Landmark>
      </div>
    </main>
  );
}
