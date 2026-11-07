"use client";
import { useRef, useState } from "react";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { PatternFill, FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";
import { Badge } from "@/components/kit/Parts";
import { T } from "@/lib/i18n/i18n";
import type { HotlineCardData } from "@/components/kit/Ui";

type Tone = "emergency" | "medical" | "government" | "utility";
const LOOK: Record<Tone, { color: string; pattern: PatternKey; icon: KitIconName }> = {
  emergency: { color: FIESTA.red, pattern: "burst", icon: "alert" },
  medical: { color: FIESTA_DEEP.green, pattern: "dotblocks", icon: "health" },
  government: { color: FIESTA.blue, pattern: "mosaic", icon: "shield" },
  utility: { color: FIESTA_DEEP.orange, pattern: "peaks", icon: "bolt" },
};
const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

/** Hotline card in the site's look: category-coloured pattern strip with an icon badge and the place chip, name, a big call pill, copy and source pills, then verified / unconfirmed with the check date. */
export default function HotlineTile({ h, tone, where }: { h: HotlineCardData; tone: Tone; where?: string }) {
  const look = LOOK[tone];
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = async () => {
    try { await navigator.clipboard.writeText(h.number); } catch { return; }
    setDone(true); clearTimeout(timer.current); timer.current = setTimeout(() => setDone(false), 2000);
  };
  const pill = "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold";
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative isolate h-14 shrink-0" style={{ background: look.color }}>
        <PatternFill variant={look.pattern} colors={["#fff"]} opacity={0.16} />
        {where && <span className="absolute right-3 top-3 max-w-[70%] truncate rounded-full bg-black/30 px-2.5 py-1 text-xs font-semibold text-white">{where}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <span className="relative z-10 -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5"><KitIcon name={look.icon} color={look.color} className="h-7 w-7" /></span>
        <div>
          <p className="text-xs font-semibold tracking-widest text-black/65 uppercase"><T k={`cat.${tone}`} /></p>
          <p className="mt-0.5 font-serif text-lg font-bold leading-snug text-fiesta-navy">{h.name}</p>
        </div>
        <a href={tel(h.number)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-fiesta-navy px-4 font-serif text-lg font-bold whitespace-nowrap text-white hover:bg-fiesta-blue sm:text-xl"><KitIcon name="phone" className="h-5 w-5 shrink-0" />{h.number}</a>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={copy} aria-live="polite" className={`${pill} bg-fiesta-navy/5 hover:bg-fiesta-navy/10`}>{done ? <T k="common.copied" /> : <T k="common.copy" />}</button>
          <a href={h.source} rel="noopener" className={`${pill} text-fiesta-blue underline hover:bg-fiesta-mint`}><T k="common.source" /></a>
        </div>
        <p className="mt-auto flex flex-wrap items-center gap-2 text-xs text-black/65"><Badge kind={h.confirmed ? "verified" : "wip"}><T k={h.confirmed ? "common.verified" : "common.unconfirmed"} /></Badge><span><T k="common.checked" /> {h.verifiedAt}</span></p>
      </div>
    </div>
  );
}
