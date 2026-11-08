"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/lib/i18n/i18n";

/** ARIA tabs with arrow-key navigation. Panels come in as server-rendered nodes. */
export function Tabs({ tabs }: { tabs: { id: string; label: string; badge?: string; panel: React.ReactNode }[] }) {
  const t = useT();
  const [i, setI] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const ids = useRef(tabs.map((x) => x.id)); ids.current = tabs.map((x) => x.id);
  useEffect(() => { const go = () => { const k = ids.current.indexOf(location.hash.slice(1)); if (k >= 0) setI(k); }; go(); window.addEventListener("hashchange", go); return () => window.removeEventListener("hashchange", go); }, []);
  const go = (n: number) => { const k = (n + tabs.length) % tabs.length; setI(k); refs.current[k]?.focus(); };
  return (
    <div>
      <div role="tablist" aria-label={t("tab.label")} className="flex gap-1 overflow-x-auto border-b border-black/10">
        {tabs.map((tab, k) => (
          <button key={tab.id} ref={(el) => { refs.current[k] = el; }} role="tab" id={`${base}-t${k}`} aria-selected={i === k} aria-controls={`${base}-p${k}`} tabIndex={i === k ? 0 : -1}
            onClick={() => { setI(k); try { history.replaceState(null, "", "#" + tab.id); } catch { /* ignore */ } }} onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); else if (e.key === "ArrowLeft") go(i - 1); }}
            className={`min-h-11 shrink-0 border-b-4 px-4 text-sm font-semibold ${i === k ? "border-fiesta-orange text-fiesta-navy" : "border-transparent text-black/60 hover:text-fiesta-navy"}`}>{t(tab.label)}{tab.badge ? ` (${tab.badge})` : ""}</button>
        ))}
      </div>
      {tabs.map((tab, k) => <div key={tab.id} role="tabpanel" id={`${base}-p${k}`} aria-labelledby={`${base}-t${k}`} hidden={i !== k} className="pt-5">{tab.panel}</div>)}
    </div>
  );
}

/** Demo trigger for the toast: a polite live region that hides itself. */
export function ToastDemo() {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = () => { setMsg("Nakopya na ang numero."); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(""), 3000); };
  return (
    <>
      <button type="button" onClick={show} className="inline-flex min-h-11 items-center rounded-lg bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue">Kopyahin ang numero</button>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {msg && <p className="rounded-full bg-fiesta-navy px-5 py-3 text-sm font-semibold text-white shadow-lg">{msg}</p>}
      </div>
    </>
  );
}

/** Icon button that copies text. Fixed size, so nothing around it moves; on success the icon turns into a green check with a small pop and a ring, then returns after two seconds. */
export function CopyButton({ text, label = "common.copy", className = "" }: { text: string; label?: string; className?: string }) {
  const t = useT();
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setDone(true); clearTimeout(timer.current); timer.current = setTimeout(() => setDone(false), 2000);
  };
  const svg = "absolute inset-0 m-auto h-5 w-5 transition duration-200";
  return (
    <button type="button" onClick={copy} title={t(done ? "common.copied" : label)} aria-label={t(label)}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${done ? "bg-fiesta-green/20 text-[#1f6b37]" : "bg-fiesta-navy/5 text-fiesta-navy hover:bg-fiesta-navy/10"} ${className}`}>
      {done && <span aria-hidden className="copy-ring pointer-events-none absolute inset-0 rounded-xl ring-2 ring-fiesta-green" />}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`${svg} ${done ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" /></svg>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`${svg} ${done ? "copy-pop opacity-100" : "scale-50 opacity-0"}`}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      <span className="sr-only" role="status">{done ? t("common.copied") : ""}</span>
    </button>
  );
}
