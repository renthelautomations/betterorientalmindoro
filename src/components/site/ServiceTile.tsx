import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { PatternFill, FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";
import { CATEGORY_ICON } from "./ServiceLink";

// One look per service category: color + pattern that fit what it is about.
const LOOK: Record<string, { color: string; pattern: PatternKey }> = {
  certificates: { color: FIESTA.blue, pattern: "mosaic" },
  business: { color: FIESTA_DEEP.orange, pattern: "burst" },
  social: { color: FIESTA_DEEP.green, pattern: "dotblocks" },
  health: { color: FIESTA.red, pattern: "burst" },
  taxation: { color: FIESTA.navy, pattern: "mosaic" },
  agriculture: { color: FIESTA_DEEP.green, pattern: "peaks" },
  infrastructure: { color: FIESTA_DEEP.orange, pattern: "ikat" },
  education: { color: FIESTA.blue, pattern: "dotblocks" },
  "public-safety": { color: FIESTA.red, pattern: "horns" },
};

/** Patterned category card (same family as the home pillar cards): big icon, name, one-line blurb. */
export default function ServiceTile({ slug, count, href }: { slug: string; count?: number; href?: string }) {
  const look = LOOK[slug] ?? { color: FIESTA.navy, pattern: "mosaic" as PatternKey };
  return (
    <Link href={href ?? `#${slug}`} className="group relative isolate flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue" style={{ background: look.color }}>
      <PatternFill variant={look.pattern} colors={["#fff"]} opacity={0.16} />
      <span className="flex items-start justify-between">
        <KitIcon name={CATEGORY_ICON[slug] ?? "doc"} color="#fff" className="h-11 w-11" />
        {count != null && <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs font-semibold">{count === 0 ? <T k="svc.soon" /> : <>{count} <T k={count === 1 ? "svc.count1" : "svc.count"} /></>}</span>}
      </span>
      {/* solid band under the pattern so the text never sits on it */}
      <span className="-mx-5 -mb-5 mt-6 block px-5 pb-5 pt-3" style={{ background: look.color }}><span className="block font-serif text-xl font-bold leading-tight"><T k={`svc.cat.${slug}`} /></span><span className="mt-1 block text-sm leading-snug text-white"><T k={`svc.cat.${slug}.b`} /></span></span>
    </Link>
  );
}
