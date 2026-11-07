"use client";
import { useEffect, useSyncExternalStore } from "react";
import { DICT } from "./dict";

// EN / FIL without a library. The choice lives in localStorage; useSyncExternalStore keeps server HTML (FIL) and
// first client paint identical, then switches. No cookies, so pages stay static.
export type Lang = "en" | "fil";
const KEY = "bom-lang";
const listeners = new Set<() => void>();
const read = (): Lang => { try { return localStorage.getItem(KEY) === "en" ? "en" : "fil"; } catch { return "fil"; } };
export function setLang(l: Lang) { try { localStorage.setItem(KEY, l); } catch { /* private mode: still switch for this session via listeners */ } listeners.forEach((f) => f()); }
const subscribe = (f: () => void) => { listeners.add(f); addEventListener("storage", f); return () => { listeners.delete(f); removeEventListener("storage", f); }; };
export const useLang = (): Lang => useSyncExternalStore(subscribe, read, () => "fil");


/** Dictionary value for the current language; unknown keys come back unchanged, so plain strings can pass through. */
export function useT() {
  const lang = useLang();
  return (k: string): string => { const e = (DICT as Record<string, readonly [string, string]>)[k]; return e ? e[lang === "en" ? 0 : 1] : k; };
}
export function T({ k }: { k: string }) { return <>{useT()(k)}</>; }

/** EN | FIL switch. Also keeps <html lang> in step. */
export function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const btn = (l: Lang, label: string) => (
    <button type="button" onClick={() => setLang(l)} aria-pressed={lang === l} lang={l} className={`min-h-9 min-w-11 rounded-full px-3 text-xs font-bold tracking-wide ${lang === l ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`}>{label}</button>
  );
  return <div role="group" aria-label="Language / Wika" className={`inline-flex items-center rounded-full bg-fiesta-navy/5 p-0.5 ${className}`}>{btn("en", "EN")}{btn("fil", "FIL")}</div>;
}
