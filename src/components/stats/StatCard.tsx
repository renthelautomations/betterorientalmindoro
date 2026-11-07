import { DASH } from "@/lib/stats";
import { T } from "@/lib/i18n/i18n";

/** `label` is a dictionary key; `value` and `note` may carry translated nodes. */
export function StatCard({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-black/60"><T k={label} /></div>
      <div className={`mt-1 font-serif text-2xl font-bold ${value === DASH ? "text-black/65" : "text-[#1b2a4a]"}`}>{value}</div>
      {note && <div className="mt-1 text-xs text-black/60">{note}</div>}
    </div>
  );
}

export function SourceNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-black/65">{children}</p>;
}

/** "3rd municipal income class" shown as "3rd class". The ordinal is data; the word "class" is interface. */
export function IncomeClass({ value }: { value?: string }) {
  if (!value) return <>{DASH}</>;
  const m = value.match(/^(.*?) (municipal|city|provincial) income class$/);
  return m ? <>{m[1]} <T k="finance.class" /></> : <>{value}</>;
}
