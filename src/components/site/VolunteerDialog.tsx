"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import KitIcon from "@/components/kit/KitIcon";
import { useT } from "@/lib/i18n/i18n";
import Dropdown from "./Dropdown";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EVENT = "bom:volunteer";
const SEEN = "bom-volunteer-seen";
const STRIPE = "repeating-linear-gradient(90deg,#e8552d 0 24px,#3aa65b 24px 48px,#4aa3d8 48px 72px,#f4b92e 72px 96px)";
const OTHER = "Outside Oriental Mindoro";

async function send(v: { name: string; email: string; town: string; what: string }): Promise<boolean> {
  if (!URL_ || !KEY) return false;
  try {
    const r = await fetch(`${URL_}/rest/v1/rpc/add_volunteer`, {
      method: "POST", headers: { apikey: KEY, "content-type": "application/json" },
      body: JSON.stringify({ p_name: v.name, p_email: v.email, p_municipality: v.town, p_contribution: v.what }),
    });
    return r.ok;
  } catch { return false; }
}

/** Opens the volunteer popup from anywhere (header, footer). */
export function VolunteerButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <button type="button" onClick={() => window.dispatchEvent(new Event(EVENT))} className={className}>{children}</button>;
}

const field = "mt-1.5 w-full rounded-xl border-2 border-fiesta-navy/20 bg-white px-3 text-sm text-fiesta-navy outline-none transition placeholder:text-black/40 hover:border-fiesta-navy/50 focus-visible:border-fiesta-blue focus-visible:ring-4 focus-visible:ring-fiesta-blue/20";

