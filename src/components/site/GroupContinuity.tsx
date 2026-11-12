"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import KitIcon from "@/components/kit/KitIcon";
import { T } from "@/lib/i18n/i18n";
import { GROUPS, groupOf } from "@/lib/ia";
import MenuEmblem from "./MenuEmblem";

/** Above the footer on every page that belongs to a group: the group's other pages, then the other groups, so no page is a dead end. */
export default function GroupContinuity() {
  const path = usePathname();
  const g = groupOf(path);
  if (!g) return null;
  const gi = GROUPS.indexOf(g);
  const items = g.items.filter((i) => i.href.split("#")[0] !== path || i.href.includes("#"));
  const others = GROUPS.filter((x) => x.id !== g.id);
  return (
    <nav aria-label="More on this site" className="bg-fiesta-mint/70">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-4">
          <MenuEmblem index={gi * 3} className="h-12 w-12" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-fiesta-blue"><T k="ia.more" /></p>
            <h2 className="font-serif text-2xl font-bold leading-tight text-fiesta-navy md:text-3xl"><T k={g.label} /></h2>
          </div>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i, n) => (
            <li key={i.href + i.label}>
              <Link href={i.href} className="group flex h-full min-h-[4.5rem] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
                <MenuEmblem index={gi * 3 + n + 1} className="h-11 w-11" />
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-base font-bold leading-tight text-fiesta-navy"><T k={i.label} /></span>
                  {i.desc && <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-black/70"><T k={i.desc} /></span>}
                </span>
                <KitIcon name="arrow" className="h-5 w-5 shrink-0 text-fiesta-navy/40 transition group-hover:translate-x-0.5 group-hover:text-fiesta-navy" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-black/65"><T k="ia.also" /></span>
          {others.map((o) => (
            <Link key={o.id} href={o.landing} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fiesta-navy px-4 text-sm font-semibold text-white transition hover:bg-fiesta-blue"><T k={o.nav ?? o.label} /><KitIcon name="arrow" className="h-3.5 w-3.5" /></Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
