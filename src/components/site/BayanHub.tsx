"use client";
import { useState } from "react";
import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import { fmtInt } from "@/lib/stats";
import type { BayanSummary } from "@/lib/bayan";

/** Map on the left, preview panel on the right. The plain list under the page remains the keyboard/no-WebGL path. */
export default function BayanHub({ slugs, summaries }: { slugs: Record<string, string>; summaries: Record<string, BayanSummary> }) {
  const [sel, setSel] = useState<string | null>(null);
  const s = sel ? summaries[sel] : undefined;
  const row = (k: string, v: string) => <div className="flex items-baseline justify-between gap-4 border-b border-black/10 py-2"><dt className="text-sm text-black/65">{k}</dt><dd className="font-serif text-xl font-bold tabular-nums text-fiesta-navy">{v}</dd></div>;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="min-w-0"><MapLoader slugs={slugs} onSelect={setSel} selected={sel} /></div>
      <aside aria-live="polite" className="self-start rounded-2xl border border-black/10 bg-white p-5">
        {s ? (
          <>
            <h2 className="font-serif text-2xl font-bold">{s.name}</h2>
            <dl className="mt-3">
              {row("Populasyon", fmtInt(s.population))}
              {row("Barangay", fmtInt(s.barangays))}
              {row("Hotline ng bayan", s.hotlineCount == null ? "-" : String(s.hotlineCount))}
              {row("Proyekto ng DPWH", s.projectCount ? fmtInt(s.projectCount) : "-")}
            </dl>
            {s.hotlineCount == null && <p className="mt-2 text-xs text-black/60">Walang naitalang hotline ng bayan; may numero ng lalawigan sa Tulong.</p>}
            <Link href={`/bayan/${s.slug}`} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue">Buksan</Link>
          </>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-bold">Pumili ng bayan</h2>
            <p className="mt-2 text-sm text-black/65">Ituro o pindutin ang isang bayan sa mapa para makita ang buod nito. Maaari ring pumili sa listahan sa ibaba.</p>
          </>
        )}
      </aside>
    </div>
  );
}
