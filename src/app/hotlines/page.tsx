import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/kit/Ui";
import { T } from "@/lib/i18n/i18n";
import Bilingual from "@/lib/i18n/Bilingual";
import HotlineFinder from "@/components/site/HotlineFinder";
import { TPageHead } from "@/components/site/DynBits";
import { getHotlines } from "@/lib/hotlines";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Hotlines" };

async function Body({ searchParams }: { searchParams: Promise<{ bayan?: string | string[] }> }) {
  const { bayan: raw } = await searchParams;
  const bayan = Array.isArray(raw) ? raw[0] : raw;
  const towns = getMunicipalities();
  const initial = towns.find((m) => m.slug === bayan)?.slug;
  return <div className="mt-8"><HotlineFinder rows={getHotlines()} towns={towns.map((m) => ({ slug: m.slug, name: m.name }))} initialTown={initial} /></div>;
}

export default function Hotlines({ searchParams }: { searchParams: Promise<{ bayan?: string | string[] }> }) {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
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
