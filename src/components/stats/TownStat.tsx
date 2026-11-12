import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { DASH } from "@/lib/stats";
import { T } from "@/lib/i18n/i18n";

/** Design-system stat card: icon badge, label, big serif number, optional bar (share 0..1 of a comparison), hint. `label`/`hint`/`barLabel` are dictionary keys or plain data. A dash value means no data: no bar is drawn. */
export default function TownStat({ label, value, hint, icon, color = "#2b4fa3", share, barLabel }: {
  label: string; value: React.ReactNode; hint?: React.ReactNode; icon: KitIconName; color?: string; share?: number | null; barLabel?: string;
}) {
  const none = value === DASH || value === "–";
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <KitIcon name={icon} variant="badge" color={color} className="h-10 w-10 shrink-0" />
        <p className="min-w-0 text-xs font-semibold tracking-widest text-black/65 uppercase"><T k={label} /></p>
      </div>
      <p className={`mt-3 font-serif text-3xl font-bold tabular-nums ${none ? "text-black/65" : "text-fiesta-navy"}`}>{value}</p>
      {share != null && !none && (
        <span className="mt-2 block h-2 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full" style={{ width: `${Math.min(Math.max(share * 100, 2), 100)}%`, background: color }} /></span>
      )}
      <p className="mt-auto pt-2 text-sm text-black/65">{hint}</p>
      {barLabel && share != null && !none && <p className="mt-0.5 text-xs text-black/60"><T k={barLabel} /></p>}
    </div>
  );
}
