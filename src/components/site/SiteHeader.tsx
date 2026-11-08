"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Logo from "@/components/Logo";
import KitIcon from "@/components/kit/KitIcon";
import MenuEmblem from "./MenuEmblem";
import { LangToggle, T, useT } from "@/lib/i18n/i18n";
import type { MenuItem, NavEntry } from "./nav";

const STRIPE = "repeating-linear-gradient(90deg,#e8552d 0 24px,#3aa65b 24px 48px,#4aa3d8 48px 72px,#f4b92e 72px 96px)";

const linkCls = "inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-medium hover:bg-fiesta-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue";

/** Sticky site header: logo, nav, language toggle. Groups open a mega menu on hover, focus or tap; below the lg breakpoint a native menu lists everything. */
export default function SiteHeader({ entries, extra }: { entries: NavEntry[]; extra?: ReactNode }) {
  const t = useT();
  const path = usePathname();
  const [open, setOpen] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLElement>(null);
  const active = (e: NavEntry) => e.match.some((m) => path === m || path.startsWith(m + "/"));

  useEffect(() => setOpen(null), [path]);
  useEffect(() => {
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); clearTimeout(timer.current); };
  }, []);
  const enter = (i: number) => { clearTimeout(timer.current); setOpen(i); };
  const leave = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(null), 140); };

  return (
    <header ref={root} className="relative bg-fiesta-cream" onMouseLeave={leave} onMouseEnter={() => clearTimeout(timer.current)} onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) setOpen(null); }}>
      <div className="h-1.5" style={{ background: STRIPE }} aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="better Oriental Mindoro home"><Logo /></Link>
        <nav aria-label="Main" className="hidden gap-1 lg:flex">
          {entries.map((e, i) => {
            const on = active(e);
            const cur = on ? "text-fiesta-navy underline decoration-fiesta-orange decoration-2 underline-offset-8" : "";
            return e.menu ? (
              <div key={e.label} className="relative" onMouseEnter={() => enter(i)}>
                <button type="button" aria-expanded={open === i} aria-controls={`mega-${i}`} onClick={() => setOpen(open === i ? null : i)}
                  onKeyDown={(k) => { if (k.key === "ArrowDown") { k.preventDefault(); setOpen(i); } }} className={`${linkCls} ${cur}`}>
                  <T k={e.label} /><KitIcon name="arrow" className={`h-3.5 w-3.5 rotate-90 text-fiesta-blue transition ${open === i ? "-rotate-90" : ""}`} />
                </button>
              </div>
            ) : (
              <Link key={e.label} href={e.href!} className={`${linkCls} ${cur}`} aria-current={on ? "page" : undefined} onMouseEnter={() => setOpen(null)}><T k={e.label} /></Link>
            );
          })}
        </nav>
        <div className="ml-auto mr-2 flex items-center gap-2 lg:ml-4 lg:mr-0">{extra}<LangToggle /></div>
        <details className="group relative lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-fiesta-navy/5 [&::-webkit-details-marker]:hidden" aria-label={t("menu.open")}><KitIcon name="menu" /></summary>
          <ul className="absolute right-0 z-50 mt-2 max-h-[80vh] w-72 overflow-auto rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/10">
            {entries.map((e) => (
              <li key={e.label}>
                {e.href ? <Link href={e.href} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-mint"><T k={e.label} /></Link>
                  : <p className="px-3 pb-1 pt-3 text-xs font-semibold tracking-widest text-black/65 uppercase"><T k={e.label} /></p>}
                {e.menu && e.menu.items.length <= 6 && (
                  <ul className="mb-1 ml-3 border-l border-black/10 pl-2">
                    {e.menu.items.map((m) => <li key={m.href}><Link href={m.href} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-fiesta-mint"><T k={m.label} /></Link></li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </details>
      </div>

      {open !== null && entries[open]?.menu && (() => {
        const m = entries[open].menu!;
        return (
          <div id={`mega-${open}`} role="region" aria-label={t(entries[open].label)} className="absolute inset-x-0 top-full z-50 hidden border-t border-black/10 bg-fiesta-cream shadow-xl lg:block">
            <div className="mx-auto max-w-6xl px-4 py-6">
              <ul className="grid gap-4" style={{ gridTemplateColumns: `repeat(${m.cols}, minmax(0, 1fr))`, gridAutoRows: "1fr" }}>
                {m.items.map((it) => (
                  <li key={it.href} className="min-w-0">
                    <Link href={it.href} onClick={() => setOpen(null)} className="group flex h-full min-h-[7rem] items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
                      <MenuEmblem index={it.n} />
                      <span className="min-w-0">
                        <span className="line-clamp-2 block font-serif text-lg font-bold leading-tight text-fiesta-navy"><T k={it.label} /></span>
                        {it.desc && <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-black/70"><T k={it.desc} /></span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {m.all && <p className="mt-4 text-right"><Link href={m.all.href} onClick={() => setOpen(null)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-fiesta-blue underline-offset-4 hover:underline"><T k={m.all.label} /><KitIcon name="arrow" className="h-4 w-4" /></Link></p>}
            </div>
          </div>
        );
      })()}
    </header>
  );
}
