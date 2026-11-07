import type { Metadata } from "next";
import Link from "next/link";
import BayanFrame from "@/components/site/BayanFrame";
import { bayanParams, requireBayan } from "@/components/site/bayanData";
import { Callout } from "@/components/kit/Parts";
import { HotlineCard } from "@/components/kit/Ui";
import { getHotlines } from "@/lib/hotlines";
import { getMunicipality } from "@/lib/municipalities";

export const generateStaticParams = bayanParams;

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]/tulong">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipality(slug);
  return m ? { title: `Tulong sa ${m.name}`, description: `Mga hotline para sa ${m.name} at sa buong Oriental Mindoro.` } : { robots: { index: false } };
}

export default async function Tulong({ params }: PageProps<"/bayan/[slug]/tulong">) {
  const { slug } = await params;
  const m = requireBayan(slug);
  const own = getHotlines(slug);
  const province = getHotlines("province");
  return (
    <BayanFrame slug={slug} active="tulong">
      <div className="space-y-10">
        <Callout kind="emergency" title="Emergency: 911">Para sa panganib sa buhay, tumawag muna sa <a className="font-semibold underline" href="tel:911">911</a>.</Callout>
        {own.length > 0 ? (
          <section aria-labelledby="own-h">
            <h2 id="own-h" className="mb-3 text-sm font-semibold tracking-widest text-black/60">SA {m.name.toUpperCase()}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{own.map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div>
          </section>
        ) : (
          <p className="rounded-2xl border border-dashed border-black/20 p-5 text-sm text-black/70">Wala pang naitalang hotline na partikular sa {m.name} sa aming talaan. Hindi kami gumagawa ng numero; ito ang mga numero ng buong lalawigan na maaaring tawagan.</p>
        )}
        <section aria-labelledby="prov-h">
          <h2 id="prov-h" className="mb-3 text-sm font-semibold tracking-widest text-black/60">BUONG LALAWIGAN NG ORIENTAL MINDORO</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{province.slice(0, own.length ? 3 : 6).map((h) => <HotlineCard key={h.id} h={h} tone={h.category} />)}</div>
          <Link href="/hotlines" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2">Lahat ng hotline →</Link>
        </section>
      </div>
    </BayanFrame>
  );
}
