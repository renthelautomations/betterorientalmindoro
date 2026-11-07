import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import HalconScroll from "@/components/kit/HalconScroll";
import NaujanScroll from "@/components/kit/NaujanScroll";
import { HeroBg, Divider } from "@/components/kit/Motifs";
import { PillarCard, Badge } from "@/components/kit/Parts";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import WeatherNow from "@/components/WeatherNow";
import { DemoLangBar } from "@/components/kit/Layout";
import { ICON_KEYS, ICONS, isIconKey, type IconKey } from "@/lib/brand";
import { STORIES } from "@/lib/stories";

export const metadata: Metadata = { title: "Pillar story template (draft)", robots: { index: false } };
export function generateStaticParams() { return ICON_KEYS.map((pillar) => ({ pillar })); }

const COLOR: Record<IconKey, string> = { ma: FIESTA.blue, hal: FIESTA_DEEP.green, ta: FIESTA.red, na: FIESTA_DEEP.sky };
const PATTERN = { ma: "ikat", hal: "peaks", ta: "horns", na: "wave" } as const;

export default async function StoryTemplate({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  if (!isIconKey(pillar)) notFound();
  const story = STORIES[pillar];
  return (
    <main>
      <DemoLangBar />
      {pillar === "hal" ? <HalconScroll /> : pillar === "na" ? <NaujanScroll /> : (
        <HeroBg variant={pillar === "ta" ? "panels" : "dawn"} className="min-h-[60vh]">
          <div className="mx-auto max-w-3xl px-4 pb-48 pt-16"><p className="font-serif text-6xl font-bold text-fiesta-navy">{ICONS[pillar].short}</p><p className="mt-2 font-serif text-4xl font-bold text-fiesta-navy md:text-5xl">{story.title}</p></div>
        </HeroBg>
      )}
      <Divider variant="mahaltana" />
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-lg leading-relaxed">
        <h1 className="font-serif text-4xl font-bold">{story.title}</h1>
        {pillar === "ma" && <Badge kind="soon">In preparation</Badge>}
        {story.draft && <Badge kind="wip">Draft: for volunteer review</Badge>}
        {story.paragraphs.map((p) => <p key={p}>{p}</p>)}
        {pillar === "hal" && <WeatherNow />}
        {story.link && <p><a className="underline" href={story.link.href} rel="noopener">{story.link.label}</a></p>}
        <p className="rounded-2xl bg-fiesta-mint px-5 py-4 text-sm text-black/70">Photo frames go here once real photos are available. We do not use stock images for places and people of Oriental Mindoro.</p>
      </article>
      <section aria-label="Ang apat na haligi" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-serif text-2xl font-bold">Ang apat na haligi</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {ICON_KEYS.map((k) => <Link key={k} href={`/design-kit/story/${k}`} aria-current={k === pillar ? "page" : undefined} className={k === pillar ? "pointer-events-none opacity-60" : ""}><PillarCard short={ICONS[k].short} name={ICONS[k].name} blurb={ICONS[k].blurb} color={COLOR[k]} pattern={PATTERN[k]} /></Link>)}
        </div>
      </section>
    </main>
  );
}
