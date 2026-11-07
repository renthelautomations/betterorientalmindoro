"use client";
import { useRouter } from "next/navigation";
import { T } from "@/lib/i18n/i18n";

/** GET form that re-submits when a select changes (typing in the search box still waits for Enter/Search). Works without JS through the Search button. */
export function AutoForm({ children, className }: { children: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <form
      action="/proyekto" method="get" role="search" className={className}
      onChange={(e) => { if (e.target instanceof HTMLSelectElement) e.currentTarget.requestSubmit(); }}
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

/** Labelled dropdown with an "All" first option. Option text is published data, shown as is. */
export function Pick({ name, label, value, items }: { name: string; label: string; value?: string; items: { v: string; t: string }[] }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-black/60"><T k={label} /></span>
      <select name={name} defaultValue={value ?? ""} className="min-h-11 w-full rounded-lg border border-black/25 bg-white px-3 text-sm focus:border-fiesta-blue focus:outline-none focus:ring-2 focus:ring-fiesta-blue/25">
        <option value=""><T k="proyekto.all" /></option>
        {items.map((i) => <option key={i.v} value={i.v}>{i.t}</option>)}
      </select>
    </label>
  );
}