/** Branded popup form. Details go to our own database through the add_volunteer function. Shown once on first visit, then only when asked for. */
export default function VolunteerDialog({ towns }: { towns: string[] }) {
  const t = useT();
  const id = useId();
  const dlg = useRef<HTMLDialogElement>(null);
  const [f, setF] = useState({ name: "", email: "", town: "", what: "" });
  const [err, setErr] = useState<Partial<Record<keyof typeof f | "send", string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const mark = () => { try { localStorage.setItem(SEEN, "1"); } catch { /* private mode */ } };
  const open = useCallback(() => { if (dlg.current && !dlg.current.open) dlg.current.showModal(); }, []);
  const close = () => { mark(); dlg.current?.close(); };

  useEffect(() => {
    window.addEventListener(EVENT, open);
    let seen = false;
    try { seen = localStorage.getItem(SEEN) === "1"; } catch { /* ignore */ }
    const timer = seen ? undefined : setTimeout(open, 15000);
    return () => { window.removeEventListener(EVENT, open); clearTimeout(timer); };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: typeof err = {};
    if (f.name.trim().length < 2) x.name = "vol.err.name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) x.email = "vol.err.email";
    if (!f.town) x.town = "vol.err.town";
    if (f.what.trim().length < 3) x.what = "vol.err.what";
    setErr(x);
    if (Object.keys(x).length) return;
    setState("sending");
    if (await send({ ...f, name: f.name.trim(), email: f.email.trim(), what: f.what.trim() })) { mark(); setState("done"); }
    else { setState("idle"); setErr({ send: "vol.err.send" }); }
  };

  const set = (k: keyof typeof f) => (v: string) => { setF((p) => ({ ...p, [k]: v })); setErr((p) => ({ ...p, [k]: undefined })); };
  const opts = [{ v: "", t: t("vol.town.ph") }, ...towns.map((n) => ({ v: n, t: n })), { v: OTHER, t: t("vol.town.other") }];

  return (
    <dialog ref={dlg} aria-labelledby={`${id}-h`} onClose={() => { if (state === "done") { setState("idle"); setF({ name: "", email: "", town: "", what: "" }); } }}
      onClick={(e) => { if (e.target === dlg.current) close(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-fiesta-navy/60 backdrop:backdrop-blur-sm max-h-[calc(100dvh-2rem)]">
      <div className="h-1.5" style={{ background: STRIPE }} aria-hidden />
      <div className="relative bg-fiesta-mint px-6 pb-5 pt-6">
        <button type="button" onClick={close} aria-label={t("vol.close")} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-fiesta-navy transition hover:bg-fiesta-navy/10 focus-visible:outline-2 focus-visible:outline-fiesta-blue">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <KitIcon name="people" variant="badge" color="#1b2a4a" className="h-12 w-12" />
        <h2 id={`${id}-h`} className="mt-3 pr-10 font-serif text-2xl font-bold text-fiesta-navy">{t("vol.title")}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-black/75">{t("vol.lead")}</p>
      </div>

      {state === "done" ? (
        <div className="px-6 py-10 text-center" role="status">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fiesta-green/20 text-[#1f6b37]"><KitIcon name="check" className="h-7 w-7" /></span>
          <p className="mt-4 font-serif text-2xl font-bold text-fiesta-navy">{t("vol.done.h")}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-black/70">{t("vol.done")}</p>
          <button type="button" onClick={close} className="mt-6 min-h-11 rounded-full bg-fiesta-navy px-6 text-sm font-bold text-white transition hover:bg-fiesta-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">{t("vol.close")}</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4 px-6 pb-6 pt-5">
          <div>
            <label htmlFor={`${id}-name`} className="text-sm font-semibold text-fiesta-navy">{t("vol.name")}</label>
            <input id={`${id}-name`} value={f.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" maxLength={120} aria-invalid={!!err.name} aria-describedby={err.name ? `${id}-name-e` : undefined} className={`${field} min-h-11`} />
            {err.name && <p id={`${id}-name-e`} role="alert" className="mt-1 text-xs font-semibold text-fiesta-red">{t(err.name)}</p>}
          </div>
          <div>
            <label htmlFor={`${id}-email`} className="text-sm font-semibold text-fiesta-navy">{t("vol.email")}</label>
            <input id={`${id}-email`} type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} autoComplete="email" maxLength={254} aria-invalid={!!err.email} aria-describedby={err.email ? `${id}-email-e` : undefined} className={`${field} min-h-11`} />
            {err.email && <p id={`${id}-email-e`} role="alert" className="mt-1 text-xs font-semibold text-fiesta-red">{t(err.email)}</p>}
          </div>
          <div>
            <label htmlFor={`${id}-town`} className="text-sm font-semibold text-fiesta-navy">{t("vol.town")}</label>
            <Dropdown id={`${id}-town`} value={f.town} options={opts} onChange={set("town")} className="mt-1.5" />
            {err.town && <p role="alert" className="mt-1 text-xs font-semibold text-fiesta-red">{t(err.town)}</p>}
          </div>
          <div>
            <label htmlFor={`${id}-what`} className="text-sm font-semibold text-fiesta-navy">{t("vol.what")}</label>
            <textarea id={`${id}-what`} value={f.what} onChange={(e) => set("what")(e.target.value)} rows={4} maxLength={1000} placeholder={t("vol.what.ph")} aria-invalid={!!err.what} aria-describedby={err.what ? `${id}-what-e` : undefined} className={`${field} py-2.5`} />
            {err.what && <p id={`${id}-what-e`} role="alert" className="mt-1 text-xs font-semibold text-fiesta-red">{t(err.what)}</p>}
          </div>
          {err.send && <p role="alert" className="rounded-xl bg-fiesta-red/10 px-3 py-2 text-sm font-semibold text-fiesta-red">{t(err.send)}</p>}
          <p className="text-xs text-black/60">{t("vol.privacy")}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="min-h-11 rounded-full px-5 text-sm font-bold text-fiesta-navy transition hover:bg-fiesta-navy/5 focus-visible:outline-2 focus-visible:outline-fiesta-blue">{t("vol.later")}</button>
            <button type="submit" disabled={state === "sending"} className="min-h-11 rounded-full bg-fiesta-navy px-6 text-sm font-bold text-white transition hover:bg-fiesta-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue disabled:opacity-60">{t(state === "sending" ? "vol.sending" : "vol.send")}</button>
          </div>
        </form>
      )}
    </dialog>
  );
}
