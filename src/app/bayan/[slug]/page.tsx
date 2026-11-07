import { cleanTitle } from "@/lib/projects";
import type { Metadata } from "next";
import Link from "next/link";
import BayanFrame, { SeeAll } from "@/components/site/BayanFrame";
import Sparkline from "@/components/site/Sparkline";
import { bayanParams, peso, requireBayan, topProjects } from "@/components/site/bayanData";
import { Callout } from "@/components/kit/Parts";
import { EmptyState } from "@/components/kit/Ui";
import { getBayanSummary } from "@/lib/bayan";
import { getHotlines } from "@/lib/hotlines";
import { getMunicipality } from "@/lib/municipalities";
import { getStats } from "@/lib/stats";

export const generateStaticParams = bayanParams;

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipality(slug);
  return m ? { title: m.name, description: `Buod ng ${m.name}: tulong, proyekto, halalan at estatistika.` } : { robots: { index: false } };
}

export default async function BayanBuod({ params }: PageProps<"/bayan/[slug]">) {
  const { slug } = await params;
  const m = requireBayan(slug);
  const s = getBayanSummary(slug)!;
  const urgent = [...getHotlines(slug), ...getHotlines("province")].filter((h, i, a) => h.category === "emergency" && h.number !== "911" && a.findIndex((x) => x.number === h.number) === i).slice(0, 2);
  const projects = topProjects(slug).slice(0, 3);
  const pop = getStats(slug)?.population ?? [];
  return (
    <BayanFrame slug={slug} active="buod">
    <div className="space-y-12">
      <Callout kind="emergency" title="Kailangan ng tulong ngayon?">
        Tumawag sa <a className="font-semibold underline" href="tel:911">911</a>
        {urgent.map((h) => <span key={h.id}>; {h.name}: <a className="font-semibold underline" href={`tel:${h.number.replace(/[^\d+]/g, "")}`}>{h.number}</a></span>)}. <Link className="underline" href={`/bayan/${slug}/tulong`}>Lahat ng numero para sa {m.name}</Link>.
      </Callout>

      <section aria-labelledby="top-proyekto">
        <h2 id="top-proyekto" className="text-sm font-semibold tracking-widest text-black/60">PINAKAMALALAKING PROYEKTO NG DPWH</h2>
        {projects.length ? (
          <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
            {projects.map((p) => (
              <li key={p.id}><Link href={`/proyekto/${p.id}`} className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-black/5"><span className="min-w-0 break-words text-sm font-medium">{cleanTitle(p.title)}</span><span className="text-sm tabular-nums text-black/70">{peso(p.cost)}{p.year ? ` · ${p.year}` : ""}</span></Link></li>
            ))}
          </ul>
        ) : <EmptyState title="Walang natukoy na proyekto">Walang proyekto ng DPWH na natukoy ang bayan sa dataset. Hindi ito nangangahulugang walang proyekto.</EmptyState>}
        {s.projectCount > 3 && <SeeAll href={`/bayan/${slug}/proyekto`}>Lahat ng {s.projectCount.toLocaleString("en-PH")} proyekto</SeeAll>}
      </section>

      <div className="grid gap-12 md:grid-cols-2">
        <section aria-labelledby="top-apelyido">
          <h2 id="top-apelyido" className="text-sm font-semibold tracking-widest text-black/60">PAULIT-ULIT NA APELYIDO SA HALALAN</h2>
          {s.topSurnames.length ? (
            <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
              {s.topSurnames.map((r) => <li key={r.surname} className="flex items-baseline justify-between gap-4 px-4 py-3"><span className="font-serif text-lg font-bold">{r.surname}</span><span className="text-sm text-black/70">{r.seats} na panalo</span></li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-black/60">Walang apelyidong hawak ng dalawa o higit pang magkaibang tao sa datos.</p>}
          <p className="mt-2 text-xs text-black/65">Pattern lang ito sa talaan, hindi patunay ng anumang relasyon.</p>
          <SeeAll href={`/bayan/${slug}/halalan`}>Halalan sa {m.name}</SeeAll>
        </section>
        <section aria-labelledby="pop-trend">
          <h2 id="pop-trend" className="text-sm font-semibold tracking-widest text-black/60">POPULASYON SA PAGLIPAS NG PANAHON</h2>
          <div className="mt-3"><Sparkline points={pop.map((p) => ({ year: p.year, value: p.value }))} label={`Populasyon ng ${m.name}`} /></div>
          <SeeAll href={`/bayan/${slug}/datos`}>Lahat ng estatistika</SeeAll>
        </section>
      </div>
    </div>
    </BayanFrame>
  );
}
