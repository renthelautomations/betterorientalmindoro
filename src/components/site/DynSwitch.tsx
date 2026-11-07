import Link from "next/link";

/** Province / town switch: plain links. Current view is marked with aria-current. */
export default function DynSwitch({ current, towns }: { current: string | null; towns: { slug: string; name: string }[] }) {
  const pill = (on: boolean) => `inline-flex min-h-11 items-center rounded-full border-2 px-5 text-sm font-semibold ${on ? "border-fiesta-navy bg-fiesta-navy text-white" : "border-black/20 bg-white text-fiesta-navy hover:border-fiesta-navy"}`;
  const cur = towns.find((t) => t.slug === current);
  return (
    <nav aria-label="Lalawigan o bayan" className="flex flex-wrap items-center gap-2">
      <Link href="/dynasties" aria-current={current ? undefined : "page"} className={pill(!current)}>Buong lalawigan</Link>
      {cur && <span aria-current="page" className={pill(true)}>{cur.name}</span>}
      <details className="relative">
        <summary className={`${pill(false)} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>{cur ? "Ibang bayan" : "Pumili ng bayan"}</summary>
        <ul className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-black/10 bg-white p-3 sm:grid-cols-3">
          {towns.filter((t) => t.slug !== current).map((t) => <li key={t.slug}><Link href={`/dynasties/${t.slug}`} className="block min-h-11 rounded-lg px-2 py-2.5 text-sm font-medium text-fiesta-blue underline">{t.name}</Link></li>)}
        </ul>
      </details>
    </nav>
  );
}
