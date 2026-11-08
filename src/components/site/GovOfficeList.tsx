"use client";
import { useMemo, useState } from "react";
import KitIcon from "@/components/kit/KitIcon";
import OfficeRow from "./OfficeRow";
import { numbers } from "@/lib/office-format";
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
            <OfficeRow key={o.id} icon="shield" color="#2b4fa3" bg="#e6ecf8" name={o.office ?? o.position ?? ""} head={o.name} address={o.location} phones={numbers(o.phone)} emails={o.email ? [o.email] : []} dial={(n) => tel(n, o.location)} />
          ))}
        </ul>
      ) : <p className="rounded-2xl bg-white p-6 text-sm text-black/70 shadow-sm ring-1 ring-black/5">{t("govc.of.none")}</p>}
    </div>
  );
}
