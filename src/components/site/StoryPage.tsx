import Link from "next/link";
import type { ReactNode } from "react";
import { ICONS, ICON_KEYS, type IconKey } from "@/lib/brand";
import { STORIES_EN, STORIES_FIL, type Story } from "@/lib/stories";
import { DICT } from "@/lib/i18n/dict";
import Bilingual from "@/lib/i18n/Bilingual";
import { HeroBg, Divider } from "@/components/kit/Motifs";
import { Badge, PillarCard } from "@/components/kit/Parts";
import { FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";

const COLOR: Record<IconKey, string> = { ma: FIESTA.blue, hal: FIESTA_DEEP.green, ta: FIESTA.red, na: FIESTA_DEEP.sky };
// Ma uses no ikat: Mangyan culture is shown only with the communities' approval.
const PATTERN: Record<IconKey, PatternKey> = { ma: "dotblocks", hal: "peaks", ta: "horns", na: "wave" };

/** Story layout from design-kit/story: kit scroll scene (Hal, Na) or HeroBg (Ma, Ta), reading column, the four pillars. */
export default function StoryPage({ icon, scene, children }: { icon: IconKey; scene?: ReactNode; children?: ReactNode }) {
  const i = (l: 0 | 1) => (k: string) => DICT[k as keyof typeof DICT][l];
  const hero = (s: Story) => (
    <HeroBg variant={icon === "ta" ? "panels" : "dawn"} className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-4 pb-48 pt-16">
        <p className="font-serif text-6xl font-bold text-fiesta-navy">{ICONS[icon].short}</p>
        <p className="mt-2 font-serif text-4xl font-bold text-fiesta-navy md:text-5xl">{s.title}</p>
      </div>
    </HeroBg>
  );
  const article = (s: Story, l: 0 | 1) => (
    <article className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-lg leading-relaxed">
      <h1 className="font-serif text-4xl font-bold">{s.title}</h1>
      {icon === "ma" && <Badge kind="soon">{i(l)("docs.badge.soon")}</Badge>}
      {s.draft && <Badge kind="wip">{i(l)("docs.badge.draft")}</Badge>}
      {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
      {children}
      {s.link && <p><a className="inline-block py-2 underline" href={s.link.href} rel="noopener">{s.link.label}</a></p>}
    </article>
  );
  const pillars = (l: 0 | 1) => (
    <section aria-label={i(l)("docs.pillars")} className="mx-auto max-w-6xl px-4 pb-16">
      <h2 className="font-serif text-2xl font-bold">{i(l)("docs.pillars")}</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {ICON_KEYS.map((k) => (
          <Link key={k} href={`/${k}`} aria-current={k === icon ? "page" : undefined} className={k === icon ? "pointer-events-none opacity-60" : ""}>
            <PillarCard short={ICONS[k].short} name={i(l)(`docs.name.${k}`)} blurb={i(l)(`docs.blurb.${k}`)} color={COLOR[k]} pattern={PATTERN[k]} />
          </Link>
        ))}
      </div>
    </section>
  );
  return (
    <main>
      {scene ? (
        // Reduced motion shrinks the tall scroll scene to one screen; the text below is plain HTML either way.
        <div className="overflow-hidden motion-reduce:[&>div]:h-[80vh] motion-reduce:[&>div>div]:h-[80vh]">{scene}</div>
      ) : (
        <Bilingual en={hero(STORIES_EN[icon])} fil={hero(STORIES_FIL[icon])} />
      )}
      <Divider variant="mahaltana" />
      <Bilingual en={article(STORIES_EN[icon], 0)} fil={article(STORIES_FIL[icon], 1)} />
      <Bilingual en={pillars(0)} fil={pillars(1)} />
    </main>
  );
}
