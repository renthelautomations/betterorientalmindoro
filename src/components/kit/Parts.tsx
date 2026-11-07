import KitIcon, { type KitIconName } from "./KitIcon";
import { T } from "@/lib/i18n/i18n";
import { PatternFill, type PatternKey } from "./Patterns";

// ---- Buttons ----
export type BtnVariant = "solid" | "outline" | "soft" | "pill";
const BTN: Record<BtnVariant, string> = {
  solid: "bg-[#1b2a4a] text-white hover:bg-[#263963] rounded-lg",
  outline: "border-2 border-[#1b2a4a] text-[#1b2a4a] hover:bg-[#1b2a4a] hover:text-white rounded-lg",
  soft: "bg-[#1f7a8c]/10 text-[#145664] hover:bg-[#1f7a8c]/20 rounded-lg",
  pill: "bg-[#b5532f] text-white hover:bg-[#9a4425] rounded-full px-7",
};
export function Button({ variant = "solid", icon, children }: { variant?: BtnVariant; icon?: KitIconName; children: React.ReactNode }) {
  return (
    <button type="button" className={`inline-flex min-h-11 items-center gap-2 px-5 text-sm font-semibold transition ${BTN[variant]}`}>
      {children}{icon && <KitIcon name={icon} className="h-4 w-4" />}
    </button>
  );
}

// ---- Badges ----
const BADGE = { wip: "bg-amber-100 text-amber-900", verified: "bg-emerald-100 text-emerald-900", new: "bg-sky-100 text-sky-900", soon: "border border-dashed border-black/30 text-black/60" } as const;
export function Badge({ kind, children }: { kind: keyof typeof BADGE; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE[kind]}`}>{children}</span>;
}

// ---- Section header with ornament ----
export function SectionHeader({ eyebrow, title, color = "#b5532f", align = "left" }: { eyebrow: string; title: string; color?: string; align?: "left" | "center" }) {
  return (
    <header className={align === "center" ? "text-center" : ""}>
      <p className="text-xs font-semibold tracking-[0.2em]" style={{ color }}>{eyebrow}</p>
      <h2 className="mt-2 font-serif text-3xl font-bold">{title}</h2>
      <div className={`mt-3 h-1 w-16 rounded-full ${align === "center" ? "mx-auto" : ""}`} style={{ background: color }} />
    </header>
  );
}

// ---- Cards ----
export function PillarCard({ short, name, blurb, color, pattern }: { short: string; name: string; blurb: string; color: string; pattern: PatternKey }) {
  return (
    <div className="relative isolate flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-2xl p-5 text-white" style={{ background: color }}>
      <PatternFill variant={pattern} colors={["#fff"]} opacity={0.2} />
      <span className="font-serif text-4xl font-bold">{short}</span>
      <span><span className="block text-lg font-semibold">{name}</span><span className="mt-1 block text-sm leading-snug">{blurb}</span></span>
    </div>
  );
}

export function StatCard({ label, value, hint, icon, color = "#1f7a8c" }: { label: string; value: string; hint: string; icon: KitIconName; color?: string }) {
  return (
    <div className="h-full rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold tracking-widest text-black/60"><T k={label} /></p><KitIcon name={icon} variant="duo" color={color} /></div>
      <p className="mt-3 font-serif text-4xl font-bold" style={{ color }}>{value}</p>
      <p className="mt-1 text-sm text-black/60"><T k={hint} /></p>
    </div>
  );
}

export function ServiceRow({ icon, title, sub, color = "#2f6b4f" }: { icon: KitIconName; title: string; sub: string; color?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-black/10 bg-white p-4 hover:border-black/30">
      <KitIcon name={icon} variant="badge" color={color} className="h-11 w-11 shrink-0" />
      <div className="min-w-0 flex-1"><p className="font-semibold">{title}</p><p className="text-sm text-black/60">{sub}</p></div>
      <KitIcon name="arrow" className="h-5 w-5 text-black/40" />
    </div>
  );
}

export function Callout({ kind, title, children }: { kind: "emergency" | "info"; title: string; children: React.ReactNode }) {
  const c = kind === "emergency" ? { bg: "#fdecea", fg: "#b3261e", icon: "alert" as const } : { bg: "#e8f3f5", fg: "#1f7a8c", icon: "check" as const };
  return (
    <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: c.bg }}>
      <KitIcon name={c.icon} variant="badge" color={c.fg} className="h-9 w-9 shrink-0" />
      <div><p className="font-semibold">{title}</p><p className="text-sm text-black/70">{children}</p></div>
    </div>
  );
}
