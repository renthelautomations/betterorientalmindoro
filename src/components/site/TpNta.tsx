import { T } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";
import { fmtM, fmtPct } from "@/lib/bir";
import { NTA_YEARS, amount, getLgus, getProvince, ntaChange } from "@/lib/nta";

const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5";
const m = (v: number | null) => fmtM(v == null ? null : v / 1e6);

/** NTA share: the province over the years, then Calapan and the 14 towns for the latest year. Pesos in the data, shown as millions/billions. */
export default function TpNta() {
  const first = NTA_YEARS[0], last = NTA_YEARS.at(-1)!;
  const prov = getProvince(), lgus = getLgus();
  const maxProv = Math.max(...NTA_YEARS.map((y) => amount(prov, y) ?? 0), 1);
  const maxL = Math.max(...lgus.map((l) => amount(l, last) ?? 0), 1);
  return (
    <>
      <section aria-labelledby="nta-h" className={card}>
        <h2 id="nta-h" className="font-serif text-xl font-bold text-fiesta-navy"><T k="nta.h" /></h2>
        <p className="mt-1 text-sm leading-relaxed text-black/70"><T k="nta.p" /></p>
        <h3 className="mt-5 text-sm font-semibold tracking-wide text-black/65 uppercase"><T k="nta.prov" /></h3>
        <ul className="mt-3 flex h-48 items-end gap-3 sm:gap-6">
          {NTA_YEARS.map((y) => {
            const v = amount(prov, y);
            return (
              <li key={y} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 text-center">
                <span className="text-xs font-bold tabular-nums text-fiesta-navy sm:text-sm">{m(v)}</span>
                {v != null && <span aria-hidden className="w-full max-w-24 rounded-t-lg bg-fiesta-blue" style={{ height: `${Math.max((v / maxProv) * 68, 2)}%` }} />}
                <span className="border-t border-black/15 pt-1 text-sm font-semibold tabular-nums">{y}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="nta-l" className={card}>
        <h2 id="nta-l" className="font-serif text-xl font-bold text-fiesta-navy"><TF k="nta.lgus" v={[last]} /></h2>
        <p className="mt-1 text-sm text-black/70"><TF k="nta.chg" v={[first]} /></p>
        <ul className="mt-4 space-y-3">
          {lgus.map((l) => {
            const v = amount(l, last);
            return (
              <li key={l.name} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[11rem_1fr_auto]">
                <span className="truncate font-medium">{l.name}</span>
                <span className="h-3 rounded-full bg-black/5" aria-hidden>{v != null && <span className="block h-full rounded-full bg-fiesta-blue" style={{ width: `${(v / maxL) * 100}%` }} />}</span>
                <span className="whitespace-nowrap text-right tabular-nums"><b>{m(v)}</b> <span className="ml-1 text-xs text-black/70">{fmtPct(ntaChange(l, first, last))}</span></span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
