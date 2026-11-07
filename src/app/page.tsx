import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import { Divider } from "@/components/kit/Motifs";
import PennantHero from "@/components/site/PennantHero";
import { PillarCard, StatCard, Callout, SectionHeader, ServiceRow } from "@/components/kit/Parts";
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
import { SITE } from "@/lib/brand";

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
          <p className="text-sm font-semibold tracking-[0.2em] text-fiesta-blue">{SITE.tagline.toUpperCase()}</p>
          <h1 className="mt-3 max-w-xl font-serif text-5xl font-bold leading-[1.05] md:text-7xl">Better<br />Oriental Mindoro<span className="text-fiesta-orange">.org</span></h1>
          <p className="mt-5 max-w-lg text-lg text-black/70">Mga serbisyo, hotline, proyekto at kuwento ng lalawigan, sa iisang lugar.</p>
          <div className="mt-8"><SiteSearch items={getSearchItems()} /></div>
        </div>
      </PennantHero>
      <Divider variant="mahaltana" />

      <div className="mx-auto max-w-6xl px-4">
        <section aria-label="Tulong ngayon" className="pt-10">
          <Callout kind="emergency" title="Kailangan ng tulong ngayon?">
            {hotlines.length === 0 ? (
              <Link href="/hotlines" className="underline">Tingnan ang mga hotline</Link>
            ) : (
              <>
                {hotlines.map((h) => (
                  <span key={h.id} className="block py-1">
                    {h.name}: <a href={tel(h.number)} className="font-semibold underline">{h.number}</a>
                  </span>
                ))}
                <Link href="/hotlines" className="mt-1 inline-block py-1 font-semibold underline">Lahat ng hotline</Link>
              </>
            )}
          </Callout>
        </section>

        <section aria-label="Mapa ng lalawigan" className="py-12">
          <SectionHeader eyebrow="MAPA" title="Ang 15 bayan at lungsod" color={FIESTA.blue} />
          <div className="mt-6"><MapLoader slugs={slugs} /></div>
          <p className="mt-4 text-sm text-black/70">
            Pindutin ang isang bayan sa mapa, o <Link href="/bayan" className="inline-block py-2 font-semibold underline">buksan ang listahan ng mga bayan</Link>.
          </p>
        </section>

        <section aria-label="MaHalTaNa" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/ma" className="block h-full"><PillarCard short="Ma" name="Mangyan" blurb="Kultura at tradisyon." color={FIESTA.blue} pattern="dotblocks" /></Link>
          <Link href="/hal" className="block h-full"><PillarCard short="Hal" name="Mount Halcon" blurb="Ang bundok ng lalawigan." color={FIESTA_DEEP.green} pattern="peaks" /></Link>
          <Link href="/ta" className="block h-full"><PillarCard short="Ta" name="Tamaraw" blurb="Tanging sa Mindoro." color={FIESTA.red} pattern="horns" /></Link>
          <Link href="/na" className="block h-full"><PillarCard short="Na" name="Naujan Lake" blurb="Ang pinakamalaking lawa." color={FIESTA_DEEP.sky} pattern="wave" /></Link>
        </section>

        <section aria-label="Sa numero" className="grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/bayan" className="block h-full"><StatCard label="BAYAN AT LUNGSOD" value={String(towns.length)} hint="Sa buong lalawigan. Tingnan ang Bayan" icon="pin" color={FIESTA.blue} /></Link>
          <Link href="/estatistika" className="block h-full"><StatCard label="POPULASYON" value={fmtInt(pop?.value)} hint={pop ? `Census ${pop.year}. Tingnan ang Estatistika` : "Tingnan ang Estatistika"} icon="people" color={FIESTA_DEEP.orange} /></Link>
          <Link href="/hotlines" className="block h-full"><StatCard label="HOTLINE" value={String(hotlineCount)} hint="Nakalista. Tingnan ang Hotlines" icon="phone" color={FIESTA.red} /></Link>
          <Link href="/proyekto" className="block h-full"><StatCard label="PROYEKTO NG DPWH" value={fmtInt(getProjectStats().total)} hint="Nakalista. Tingnan ang Proyekto" icon="road" color={FIESTA_DEEP.green} /></Link>
        </section>

        <section aria-label="Para sa bayan" className="pb-14">
          <SectionHeader eyebrow="SERBISYO" title="Mga serbisyo para sa bayan" color={FIESTA_DEEP.orange} />
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {getCategories().map((c, i) => <Link key={c.slug} href={`/serbisyo#${c.slug}`} className="block min-w-0"><ServiceRow icon={CAT_ICON[c.slug] ?? "doc"} title={c.name} sub={c.blurb} color={[FIESTA.blue, FIESTA_DEEP.orange, FIESTA_DEEP.green, FIESTA.red][i % 4]} /></Link>)}
          </div>
        </section>

        <section aria-label="Populasyon" className="border-t border-black/10 py-14">
          <SectionHeader eyebrow="POPULASYON" title="Populasyon ng bawat bayan" color={FIESTA.blue} />
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <BarChart rows={towns.filter((t) => t.pop != null).map((t) => ({ label: t.name, value: t.pop as number, href: `/bayan/${t.slug}` }))} format={fmtInt} />
            <LinkChoropleth rows={towns.map((t) => ({ pcode: t.pcode, name: t.name, value: t.pop, href: `/bayan/${t.slug}` }))} format={fmtInt} unit="population" />
          </div>
        </section>
      </div>
    </main>
  );
}
