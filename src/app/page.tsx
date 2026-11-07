import CatRow from "@/components/site/CatRow";
import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import { Divider } from "@/components/kit/Motifs";
import PennantHero from "@/components/site/PennantHero";
import { SectionHeaderT as SectionHeader, CalloutT as Callout, PillarCardT as PillarCard, StatCardT as StatCard, Landmark } from "@/components/site/KitT";
import { T } from "@/lib/i18n/i18n";
import SplitSticky from "@/components/site/SplitSticky";
import { BarChart } from "@/components/kit/Charts";
import LinkChoropleth from "@/components/site/LinkChoropleth";
import type { KitIconName } from "@/components/kit/KitIcon";
import SiteSearch from "@/components/kit/SiteSearch";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { getSearchItems } from "@/lib/search-index";
import { getMunicipalities } from "@/lib/municipalities";
import { getHotlines } from "@/lib/hotlines";
import { getProvinceStats, getStats, fmtInt } from "@/lib/stats";
import { getProjectStats } from "@/lib/projects";
import { getCategories } from "@/lib/services";

const CAT_ICON: Record<string, KitIconName> = { certificates: "doc", business: "budget", social: "people", health: "health", taxation: "budget", agriculture: "farm" };
const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

export default function Home() {
  const towns = getMunicipalities().map((m) => ({ ...m, pop: getStats(m.slug)?.population.at(-1)?.value ?? null }));
  const slugs = Object.fromEntries(towns.map((m) => [m.pcode, m.slug]));
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
          <div className="mt-8"><SiteSearch items={getSearchItems()} /></div>
        </div>
      </PennantHero>
      <Divider variant="mahaltana" />

      <div className="mx-auto max-w-6xl px-4">
        <Landmark as="section" label="home.help.aria" className="pt-10">
          <Callout kind="emergency" title="home.help.h">
            {hotlines.length === 0 ? (
              <Link href="/hotlines" className="underline"><T k="home.help.see" /></Link>
            ) : (
              <>
                {hotlines.map((h) => (
                  <span key={h.id} className="block py-1">
                    {h.name}: <a href={tel(h.number)} className="font-semibold underline">{h.number}</a>
                  </span>
                ))}
                <Link href="/hotlines" className="mt-1 inline-block py-1 font-semibold underline"><T k="home.help.all" /></Link>
              </>
            )}
          </Callout>
        </Landmark>

        <Landmark as="section" label="home.map.aria2" className="py-12">
          <SectionHeader eyebrow="home.map.eyebrow" title="home.map.h" color={FIESTA.blue} />
          <div className="mt-6"><MapLoader slugs={slugs} /></div>
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
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {getCategories().map((c, i) => <Link key={c.slug} href={`/serbisyo#${c.slug}`} className="block min-w-0"><CatRow slug={c.slug} icon={CAT_ICON[c.slug] ?? "doc"} color={[FIESTA.blue, FIESTA_DEEP.orange, FIESTA_DEEP.green, FIESTA.red][i % 4]} /></Link>)}
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
