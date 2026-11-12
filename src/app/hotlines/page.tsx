import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/kit/Ui";
import { T } from "@/lib/i18n/i18n";
import Bilingual from "@/lib/i18n/Bilingual";
import HotlineFinder from "@/components/site/HotlineFinder";
import { TPageHead } from "@/components/site/DynBits";
import { getHotlines } from "@/lib/hotlines";
import LguContactCard from "@/components/site/LguContactCard";
import LguDirectory from "@/components/site/LguDirectory";
import { getLguDirectory } from "@/lib/lgu-directory";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Hotlines" };

async function Body({ searchParams }: { searchParams: Promise<{ bayan?: string | string[] }> }) {
  const { bayan: raw } = await searchParams;
  const bayan = Array.isArray(raw) ? raw[0] : raw;
  const towns = getMunicipalities();
  const initial = towns.find((m) => m.slug === bayan)?.slug;
  // One contact card (+ office directory when published) per place; the finder shows the one for the chosen place.
  const extras = Object.fromEntries([...towns.map((m) => [m.slug, m.name] as const), ["province", "Oriental Mindoro"] as const].map(([slug, name]) => [slug,
    <div key={slug} className="space-y-6"><LguContactCard slug={slug} name={name} />{getLguDirectory(slug) && <LguDirectory slug={slug} name={name} collapsible />}</div>]));
  return <div className="mt-8"><HotlineFinder rows={getHotlines()} towns={towns.map((m) => ({ slug: m.slug, name: m.name }))} initialTown={initial} extras={extras} /></div>;
}

export default function Hotlines({ searchParams }: { searchParams: Promise<{ bayan?: string | string[] }> }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TPageHead crumbs={[{ label: "dyn.home", href: "/" }, { label: "nav.hotlines" }]} eyebrow="dyn.hotline.eyebrow" title="dyn.hotline.title">
        <p><Bilingual en={<>For an emergency, call <b>911</b>, the national emergency hotline.</>} fil={<>Para sa emergency, tumawag sa <b>911</b>, ang pambansang emergency hotline.</>} /></p>
        <p className="text-sm text-black/70"><T k="dyn.hotline.note" /></p>
      </TPageHead>
      <Suspense fallback={<div className="mt-8 space-y-3"><Skeleton className="h-11 w-full" /><Skeleton className="h-40 w-full" /></div>}>
        <Body searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
