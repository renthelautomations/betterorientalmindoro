import type { Metadata } from "next";
import Link from "next/link";
import BayanFrame, { SeeAll } from "@/components/site/BayanFrame";
import BayanMiniMap from "@/components/site/BayanMiniMap";
import { bayanParams, peso, requireBayan, topProjects } from "@/components/site/bayanData";
import { EmptyState } from "@/components/kit/Ui";
import { getMunicipality } from "@/lib/municipalities";

export const generateStaticParams = bayanParams;

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]/proyekto">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipality(slug);
  return m ? { title: `Proyekto sa ${m.name}`, description: `Mga proyekto ng DPWH sa ${m.name}.` } : { robots: { index: false } };
}

export default async function Proyekto({ params }: PageProps<"/bayan/[slug]/proyekto">) {
  const { slug } = await params;
  const m = requireBayan(slug);
  const all = topProjects(slug);
  const top = all.slice(0, 5);
  const located = all.filter((p) => p.lat != null && p.lon != null) as (typeof all[number] & { lat: number; lon: number })[];
  const listOnly = all.length - located.length;
  return (
    <BayanFrame slug={slug} active="proyekto">
      {all.length === 0 ? (
        <EmptyState title="Walang natukoy na proyekto">Walang proyekto ng DPWH na natukoy ang bayan sa dataset. Maaaring nasa listahan ng lalawigan ang ilan na hindi tiyak ang bayan. <Link className="underline" href="/proyekto">Tingnan ang lahat</Link>.</EmptyState>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="top-h">
            <h2 id="top-h" className="text-sm font-semibold tracking-widest text-black/60">PINAKAMALALAKING PROYEKTO ({all.length.toLocaleString("en-PH")} KABUUAN)</h2>
            <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
              {top.map((p) => (
                <li key={p.id}><Link href={`/proyekto/${p.id}`} className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-black/5"><span className="min-w-0 break-words text-sm font-medium">{p.title}</span><span className="text-sm tabular-nums text-black/70">{peso(p.cost)}{p.year ? ` · ${p.year}` : ""}{p.status ? ` · ${p.status}` : ""}</span></Link></li>
              ))}
            </ul>
            <SeeAll href={`/proyekto?bayan=${slug}`}>Lahat ng proyekto sa {m.name}</SeeAll>
            <p className="mt-2 text-xs text-black/65">Source: DPWH Transparency Portal via BetterGov Open Data. Mga proyektong natukoy ang bayan lamang; may iba pang proyekto ng lalawigan na hindi tiyak ang bayan.</p>
          </section>
          <section aria-labelledby="map-h">
            <h2 id="map-h" className="text-sm font-semibold tracking-widest text-black/60">MAPA</h2>
            {located.length ? (
              <div className="mt-3"><BayanMiniMap pcode={m.pcode} name={m.name} points={located} /></div>
            ) : <p className="mt-3 rounded-2xl border border-dashed border-black/20 p-5 text-sm text-black/65">Walang coordinates ang mga proyekto rito, kaya walang tuldok sa mapa.</p>}
            <p className="mt-2 text-sm text-black/70"><b className="tabular-nums">{located.length.toLocaleString("en-PH")}</b> may coordinates{listOnly > 0 ? <> · <b className="tabular-nums">{listOnly.toLocaleString("en-PH")}</b> nasa listahan lang</> : null}</p>
          </section>
        </div>
      )}
    </BayanFrame>
  );
}
