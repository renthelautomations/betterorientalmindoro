"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { T, useT } from "@/lib/i18n/i18n";
import Dropdown from "./Dropdown";

/** GET form that re-submits when a select changes (typing in the search box still waits for Enter/Search). Works without JS through the Search button. */
export function AutoForm({ children, className }: { children: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <form
      action="/proyekto" method="get" role="search" className={className}
            onSubmit={(e) => { // soft navigation keeps the language choice; empty fields stay out of the URL
        e.preventDefault();
        const sp = new URLSearchParams();
        new FormData(e.currentTarget).forEach((v, k) => { if (typeof v === "string" && v.trim()) sp.set(k, v.trim()); });
        const s = sp.toString();
        router.push(s ? `/proyekto?${s}` : "/proyekto", { scroll: false });
      }}
    >
      {children}
    </form>
  );
}

/** Labelled branded dropdown with an "All" first option. Option text is published data, shown as is. */
export function Pick({ name, label, value, items }: { name: string; label: string; value?: string; items: { v: string; t: string }[] }) {
  const t = useT();
  const [v, setV] = useState(value ?? "");
  return (
    <div className="block min-w-0">
      <label htmlFor={`pick-${name}`} className="mb-1 block text-xs font-semibold uppercase tracking-widest text-black/60"><T k={label} /></label>
      <Dropdown id={`pick-${name}`} name={name} value={v} onChange={setV} form options={[{ v: "", t: t("proyekto.all") }, ...items]} />
    </div>
  );
}
