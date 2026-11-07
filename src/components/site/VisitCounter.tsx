"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/i18n";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function rpc(fn: "bump_views" | "get_views"): Promise<number | null> {
  if (!URL_ || !KEY) return null;
  try {
    const r = await fetch(`${URL_}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: KEY, "content-type": "application/json" }, body: "{}" });
    if (!r.ok) return null;
    const n = Number(await r.json());
    return Number.isFinite(n) ? n : null;
  } catch { return null; }
}

/** Total visits: one anonymous number from our own database. Counted once per browser session. Shows nothing, never a made-up number, if the count cannot be read. */
export default function VisitCounter() {
  const t = useT();
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let counted = false;
    try { counted = sessionStorage.getItem("bom-counted") === "1"; } catch { /* private mode: count each load */ }
    rpc(counted ? "get_views" : "bump_views").then((v) => {
      setN(v);
      if (!counted && v != null) { try { sessionStorage.setItem("bom-counted", "1"); } catch { /* ignore */ } }
    });
  }, []);
  if (n == null) return null;
  return (
    <p className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3" aria-live="polite">
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-fiesta-yellow" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
      <span><b className="block font-serif text-2xl leading-none tabular-nums text-white">{n.toLocaleString("en-PH")}</b><span className="text-xs text-white/80">{t("foot.visits")}</span></span>
    </p>
  );
}
