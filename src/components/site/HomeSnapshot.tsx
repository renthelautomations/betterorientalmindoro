import Link from "next/link";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { PatternFill, FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import LiveWeather from "./LiveWeather";
import { T } from "@/lib/i18n/i18n";

export type SnapshotFact = { icon: KitIconName; value: string; label: string; hint?: React.ReactNode };
const TONE = [FIESTA.blue, FIESTA_DEEP.green, FIESTA_DEEP.orange, FIESTA.navy];

/** Province at a glance: a patterned sky card with live weather for the capital, beside four coloured fact tiles. Same family as the service and pillar cards. */
export default function HomeSnapshot({ facts }: { facts: SnapshotFact[] }) {
  return (
    <section aria-labelledby="snap-h" className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
      <div className="flex flex-col overflow-hidden rounded-3xl text-white shadow-sm" style={{ background: FIESTA_DEEP.sky }}>
        <div className="relative h-12 shrink-0" aria-hidden><PatternFill variant="wave" colors={["#fff"]} opacity={0.18} /></div>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <p id="snap-h" className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"><T k="home.snap.h" /></p>
          <div className="mt-5 flex flex-1 flex-col"><LiveWeather /></div>
          <p className="mt-5 text-xs text-white"><T k="common.source" />: Open-Meteo</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <dl className="grid flex-1 grid-cols-2 gap-4">
          {facts.map((f, i) => (
            <div key={f.label} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs font-semibold tracking-widest text-black/60 uppercase"><T k={f.label} /></dt>
                <KitIcon name={f.icon} variant="duo" color={TONE[i % TONE.length]} className="h-7 w-7 shrink-0" />
              </div>
              <dd className="mt-3 font-serif text-4xl font-bold tabular-nums sm:text-5xl" style={{ color: TONE[i % TONE.length] }}>{f.value}</dd>
              <p className="mt-1 text-sm text-black/65">{f.hint ?? "\u00a0"}</p>
            </div>
          ))}
        </dl>
        <Link href="/estatistika" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-fiesta-navy px-6 text-sm font-semibold text-white hover:bg-fiesta-blue"><T k="home.snap.more" /><KitIcon name="arrow" color="#fff" className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
