"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type SearchItem = { type: "bayan" | "serbisyo" | "hotline"; title: string; sub?: string; href: string };
const BADGE = { bayan: "bg-fiesta-blue text-white", serbisyo: "bg-fiesta-green text-white", hotline: "bg-fiesta-red text-white" } as const;
const LABEL = { bayan: "Bayan", serbisyo: "Serbisyo", hotline: "Hotline" } as const;

/** One box for towns, services and hotlines. Enter opens the first match. Matching is plain substring, case-insensitive. */
export default function SiteSearch({ items }: { items: SearchItem[] }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((i) => (i.title + " " + (i.sub ?? "")).toLowerCase().includes(t)).slice(0, 8) : [];
  }, [q, items]);
  const open = (h?: SearchItem) => { if (!h) return; if (h.href.startsWith("tel:")) location.href = h.href; else router.push(h.href); };
  return (
    <div className="relative max-w-xl">
      <label htmlFor="site-search" className="sr-only">Maghanap ng bayan, serbisyo o hotline</label>
      <input id="site-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") open(hits[0]); }} placeholder="Maghanap ng bayan, serbisyo o hotline…" autoComplete="off" aria-controls="site-search-results"
        className="min-h-12 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-base outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
      <div id="site-search-results" aria-live="polite">
        {q.trim() && (
          <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
            {hits.length ? hits.map((h) => (
              <li key={h.href + h.title}>
                <a href={h.href} className="flex min-h-12 items-center gap-3 px-4 py-2 hover:bg-fiesta-mint">
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[h.type]}`}>{LABEL[h.type]}</span>
                  <span className="min-w-0"><span className="block truncate font-medium">{h.title}</span>{h.sub && <span className="block truncate text-xs text-black/60">{h.sub}</span>}</span>
                </a>
              </li>
            )) : <li className="px-4 py-4 text-sm text-black/60">Walang tugma sa “{q}”.</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
