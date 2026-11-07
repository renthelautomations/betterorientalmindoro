import Link from "next/link";
import type { ReactNode } from "react";
import { ICONS, ICON_KEYS, type IconKey } from "@/lib/brand";
import { STORIES } from "@/lib/stories";
import { HeroBg, Divider } from "@/components/kit/Motifs";
import { Badge, PillarCard } from "@/components/kit/Parts";
import { FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";

const COLOR: Record<IconKey, string> = { ma: FIESTA.blue, hal: FIESTA_DEEP.green, ta: FIESTA.red, na: FIESTA_DEEP.sky };
// Ma uses no ikat: Mangyan culture is shown only with the communities' approval.
const PATTERN: Record<IconKey, PatternKey> = { ma: "dotblocks", hal: "peaks", ta: "horns", na: "wave" };

/** Story layout from design-kit/story: kit scroll scene (Hal, Na) or HeroBg (Ma, Ta), reading column, the four pillars. */
export default function StoryPage({ icon, scene, children }: { icon: IconKey; scene?: ReactNode; children?: ReactNode }) {
  const s = STORIES[icon];
  return (
    <main>
      {scene ? (
        // Reduced motion shrinks the tall scroll scene to one screen; the text below is plain HTML either way.
        <div className="overflow-hidden motion-reduce:[&>div]:h-[80vh] motion-reduce:[&>div>div]:h-[80vh]">{scene}</div>
      ) : (
        <HeroBg variant={icon === "ta" ? "panels" : "dawn"} className="min-h-[60vh]">
          <div className="mx-auto max-w-3xl px-4 pb-48 pt-16">
            <p className="font-serif text-6xl font-bold text-fiesta-navy">{ICONS[icon].short}</p>
            <p className="mt-2 font-serif text-4xl font-bold text-fiesta-navy md:text-5xl">{s.title}</p>
          </div>
        </HeroBg>
      )}
      <Divider variant="mahaltana" />
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-lg leading-relaxed">
        <h1 className="font-serif text-4xl font-bold">{s.title}</h1>
        {icon === "ma" && <Badge kind="soon">In preparation</Badge>}
        {s.draft && <Badge kind="wip">Draft: for volunteer review</Badge>}
        {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
        {children}
        {s.link && <p><a className="inline-block py-2 underline" href={s.link.href} rel="noopener">{s.link.label}</a></p>}
      </article>
      <section aria-label="Ang apat na haligi" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-serif text-2xl font-bold">Ang apat na haligi</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {ICON_KEYS.map((k) => (
            <Link key={k} href={`/${k}`} aria-current={k === icon ? "page" : undefined} className={k === icon ? "pointer-events-none opacity-60" : ""}>
              <PillarCard short={ICONS[k].short} name={ICONS[k].name} blurb={ICONS[k].blurb} color={COLOR[k]} pattern={PATTERN[k]} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
