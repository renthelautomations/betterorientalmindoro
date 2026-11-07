import { titleCase, type SurnameRow, type ProvinceSurnameRow } from "@/lib/dynasties";

export default function SurnameTable({ rows }: { rows: (SurnameRow | ProvinceSurnameRow)[] }) {
  if (!rows.length) return <p className="mt-3 text-sm text-black/60">Walang apelyidong hawak ng dalawa o higit pang magkaibang tao sa datos na ito.</p>;
  return (
    <ul className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
      {rows.map((r) => (
        <li key={r.surname} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
          <p className="font-serif text-lg font-bold">{titleCase(r.surname)}</p>
          <p className="text-sm text-black/70">
            {r.seats} na panalo · {r.people} tao{"towns" in r ? ` · ${r.towns} bayan` : ""} · {r.years[0]}–{r.years[r.years.length - 1]}
          </p>
        </li>
      ))}
    </ul>
  );
}
