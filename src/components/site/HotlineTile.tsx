"use client";
import { useRef, useState } from "react";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { Badge } from "@/components/kit/Parts";
import { T } from "@/lib/i18n/i18n";
import type { HotlineCardData } from "@/components/kit/Ui";

type Tone = "emergency" | "medical" | "government" | "utility";
const LOOK: Record<Tone, { color: string; icon: KitIconName }> = {
  emergency: { color: FIESTA.red, icon: "alert" },
  medical: { color: FIESTA_DEEP.green, icon: "health" },
  government: { color: FIESTA.blue, icon: "shield" },
  utility: { color: FIESTA_DEEP.orange, icon: "bolt" },
};
const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

/** Clean hotline card: a small tinted icon with the category and place chip, the name, a big call pill, quiet copy and source buttons, then verified / unconfirmed with the check date. No pattern, so a grid of them stays calm. */
export default function HotlineTile({ h, tone, where }: { h: HotlineCardData; tone: Tone; where?: string }) {
  const look = LOOK[tone];
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = async () => {
    try { await navigator.clipboard.writeText(h.number); } catch { return; }
    setDone(true); clearTimeout(timer.current); timer.current = setTimeout(() => setDone(false), 2000);
  };
  const pill = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold";
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${look.color}1a` }}><KitIcon name={look.icon} color={look.color} className="h-5 w-5" /></span>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold tracking-widest text-black/65 uppercase"><T k={`cat.${tone}`} /></p>
        {where && <span className="max-w-[55%] shrink-0 truncate rounded-full bg-fiesta-cream px-2.5 py-1 text-xs font-semibold text-fiesta-navy">{where}</span>}
      </div>
      <p className="font-serif text-lg font-bold leading-snug text-fiesta-navy">{h.name}</p>
      <a href={tel(h.number)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-fiesta-navy px-4 font-serif text-lg font-bold whitespace-nowrap text-white hover:bg-fiesta-blue sm:text-xl"><KitIcon name="phone" className="h-5 w-5 shrink-0" />{h.number}</a>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={copy} aria-live="polite" className={`${pill} bg-fiesta-navy/5 text-fiesta-navy hover:bg-fiesta-navy/10`}>{done ? <T k="common.copied" /> : <T k="common.copy" />}</button>
        <a href={h.source} rel="noopener" className={`${pill} text-fiesta-blue hover:bg-fiesta-mint`}><T k="common.source" /><KitIcon name="arrow" className="h-4 w-4 -rotate-45" /></a>
      </div>
      <p className="mt-auto flex flex-wrap items-center gap-2 border-t border-black/5 pt-3 text-xs text-black/65"><Badge kind={h.confirmed ? "verified" : "wip"}><T k={h.confirmed ? "common.verified" : "common.unconfirmed"} /></Badge><span><T k="common.checked" /> {h.verifiedAt}</span></p>
    </div>
  );
}
