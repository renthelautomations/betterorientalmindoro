import Link from "next/link";
import { pageWindow } from "@/lib/projects";
import { T } from "@/lib/i18n/i18n";
import { PageInput } from "./PagerInput";

const base = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold";
const live = `${base} border-black/20 bg-white text-fiesta-navy hover:border-fiesta-navy`;
const off = `${base} border-black/10 bg-black/5 text-black/35`;

/** First / Previous / numbered / Next / Last plus a "go to page" box. Plain links and a GET form, no JS needed. hidden = filters to carry across the form. */
export default function Pager({ page, last, href, action, hidden }: { page: number; last: number; href: (p: number) => string; action: string; hidden: Record<string, string> }) {
  if (last <= 1) return null;
  const btn = (p: number, label: React.ReactNode, ok: boolean, aria?: string) => ok
    ? <Link href={href(p)} scroll={false} className={live} aria-label={aria}>{label}</Link>
    : <span className={off} aria-disabled="true">{label}</span>;
  return (
    <nav aria-label="Pages" className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {btn(1, <>« <span className="ml-1 hidden sm:inline"><T k="proyekto.page.first" /></span></>, page > 1)}
      {btn(page - 1, <>‹ <span className="ml-1 hidden sm:inline"><T k="proyekto.page.prev" /></span></>, page > 1)}
      <ul className="flex flex-wrap items-center gap-1">
        {pageWindow(page, last).map((n, i) => n === "gap"
          ? <li key={`g${i}`} className="px-1 text-black/45" aria-hidden>…</li>
          : <li key={n}>{n === page
            ? <span aria-current="page" className={`${base} border-fiesta-navy bg-fiesta-navy text-white tabular-nums`}>{n}</span>
            : <Link href={href(n)} scroll={false} className={`${live} tabular-nums`}>{n}</Link>}</li>)}
      </ul>
      {btn(page + 1, <><span className="mr-1 hidden sm:inline"><T k="proyekto.page.next" /></span> ›</>, page < last)}
      {btn(last, <><span className="mr-1 hidden sm:inline"><T k="proyekto.page.last" /></span> »</>, page < last)}
      <form action={action} method="get" className="ml-2 flex items-center gap-2">
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <PageInput last={last} />
        <span className="text-sm text-black/60">/ {last.toLocaleString("en-PH")}</span>
      </form>
    </nav>
  );
}
