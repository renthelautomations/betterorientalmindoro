import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/kit/Parts";
import { Divider } from "@/components/kit/Motifs";
import KitIcon from "@/components/kit/KitIcon";
import { BreadcrumbsT, PageTitleT } from "@/components/site/KitT";
import { T } from "@/lib/i18n/i18n";
import { ICONS, ICON_KEYS, type IconKey } from "@/lib/brand";
import { STORIES } from "@/lib/stories";
import { FIESTA, FIESTA_DEEP, PatternFill, type PatternKey } from "@/components/kit/Patterns";

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
            <li key={k} className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="relative h-20" style={{ background: COLOR[k] }}><PatternFill variant={PATTERN[k]} colors={["#fff"]} opacity={0.22} /></div>
              <div className="flex flex-1 flex-col px-5 pb-5">
                <span aria-hidden className="relative z-10 -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-white font-serif text-xl font-bold shadow ring-1 ring-black/5" style={{ color: COLOR[k] }}>{i.short}</span>
                <h2 className="mt-3 font-serif text-2xl font-bold">{i.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {k === "ma" && <Badge kind="soon"><T k="home.mht.prep" /></Badge>}
                  {s.draft && <Badge kind="wip"><T k="home.mht.draft" /></Badge>}
                </div>
                <p className="mt-3 text-black/70"><T k={`home.mht.${k}`} /></p>
                <Link href={`/${k}`} className="mt-4 inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue"><T k="home.mht.read" /> {i.name}<KitIcon name="arrow" className="h-4 w-4" /></Link>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
