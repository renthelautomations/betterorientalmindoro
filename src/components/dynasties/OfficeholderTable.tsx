import { titleCase, type Contest } from "@/lib/dynasties";
import { T } from "@/lib/i18n/i18n";
import { TF,  } from "@/components/site/DynBits";
import { posKey } from "@/components/site/dynKeys";

export default function OfficeholderTable({ contests, position }: { contests: Contest[]; position: string }) {
  const rows = contests.filter((c) => c.position === position).sort((a, b) => b.year - a.year);
  if (!rows.length) return <p className="mt-3 text-sm text-black/60"><TF k="dyn.off.none" v={[posKey(position, "dyn.posl.")]} /></p>;
  return (
    <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
      {rows.map((c) => (
        <li key={c.year} id={`${position.toLowerCase().replace(" ", "-")}-${c.year}`} className="flex scroll-mt-28 gap-4 px-4 py-3">
          <span className="w-12 shrink-0 font-semibold text-[var(--navy)]">{c.year}</span>
          <div className="min-w-0 text-sm">
            <p>
              {c.winners.map((w, i) => (
                <span key={w.id + i}>
                  {i > 0 && ", "}
                  {titleCase(w.name)}
                  {w.party && w.party !== "IND" ? <span className="text-black/65"> ({w.party})</span> : null}
                </span>
              ))}
            </p>
            {position !== "COUNCILOR" && (
              <p className="mt-0.5 text-xs text-black/65">{c.uncontested ? <T k="dyn.off.unopposed" /> : <TF k="dyn.off.cands" v={[c.candidates]} />}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
