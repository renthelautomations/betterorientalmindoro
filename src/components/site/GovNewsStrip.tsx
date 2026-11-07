import { getNews } from "@/lib/gov";
import { T } from "@/lib/i18n/i18n";
import { Landmark } from "./KitT";

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "–");

/** Home: the four newest headlines from the Provincial Government's own site, exactly as stored, each opening ormindoro.gov.ph. */
export default function GovNewsStrip() {
  const ds = getNews();
  const items = [...ds.items].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 4);
  return (
    <Landmark as="section" label="govc.news.aria" className="pb-14">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><p className="text-sm font-semibold tracking-widest text-fiesta-blue uppercase"><T k="govc.news.eyebrow" /></p><h2 className="mt-1 font-serif text-2xl font-bold text-fiesta-navy md:text-3xl"><T k="govc.news.h" /></h2></div>
        <a href="https://ormindoro.gov.ph/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue"><T k="govc.news.all" /> ↗</a>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((n) => (
          <li key={n.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-2 text-xs text-black/65">
              <time dateTime={n.date ?? undefined}>{fmt(n.date)}</time>
              <span className="rounded-full bg-fiesta-navy/5 px-2.5 py-0.5 font-semibold text-fiesta-navy"><T k={n.language === "fil" ? "govc.news.fil" : "govc.news.en"} /></span>
            </div>
            <a href={n.link} target="_blank" rel="noopener" className="mt-3 inline-flex min-h-11 flex-1 items-start font-semibold leading-snug text-fiesta-navy underline-offset-2 hover:underline">{n.title}</a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-black/65"><T k="govc.news.note" /></p>
    </Landmark>
  );
}
