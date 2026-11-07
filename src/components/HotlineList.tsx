import { groupByCategory, type Hotline } from "@/lib/hotlines";

const LABEL = { emergency: "Emergency", medical: "Medical", government: "Government", utility: "Utilities" } as const;
const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

export default function HotlineList({ rows, heading: H = "h3" }: { rows: Hotline[]; heading?: "h2" | "h3" }) {
  if (!rows.length) return <p className="text-sm text-black/60">Wala pang naka-lista na hotline dito. May alam ka bang numero? Ipaalam sa aming volunteers.</p>;
  const groups = groupByCategory(rows);
  return (
    <div className="space-y-8">
      {(Object.keys(LABEL) as (keyof typeof LABEL)[]).map((c) =>
        groups[c] ? (
          <section key={c} aria-label={LABEL[c]}>
            <H className="text-sm font-semibold tracking-widest text-black/60">{LABEL[c].toUpperCase()}</H>
            <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
              {groups[c]!.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-xs text-black/65">
                      <a href={h.source} rel="noopener" className="underline">Source</a> · checked {h.verifiedAt}
                      {!h.confirmed && " · unconfirmed (third-party directory)"}
                    </p>
                  </div>
                  <a href={tel(h.number)} className="rounded-full bg-[var(--navy)] px-4 py-1.5 text-sm font-semibold text-white">{h.number}</a>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
