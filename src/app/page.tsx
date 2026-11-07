import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import { HeroBg, Divider } from "@/components/kit/Motifs";
import { PillarCard, StatCard, Callout, SectionHeader } from "@/components/kit/Parts";
import SiteSearch from "@/components/kit/SiteSearch";
import { FIESTA } from "@/components/kit/Patterns";
import { getSearchItems } from "@/lib/search-index";
import { getMunicipalities } from "@/lib/municipalities";
import { getHotlines } from "@/lib/hotlines";
import { getProvinceStats, fmtInt } from "@/lib/stats";
import { getProjectStats } from "@/lib/projects";
import { SITE } from "@/lib/brand";

const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

export default function Home() {
  const towns = getMunicipalities();
  const slugs = Object.fromEntries(towns.map((m) => [m.pcode, m.slug]));
  const pop = getProvinceStats().population.at(-1);
  // Only numbers confirmed against the province's published list.
  const hotlines = getHotlines("province").filter((h) => h.confirmed && /^(Police|Fire|Public Safety)$|Operations and Warning/.test(h.name)).slice(0, 4);
  return (
    <main>
      <HeroBg variant="banners">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 md:pb-20 md:pt-16">
          <p className="text-sm font-semibold tracking-[0.2em] text-fiesta-blue">MAHALTANA</p>
          <h1 className="mt-3 max-w-xl font-serif text-4xl font-bold leading-tight md:text-6xl">{SITE.tagline}</h1>
          <p className="mt-5 max-w-lg text-lg text-black/70">Mga serbisyo, hotline, proyekto at kuwento ng lalawigan, sa iisang lugar.</p>
          <div className="mt-8"><SiteSearch items={getSearchItems()} /></div>
        </div>
      </HeroBg>
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
          <Link href="/ma"><PillarCard short="Ma" name="Mangyan" blurb="Kultura at tradisyon." color={FIESTA.blue} pattern="dotblocks" /></Link>
          <Link href="/hal"><PillarCard short="Hal" name="Mount Halcon" blurb="Ang bundok ng lalawigan." color="#2d7d46" pattern="peaks" /></Link>
          <Link href="/ta"><PillarCard short="Ta" name="Tamaraw" blurb="Tanging sa Mindoro." color={FIESTA.red} pattern="horns" /></Link>
          <Link href="/na"><PillarCard short="Na" name="Naujan Lake" blurb="Ang pinakamalaking lawa." color="#1f6f9c" pattern="wave" /></Link>
        </section>

        <section aria-label="Sa numero" className="py-14">
          <SectionHeader eyebrow="SA NUMERO" title="Ang lalawigan sa numero" color="#c2410c" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link href="/estatistika"><StatCard label="POPULASYON" value={fmtInt(pop?.value)} hint={pop ? `Census ${pop.year}. Tingnan ang Estatistika` : "Tingnan ang Estatistika"} icon="people" color={FIESTA.blue} /></Link>
            <Link href="/proyekto"><StatCard label="PROYEKTO NG DPWH" value={fmtInt(getProjectStats().total)} hint="Nakalista. Tingnan ang Proyekto" icon="road" color="#2d7d46" /></Link>
            <Link href="/bayan"><StatCard label="BAYAN AT LUNGSOD" value={String(towns.length)} hint="Sa buong lalawigan. Tingnan ang Bayan" icon="pin" color="#c2410c" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
