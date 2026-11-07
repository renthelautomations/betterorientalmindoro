"use client";
import { useEffect, useId, useRef, useState } from "react";
import KitIcon from "@/components/kit/KitIcon";

export type DropdownOption = { v: string; t: string };

/** Branded listbox replacing the native <select>: same value/onChange idea, keyboard (arrows, Home/End, Enter, Esc, type-ahead), and a hidden input when `name` is given so plain GET forms keep working. */
export default function Dropdown({ id, name, value, options, onChange, className = "", ariaLabel, form }: {
  id?: string; name?: string; value: string; options: DropdownOption[]; onChange: (v: string) => void; className?: string; ariaLabel?: string; form?: boolean;
}) {
  const auto = useId();
  const bid = id ?? auto;
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ s: "", t: 0 });
  const cur = Math.max(0, options.findIndex((o) => o.v === value));

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  useEffect(() => { if (open) list.current?.children[act]?.scrollIntoView({ block: "nearest" }); }, [open, act]);

  const pick = (i: number) => {
    const o = options[i]; if (!o) return;
    if (hidden.current) hidden.current.value = o.v;
    setOpen(false); onChange(o.v);
    if (form) hidden.current?.form?.requestSubmit();
    root.current?.querySelector("button")?.focus();
  };
  const show = () => { setAct(cur); setOpen(true); };
  const key = (e: React.KeyboardEvent) => {
    const n = options.length;
    if (e.key === "Escape") { if (open) { e.preventDefault(); setOpen(false); } return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      if (!open) return show();
      setAct(e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (act + (e.key === "ArrowDown" ? 1 : -1) + n) % n);
    } else if ((e.key === "Enter" || e.key === " ") && open) { e.preventDefault(); pick(act); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && e.key !== " ") {
      const now = Date.now(); typed.current.s = now - typed.current.t > 700 ? e.key : typed.current.s + e.key; typed.current.t = now;
      const i = options.findIndex((o) => o.t.toLowerCase().startsWith(typed.current.s.toLowerCase()));
      if (i >= 0) { if (open) setAct(i); else pick(i); }
    }
  };

  return (
    <div ref={root} className={`relative ${className}`} onKeyDown={key}>
      {name && <input ref={hidden} type="hidden" name={name} defaultValue={value} />}
      <button id={bid} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${bid}-list`} aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : show())}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border-2 border-fiesta-navy/20 bg-white px-3 text-left text-sm font-semibold text-fiesta-navy outline-none transition hover:border-fiesta-navy/50 focus-visible:border-fiesta-blue focus-visible:ring-4 focus-visible:ring-fiesta-blue/20 aria-expanded:border-fiesta-blue">
        <span className="min-w-0 flex-1 truncate">{options[cur]?.t}</span>
        <KitIcon name="arrow" className={`h-4 w-4 shrink-0 text-fiesta-blue transition ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>
      {open && (
        <ul ref={list} id={`${bid}-list`} role="listbox" aria-activedescendant={`${bid}-o${act}`} tabIndex={-1}
          className="absolute left-0 right-0 z-40 mt-1.5 max-h-72 min-w-max overflow-auto rounded-xl border-2 border-fiesta-navy/15 bg-white p-1.5 shadow-xl">
          {options.map((o, i) => (
            <li key={o.v} id={`${bid}-o${i}`} role="option" aria-selected={o.v === value}
              onPointerDown={(e) => e.preventDefault()} onClick={() => pick(i)} onPointerMove={() => setAct(i)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-sm ${o.v === value ? "font-bold text-fiesta-navy" : "font-medium text-black/80"} ${i === act ? "bg-fiesta-mint" : ""}`}>
              <span>{o.t}</span>{o.v === value && <KitIcon name="check" className="h-4 w-4 shrink-0 text-fiesta-blue" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
