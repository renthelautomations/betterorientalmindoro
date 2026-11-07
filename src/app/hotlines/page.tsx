import TownSelect from "@/components/site/TownSelect";
import { Suspense } from "react";
import type { Metadata } from "next";
import { HotlineCard } from "@/components/kit/Ui";
import { Skeleton } from "@/components/kit/Ui";
import Bilingual from "@/lib/i18n/Bilingual";
import { T } from "@/lib/i18n/i18n";
import { TCallout, TNav, TPageHead } from "@/components/site/DynBits";
import { groupByCategory, hotlinesForBayan, type Category, type Hotline } from "@/lib/hotlines";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Hotlines" };

const ORDER: Category[] = ["emergency", "medical", "government", "utility"];

function Groups({ rows, id }: { rows: Hotline[]; id: string }) {
  const g = groupByCategory(rows);
  return (
    <div className="space-y-8">
      {ORDER.filter((c) => g[c]).map((c) => (
        <div key={c}>
          <h3 className="mb-3 text-sm font-semibold tracking-widest text-black/65 uppercase"><T k={`cat.${c}`} /></h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g[c]!.map((h) => <li key={h.id} className="flex min-w-0 flex-col [&>div]:flex-1 [&_.text-fiesta-red]:text-[#a8281b]"><HotlineCard h={h} tone={c} /></li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ bayan?: string | string[] }> }) {
  const { bayan: raw } = await searchParams;
  const bayan = Array.isArray(raw) ? raw[0] : raw;
  const towns = getMunicipalities();
  const town = towns.find((m) => m.slug === bayan);
  const { local, province } = hotlinesForBayan(town?.slug);
  return (
    <div className="mt-8">
      <TNav label="dyn.hotline.pick"><TownSelect towns={towns.map((m) => ({ slug: m.slug, name: m.name }))} current={town?.slug} /></TNav>
      <div className="mt-8 space-y-10">
      {town && (
        <section aria-labelledby="local" className="">
          <h2 id="local" className="mb-4 font-serif text-2xl font-bold">{town.name}</h2>
          {local.length ? <Groups rows={local} id="local" /> : (
            <TCallout titleKey="dyn.hotline.none" name={town.name}><T k="dyn.hotline.none.p" /></TCallout>
          )}
        </section>
      )}
      <section aria-labelledby="prov" className="">
        <h2 id="prov" className="mb-4 font-serif text-2xl font-bold"><T k="dyn.province" /></h2>
        <Groups rows={province} id="prov" />
      </section>
      </div>
    </div>
  );
}

export default function Hotlines({ searchParams }: { searchParams: Promise<{ bayan?: string | string[] }> }) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
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
