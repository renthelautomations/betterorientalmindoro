"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/i18n";
import { SCOPES, didYouMean, groupByType, pushRecent, rank, type Recent, type SearchItem, type SearchScope, type SearchType } from "@/lib/smart-search";

const BADGE: Record<SearchType, string> = { bayan: "bg-fiesta-blue text-white", serbisyo: "bg-fiesta-green text-white", hotline: "bg-[#a8281b] text-white", pahina: "bg-fiesta-navy text-white", kwento: "bg-fiesta-orange text-[#3a1608]", faq: "bg-fiesta-mint text-fiesta-navy" };
const load = (key: string): Recent[] => { try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; } };
const save = (key: string, l: Recent[]) => { try { localStorage.setItem(key, JSON.stringify(l)); } catch { /* private mode */ } };

function Mark({ text, q }: { text: string; q: string }) {
  const ws = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (!ws.length) return <>{text}</>;
  const re = new RegExp(`(${ws.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return <>{text.split(re).map((p, i) => (i % 2 ? <b key={i} className="rounded bg-fiesta-yellow/40 font-bold">{p}</b> : p))}</>;
}

/** Smart search. scope "all" (home) searches the whole site; any other scope searches only that page's own items, with its own quick picks, popular list and recent history. typo-tolerant, EN/FIL synonyms, results grouped by kind, recently opened and popular picks before typing, "did you mean", keyboard (/, arrows, Enter, Esc). */
export default function SmartSearch({ items, scope = "all", className = "max-w-xl" }: { items: SearchItem[]; scope?: SearchScope; className?: string }) {
  const cfg = SCOPES[scope];
  const wide = scope === "all";
  const t = useT();
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);
  const [recent, setRecent] = useState<Recent[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const titleOf = (i: { title: string; tk?: string }) => (i.tk ? t(i.tk) : i.title);
  const needle = q.trim();
  const hits = useMemo(() => (needle ? rank(items, needle, (i) => (i.tk ? t(i.tk) : i.title), 12) : []), [items, needle, t]);
  const popular = useMemo(() => items.filter((i) => i.pop).slice(0, 6), [items]);
  const fix = useMemo(() => (needle && hits.length < 3 ? didYouMean(items, needle, (i) => (i.tk ? t(i.tk) : i.title)) : undefined), [items, needle, hits.length, t]);
  // flat list the arrow keys walk through: results, or recent then popular
  const flat: SearchItem[] = needle ? hits : [...recent.map((r) => ({ ...r }) as SearchItem), ...popular.filter((p) => !recent.some((r) => r.href === p.href))];

  useEffect(() => setRecent(load(cfg.store)), [cfg.store]);
  useEffect(() => { setAct(0); }, [needle]);
  useEffect(() => {
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const slash = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !el.isContentEditable) { e.preventDefault(); input.current?.focus(); }
    };
    document.addEventListener("pointerdown", away); document.addEventListener("keydown", slash);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", slash); };
  }, []);

  const go = (h: SearchItem | Recent) => {
    const next = pushRecent(recent, { title: h.title, href: h.href, type: h.type, tk: h.tk });
    setRecent(next); save(cfg.store, next); setOpen(false);
    if (h.href.startsWith("tel:")) location.href = h.href; else router.push(h.href);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); if (flat.length) setAct((act + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % flat.length); }
    else if (e.key === "Enter") { e.preventDefault(); if (flat[act]) go(flat[act]); else if (needle && wide) router.push(`/proyekto?q=${encodeURIComponent(needle)}`); }
  };

  const row = (h: SearchItem, i: number) => (
    <li key={h.href + h.title} id={`${id}-o${i}`} role="option" aria-selected={i === act}>
      <button type="button" onClick={() => go(h)} onPointerMove={() => setAct(i)} className={`flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left ${i === act ? "bg-fiesta-mint" : ""}`}>
        {wide && <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[h.type]}`}>{t("search.t." + h.type)}</span>}
        <span className="min-w-0"><span className="block font-medium"><Mark text={titleOf(h)} q={needle} /></span>{h.sub && <span className="block text-xs text-black/65"><Mark text={h.sub} q={needle} /></span>}</span>
      </button>
    </li>
  );
  const head = (txt: string, extra?: React.ReactNode) => <li role="presentation" className="flex items-center justify-between px-4 pb-1 pt-3 text-xs font-semibold tracking-widest text-black/60 uppercase"><span>{txt}</span>{extra}</li>;

  let n = 0;
  return (
    <div ref={root} className={`relative ${className}`}>
      <label htmlFor={`${id}-in`} className="sr-only">{t(cfg.ph)}</label>
      <input ref={input} id={`${id}-in`} role="combobox" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && flat[act] ? `${id}-o${act}` : undefined} aria-autocomplete="list"
        type="search" value={q} autoComplete="off" placeholder={t(cfg.ph)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
        className="min-h-12 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-base outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
      <p className="mt-2 hidden px-2 text-xs text-black/60 md:block">{t(cfg.hint)}</p>
      {open && (
        <ul id={`${id}-list`} role="listbox" aria-label={t(cfg.ph)} className="absolute z-30 mt-2 max-h-[70vh] w-full overflow-auto rounded-2xl bg-white pb-2 shadow-xl ring-1 ring-black/10">
          {needle ? (
            hits.length ? (
              <>
                {groupByType(hits).map(([type, list]) => (
                  <li key={type} role="presentation"><ul role="group" aria-label={t("search.t." + type)}>{head(t("search.t." + type))}{list.map((h) => row(h, n++))}</ul></li>
                ))}
                {fix && <li role="presentation" className="px-4 pt-3 text-sm">{t("search.dym")} <button type="button" className="font-semibold text-fiesta-blue underline" onClick={() => setQ(fix)}>{fix}</button>?</li>}
              </>
            ) : (
              <li role="presentation" className="px-4 py-4 text-sm text-black/70">{t("search.none")} “{needle}”.{fix && <> {t("search.dym")} <button type="button" className="font-semibold text-fiesta-blue underline" onClick={() => setQ(fix)}>{fix}</button>?</>}</li>
            )
          ) : (
            <>
              {recent.length > 0 && <li role="presentation"><ul role="group" aria-label={t("search.recent")}>{head(t("search.recent"), <button type="button" className="font-semibold normal-case tracking-normal text-fiesta-blue underline" onClick={() => { setRecent([]); save(cfg.store, []); }}>{t("search.clear")}</button>)}{recent.map((r) => row(r as SearchItem, n++))}</ul></li>}
              <li role="presentation"><ul role="group" aria-label={t("search.popular")}>{head(t("search.popular"))}{popular.filter((p) => !recent.some((r) => r.href === p.href)).map((p) => row(p, n++))}</ul></li>
              <li role="presentation" className="flex flex-wrap items-center gap-2 px-4 pt-3 text-sm"><span className="text-black/65">{t("search.try")}:</span>{cfg.quick.map((k) => <button key={k} type="button" onClick={() => { setQ(t("search.q." + k)); input.current?.focus(); }} className="min-h-9 rounded-full border-2 border-fiesta-navy/20 px-3 font-semibold text-fiesta-navy hover:border-fiesta-navy">{t("search.q." + k)}</button>)}</li>
            </>
          )}
          {needle && wide && <li role="presentation" className="mt-1 border-t border-black/10 px-2 pt-2"><a href={`/proyekto?q=${encodeURIComponent(needle)}`} className="flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-fiesta-blue hover:bg-fiesta-mint">{t("search.projects")} “{needle}” →</a></li>}
        </ul>
      )}
    </div>
  );
}
