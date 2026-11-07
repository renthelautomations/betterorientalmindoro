"use client";
import { useMemo, useState } from "react";
import KitIcon from "@/components/kit/KitIcon";
import { fold } from "@/lib/smart-search";
import { useT } from "@/lib/i18n/i18n";
import type { Official } from "@/lib/gov";

// ponytail: only Calapan numbers (7 digits) get the 043 area code; others dial as published.
const tel = (n: string, where: string | null) => "tel:" + (/calapan/i.test(where ?? "") && n.replace(/\D/g, "").length === 7 ? "+6343" : "") + n.replace(/[^\d+]/g, "");
const pill = (on: boolean) => `inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;

/** Searchable list of offices (with call and email) and department heads. Text is exactly as published; a missing number or email is simply not shown. */
export default function GovOfficeList({ items }: { items: Official[] }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"office" | "department-head">("office");
  const n = (k: string) => items.filter((o) => o.kind === k).length;
  const needle = fold(q.trim());
  const rows = useMemo(() => items.filter((o) => o.kind === cat && (!needle || fold(`${o.name} ${o.position ?? ""} ${o.office ?? ""} ${o.location ?? ""}`).includes(needle))), [items, cat, needle]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 basis-60"><span className="sr-only">{t("govc.of.search")}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" placeholder={t("govc.of.search")} className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-sm outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
        </label>
        <div role="group" aria-label={t("govc.of.offices")} className="inline-flex flex-wrap rounded-full bg-fiesta-navy/5 p-0.5">
          <button type="button" aria-pressed={cat === "office"} onClick={() => setCat("office")} className={pill(cat === "office")}>{t("govc.of.contacts")} <span className="tabular-nums opacity-80">{n("office")}</span></button>
          <button type="button" aria-pressed={cat === "department-head"} onClick={() => setCat("department-head")} className={pill(cat === "department-head")}>{t("govc.of.heads")} <span className="tabular-nums opacity-80">{n("department-head")}</span></button>
        </div>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-black/10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {rows.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fiesta-blue/10" aria-hidden><KitIcon name="shield" color="#2b4fa3" className="h-6 w-6" /></span>
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-semibold leading-snug text-fiesta-navy">{o.office ?? o.position}</p>
                <p className="text-sm text-black/70">{o.name}</p>
                {o.location && <p className="mt-0.5 flex items-start gap-1 text-xs text-black/65"><KitIcon name="pin" className="mt-0.5 h-3.5 w-3.5 shrink-0" />{o.location}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {o.phone && <a href={tel(o.phone, o.location)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-fiesta-navy px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-fiesta-blue"><KitIcon name="phone" className="h-4 w-4 shrink-0" />{o.phone}</a>}
                {o.email && <a href={`mailto:${o.email}`} title={o.email} className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full bg-fiesta-navy/5 px-4 text-sm font-semibold text-fiesta-blue hover:bg-fiesta-mint"><span aria-hidden>✉</span><span className="truncate">{o.email}</span></a>}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="rounded-2xl bg-white p-6 text-sm text-black/70 shadow-sm ring-1 ring-black/5">{t("govc.of.none")}</p>}
    </div>
  );
}
