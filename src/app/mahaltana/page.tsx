import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/kit/Parts";
import { Divider } from "@/components/kit/Motifs";
import { BreadcrumbsT, PageTitleT, PillarCardT } from "@/components/site/KitT";
import { T } from "@/lib/i18n/i18n";
import { ICONS, ICON_KEYS, type IconKey } from "@/lib/brand";
import { STORIES } from "@/lib/stories";
import { FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";

export const metadata: Metadata = { title: "MaHalTaNa" };
const COLOR: Record<IconKey, string> = { ma: FIESTA.blue, hal: FIESTA_DEEP.green, ta: FIESTA.red, na: FIESTA_DEEP.sky };
const PATTERN: Record<IconKey, PatternKey> = { ma: "dotblocks", hal: "peaks", ta: "horns", na: "wave" };

export default function MaHalTaNa() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <BreadcrumbsT items={[{ label: "home.crumb", href: "/" }, { label: "MaHalTaNa" }]} />
        <div className="mt-4"><PageTitleT eyebrow="MAHALTANA" title="home.mht.title" /></div>
        <p className="mt-4 max-w-2xl text-black/70"><T k="home.mht.p" /></p>
      </div>
      <Divider variant="mahaltana" className="mt-8" />
      <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
        {ICON_KEYS.map((k) => {
          const i = ICONS[k], s = STORIES[k];
          return (
            <li key={k} className="grid min-w-0 gap-4 rounded-2xl bg-white p-4 sm:grid-cols-[11rem_1fr]">
              <Link href={`/${k}`} aria-hidden tabIndex={-1}><PillarCardT short={i.short} name={i.name} blurb="" color={COLOR[k]} pattern={PATTERN[k]} /></Link>
              <div className="min-w-0">
                <h2 className="font-serif text-2xl font-bold">{i.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {k === "ma" && <Badge kind="soon"><T k="home.mht.prep" /></Badge>}
                  {s.draft && <Badge kind="wip"><T k="home.mht.draft" /></Badge>}
                </div>
                <p className="mt-3 text-black/70"><T k={`home.mht.${k}`} /></p>
                <Link href={`/${k}`} className="mt-2 inline-block py-2 font-semibold underline"><T k="home.mht.read" /> {i.name}</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
