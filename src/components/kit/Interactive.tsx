"use client";
import { useId, useRef, useState } from "react";

/** ARIA tabs with arrow-key navigation. Panels come in as server-rendered nodes. */
export function Tabs({ tabs }: { tabs: { id: string; label: string; panel: React.ReactNode }[] }) {
  const [i, setI] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (n: number) => { const k = (n + tabs.length) % tabs.length; setI(k); refs.current[k]?.focus(); };
  return (
    <div>
      <div role="tablist" aria-label="Seksyon" className="flex gap-1 overflow-x-auto border-b border-black/10">
        {tabs.map((t, k) => (
          <button key={t.id} ref={(el) => { refs.current[k] = el; }} role="tab" id={`${base}-t${k}`} aria-selected={i === k} aria-controls={`${base}-p${k}`} tabIndex={i === k ? 0 : -1}
            onClick={() => setI(k)} onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); else if (e.key === "ArrowLeft") go(i - 1); }}
            className={`min-h-11 shrink-0 border-b-4 px-4 text-sm font-semibold ${i === k ? "border-fiesta-orange text-fiesta-navy" : "border-transparent text-black/60 hover:text-fiesta-navy"}`}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t, k) => <div key={t.id} role="tabpanel" id={`${base}-p${k}`} aria-labelledby={`${base}-t${k}`} hidden={i !== k} className="pt-5">{t.panel}</div>)}
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

/** Copies text, then says so for two seconds. */
export function CopyButton({ text, label = "Kopyahin" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setDone(true); clearTimeout(timer.current); timer.current = setTimeout(() => setDone(false), 2000);
  };
  return (
    <button type="button" onClick={copy} aria-live="polite" className="inline-flex min-h-11 items-center rounded-lg border-2 border-fiesta-navy/20 px-4 text-sm font-semibold hover:border-fiesta-navy">{done ? "Nakopya ✓" : label}</button>
  );
}
