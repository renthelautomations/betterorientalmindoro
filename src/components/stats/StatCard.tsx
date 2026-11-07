import { DASH } from "@/lib/stats";

export function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="h-full rounded-lg border border-black/10 bg-white/60 p-4">
      <div className="text-xs font-semibold tracking-widest text-black/60">{label}</div>
      <div className={`mt-1 font-serif text-2xl font-bold ${value === DASH ? "text-black/65" : "text-[#1b2a4a]"}`}>{value}</div>
      {note && <div className="mt-1 text-xs text-black/60">{note}</div>}
    </div>
  );
}

export function SourceNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-black/65">{children}</p>;
}
