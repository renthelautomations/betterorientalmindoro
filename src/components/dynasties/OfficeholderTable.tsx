import { POSITION_LABEL, titleCase, type Contest } from "@/lib/dynasties";

export default function OfficeholderTable({ contests, position }: { contests: Contest[]; position: string }) {
  const rows = contests.filter((c) => c.position === position).sort((a, b) => b.year - a.year);
  if (!rows.length) return <p className="mt-3 text-sm text-black/60">Walang naitalang resulta para sa {POSITION_LABEL[position].toLowerCase()} sa source data.</p>;
  return (
    <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      {rows.map((c) => (
        <li key={c.year} id={`${position.toLowerCase().replace(" ", "-")}-${c.year}`} className="flex scroll-mt-28 items-center gap-4 px-4 py-3 target:bg-fiesta-yellow/20">
          <span className="w-16 shrink-0 rounded-lg bg-fiesta-navy py-1.5 text-center font-serif text-base font-bold tabular-nums text-white">{c.year}</span>
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-fiesta-navy">
              {c.winners.map((w, i) => (
                <span key={w.id + i}>
                  {i > 0 && ", "}
                  {titleCase(w.name)}
                  {w.party && w.party !== "IND" ? <span className="ml-1.5 inline-block rounded-full bg-fiesta-blue/10 px-2 py-0.5 align-middle text-[11px] font-semibold text-fiesta-blue">{w.party}</span> : null}
                </span>
              ))}
            </p>
            {position !== "COUNCILOR" && (
              <p className="mt-0.5 text-xs text-black/65">{c.uncontested ? "Walang kalaban" : `${c.candidates} ang kandidato`}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
