"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { TF } from "@/components/site/DynBits";
import { T } from "@/lib/i18n/i18n";
import { posKey } from "@/components/site/dynKeys";
import { SEATS, surnameStory, type Holder } from "@/lib/dyn-surname";

export type SurnameCard = { surname: string; label: string; seats: number; people: number; holders: Holder[] };
const DOT: Record<string, string> = { MAYOR: "bg-fiesta-navy", "VICE MAYOR": "bg-fiesta-orange", COUNCILOR: "bg-fiesta-blue" };

function Detail({ c, names }: { c: SurnameCard; names: Record<string, string> }) {
  const s = surnameStory(c.holders);
  const maxT = Math.max(...s.byTown.map((t) => t.n), 1);
  return (
    <div className="space-y-6 px-5 pb-6 pt-1">
      <p className="text-xs text-black/65"><T k="dyn.sur.note" /></p>

      <figure>
        <figcaption className="text-sm font-semibold text-fiesta-navy"><T k="dyn.sur.byyear" /></figcaption>
        <ul className="mt-3 flex h-32 items-end gap-2 sm:gap-3">
          {s.byYear.map((y) => {
            const total = SEATS.reduce((a, k) => a + y[k], 0);
            return (
              <li key={y.year} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center" title={`${y.year}: ${total}`}>
                <span className="text-xs font-bold tabular-nums text-fiesta-navy">{total}</span>
                <span className="mt-1 flex flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${(total / s.maxYear) * 78}%` }}>
                  {SEATS.map((k) => y[k] > 0 && <span key={k} className={DOT[k]} style={{ flex: y[k] }} />)}
                </span>
                <span className="mt-1 text-[10px] tabular-nums text-black/65">{y.year}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/70">{SEATS.map((k) => <span key={k} className="inline-flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${DOT[k]}`} aria-hidden /><T k={posKey(k)} /></span>)}</p>
      </figure>

      {s.byTown.length > 1 && (
        <div>
          <p className="text-sm font-semibold text-fiesta-navy"><T k="dyn.sur.bytown" /></p>
          <ul className="mt-2 space-y-1.5">
            {s.byTown.map((t) => (
              <li key={t.town} className="flex items-center gap-3 text-sm">
                <Link href={`/dynasties/${t.town}`} className="w-28 shrink-0 font-medium text-fiesta-blue underline sm:w-36">{names[t.town] ?? t.town}</Link>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-orange" style={{ width: `${(t.n / maxT) * 100}%` }} /></span>
                <span className="w-6 text-right font-bold tabular-nums">{t.n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-fiesta-navy"><T k="dyn.sur.bypeople" /></p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {s.people.map((p) => (
            <li key={p.id} className="rounded-xl bg-fiesta-cream p-3">
              <p className="font-semibold leading-snug text-fiesta-navy">{p.name}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {p.wins.map((w) => (
                  <li key={`${w.town}${w.year}${w.position}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs shadow-sm">
                    <i className={`h-2 w-2 rounded-full ${DOT[w.position] ?? "bg-black/30"}`} aria-hidden />
                    <b className="tabular-nums">{w.year}</b><span className="text-black/70"><T k={posKey(w.position)} /> · {names[w.town] ?? w.town}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Repeated-surname cards. Opening one makes it span the full width at the top with a short grow animation; the others drop below. Detail: wins per election by seat, wins per town, and each person's wins. All detail is in the page; closed cards just hide it. */
export default function SurnameCards({ cards, names }: { cards: SurnameCard[]; names: Record<string, string> }) {
  const max = Math.max(...cards.map((c) => c.seats), 1);
  const [open, setOpen] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLLIElement | null>>({});
  const toggle = (k: string) => {
    const next = open === k ? null : k;
    setOpen(next);
    if (next) requestAnimationFrame(() => refs.current[next]?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" }));
  };
  return (
    <ul className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${open ? "items-start" : "auto-rows-fr"}`}>
      {cards.map((c) => {
        const on = open === c.surname;
        const byPos = SEATS.map((p) => [p, c.holders.filter((h) => h.position === p).length] as const).filter(([, n]) => n);
        return (
          <li key={c.surname} ref={(el) => { refs.current[c.surname] = el; }} className={`flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow ${on ? "order-first col-span-full shadow-lg sm:col-span-2 lg:col-span-3" : ""}`}>
            <button type="button" aria-expanded={on} aria-controls={`sur-${c.surname}`} onClick={() => toggle(c.surname)} className="flex w-full flex-1 flex-col gap-3 rounded-2xl p-4 text-left hover:bg-fiesta-cream/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
              <span className="flex items-center justify-between gap-3">
                <span className={`font-serif font-bold text-fiesta-navy transition-all ${on ? "text-3xl" : "text-xl"}`}>{c.label}</span>
                <span className="shrink-0 rounded-full bg-fiesta-orange/15 px-3 py-1 text-sm font-bold text-[#8a3a18]"><TF k="dyn.sur.wins" v={[c.seats]} /></span>
              </span>
              <span className="h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-orange transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.max((c.seats / max) * 100, 6)}%` }} /></span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/70">
                <span className="font-semibold text-fiesta-navy"><TF k="dyn.sur.people" v={[c.people]} /></span>
                {byPos.map(([p, n]) => <span key={p} className="inline-flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${DOT[p]}`} aria-hidden /><T k={posKey(p)} /> ×{n}</span>)}
                <svg viewBox="0 0 24 24" className={`ml-auto h-4 w-4 shrink-0 text-fiesta-blue transition ${on ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </button>
            <div id={`sur-${c.surname}`} role="region" aria-label={c.label} className={`grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} {...(on ? {} : { inert: true })}>
              <div className="overflow-hidden"><Detail c={c} names={names} /></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
