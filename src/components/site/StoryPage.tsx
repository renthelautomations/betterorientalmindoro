import Link from "next/link";
import type { ReactNode } from "react";
import { ICONS, ICON_KEYS, type IconKey } from "@/lib/brand";
import { STORIES_EN, STORIES_FIL, type Story } from "@/lib/stories";
import { DICT } from "@/lib/i18n/dict";
import Bilingual from "@/lib/i18n/Bilingual";
import { Divider } from "@/components/kit/Motifs";
import { Badge } from "@/components/kit/Parts";
import { FIESTA, FIESTA_DEEP, PatternFill, type PatternKey } from "@/components/kit/Patterns";

const COLOR: Record<IconKey, string> = { ma: FIESTA.blue, hal: FIESTA_DEEP.green, ta: FIESTA.red, na: FIESTA_DEEP.sky };
// Ma uses no ikat: Mangyan culture is shown only with the communities' approval.
const PATTERN: Record<IconKey, PatternKey> = { ma: "dotblocks", hal: "peaks", ta: "horns", na: "wave" };

/** Story layout from design-kit/story: kit scroll scene (Hal, Na) or HeroBg (Ma, Ta), reading column, the four pillars. */
export default function StoryPage({ icon, scene, children }: { icon: IconKey; scene?: ReactNode; children?: ReactNode }) {
  const i = (l: 0 | 1) => (k: string) => DICT[k as keyof typeof DICT][l];
  const hero = (s: Story) => (
    <div className="relative isolate overflow-hidden text-white" style={{ background: COLOR[icon] }}>
      <PatternFill variant={PATTERN[icon]} colors={["#fff"]} opacity={0.18} />
      <div className="relative mx-auto max-w-3xl px-4 py-16 md:py-24">
        <p className="font-serif text-6xl font-bold">{ICONS[icon].short}</p>
        <p className="mt-2 font-serif text-4xl font-bold md:text-5xl">{s.title}</p>
      </div>
    </div>
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
    <nav aria-label={i(l)("uxd.story.switch")} className="mx-auto max-w-3xl px-4 pb-16">
      <h2 className="font-serif text-2xl font-bold">{i(l)("uxd.story.switch")}</h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {ICON_KEYS.map((k) => (
          <li key={k}>
            <Link href={`/${k}`} aria-current={k === icon ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ${k === icon ? "text-white ring-transparent" : "bg-white text-fiesta-navy ring-black/15 hover:bg-fiesta-mint"}`} style={k === icon ? { background: COLOR[k] } : undefined}>
              <span className="font-serif text-base font-bold">{ICONS[k].short}</span>{i(l)(`docs.name.${k}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
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
