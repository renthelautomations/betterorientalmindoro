import Link from "next/link";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import LiveWeather from "./LiveWeather";
import { T } from "@/lib/i18n/i18n";

export type SnapshotFact = { icon: KitIconName; value: string; label: string; hint?: React.ReactNode };

/** Province at a glance: live weather for the capital, then four plain facts. Dark card with the weather as the headline, as on a town portal. */
export default function HomeSnapshot({ facts }: { facts: SnapshotFact[] }) {
  return (
    <section aria-labelledby="snap-h" className="overflow-hidden rounded-3xl bg-fiesta-navy text-white">
      <div className="p-6 sm:p-8">
        <p id="snap-h" className="flex items-center gap-2 text-sm font-semibold tracking-widest text-fiesta-yellow uppercase"><KitIcon name="weather" color="#f4b92e" className="h-5 w-5" /><T k="home.snap.h" /></p>
        <div className="mt-5"><LiveWeather /></div>
        <p className="mt-3 text-xs text-white/70"><T k="common.source" />: Open-Meteo</p>
      </div>
      <dl className="grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
        {facts.map((f, i) => (
          <div key={f.label} className={`flex flex-col items-center gap-1 px-4 py-7 text-center ${i % 2 ? "border-l border-white/10" : ""} ${i > 0 ? "lg:border-l lg:border-white/10" : ""} ${i > 1 ? "border-t border-white/10 lg:border-t-0" : ""}`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15"><KitIcon name={f.icon} color="#fff" className="h-6 w-6" /></span>
            <dd className="mt-2 font-serif text-4xl font-bold tabular-nums">{f.value}</dd>
            <dt className="text-sm font-semibold"><T k={f.label} /></dt>
            {f.hint && <p className="text-xs text-white/75">{f.hint}</p>}
          </div>
        ))}
      </dl>
      <div className="border-t border-white/10 px-6 py-4 text-center">
        <Link href="/estatistika" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold tracking-widest text-fiesta-yellow uppercase hover:underline"><T k="home.snap.more" /><KitIcon name="arrow" color="#f4b92e" className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
