"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";

const pill = (on: boolean) => `inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-5 text-sm font-semibold transition ${on ? "border-fiesta-navy bg-fiesta-navy text-white" : "border-black/15 bg-white text-fiesta-navy hover:border-fiesta-navy"}`;

/** Province / town switch. Town list is an overlay popover so opening it never moves the page. */
export default function DynSwitch({ current, towns }: { current: string | null; towns: { slug: string; name: string }[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const cur = towns.find((x) => x.slug === current);
  return (
    <nav aria-label={t("dyn.sw.aria")} className="relative flex flex-wrap items-center gap-2">
      <Link href="/dynasties" aria-current={current ? undefined : "page"} className={pill(!current)}><T k="dyn.province" /></Link>
      <div ref={box} className="sm:relative">
        <button type="button" aria-expanded={open} aria-controls="dyn-towns" onClick={() => setOpen((o) => !o)} className={pill(!!cur)}>
          {cur ? cur.name : t("dyn.sw.pick")}
          <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {open && (
          <ul id="dyn-towns" className="absolute left-0 right-0 top-full z-30 mt-2 grid max-h-[70vh] grid-cols-2 gap-1 overflow-y-auto rounded-2xl border border-black/10 bg-white p-2 shadow-xl sm:right-auto sm:w-[30rem] sm:grid-cols-3">
            {towns.map((x) => (
              <li key={x.slug}>
                <Link href={`/dynasties/${x.slug}`} onClick={() => setOpen(false)} aria-current={x.slug === current ? "page" : undefined}
                  className={`block min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium ${x.slug === current ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-cream"}`}>{x.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
