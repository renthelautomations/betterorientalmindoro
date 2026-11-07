import Link from "next/link";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { CATEGORY_ICON, lookOf } from "./ServiceTile";
import type { Service } from "@/lib/services";

export { CATEGORY_ICON } from "./ServiceTile";

/** Service record row: icon badge in the category colour, title, one-paragraph summary, arrow. */
export function ServiceLink({ s }: { s: Service }) {
  return (
    <Link href={`/serbisyo/${s.category}/${s.id}`} className="group flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: lookOf(s.category).color }}><KitIcon name={CATEGORY_ICON[s.category] ?? "doc"} color="#fff" className="h-6 w-6" /></span>
      <span className="min-w-0 flex-1"><span className="block font-serif text-lg font-bold leading-snug">{s.title}</span><span className="mt-1 block text-sm leading-relaxed text-black/70">{s.summary}</span></span>
      <KitIcon name="arrow" className="mt-3 h-5 w-5 shrink-0 text-fiesta-blue transition group-hover:translate-x-1" />
    </Link>
  );
}
