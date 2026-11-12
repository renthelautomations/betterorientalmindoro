import { T } from "@/lib/i18n/i18n";
import { programOf, type Row } from "@/lib/redflags";

/** Program name: DPWH programs as published, the other datasets by a translated name. */
export function ProgLabel({ row, program }: { row?: Pick<Row, "dataset" | "program">; program?: string }) {
  const p = program ?? programOf(row!);
  return ["fmr", "hfep", "nia"].includes(p) ? <T k={`rf.p.${p}`} /> : <>{p}</>;
}

export const FlagSvg = ({ className = "h-4 w-4" }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>;
