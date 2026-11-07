import { DASH, fmtPeso, gaaYears, groupList, netChange, versions, type District, type Office } from "@/lib/badyet";

const GROUP_HELP: Record<string, string> = {
  house_only: "Nasa House bill pero hindi nahanap sa NEP. Kandidato lang para sa paghahambing, hindi paratang.",
  nep_only: "Nasa NEP pero hindi nahanap sa House bill. Kandidato lang para sa paghahambing, hindi paratang.",
  unchanged: "Parehong halaga sa dalawang bersyon.",
  increased: "Magkatugma ang proyekto, mas mataas sa House bill. Ang halaga ay ang dagdag.",
  decreased: "Magkatugma ang proyekto, mas mababa sa House bill. Ang halaga ay ang bawas.",
  scope_review: "Ibang bahagi ng parehong kalsada. Hindi binibilang bilang pagbabago.",
};
const DIFF = new Set(["increased", "decreased"]);

function Bars({ o }: { o: Office }) {
  const ys = gaaYears(o);
  const max = Math.max(...ys.map((y) => y.php ?? 0), 1);
  return (
    <ul className="mt-3 space-y-1.5">
      {ys.map((y) => (
        <li key={y.fy} className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 tabular-nums text-black/60">{y.fy}</span>
          <span className="h-3 flex-1 rounded-sm bg-black/5" aria-hidden>
            <span className="block h-3 rounded-sm bg-[#1b2a4a]" style={{ width: `${((y.php ?? 0) / max) * 100}%` }} />
          </span>
          <span className="w-20 shrink-0 text-right tabular-nums">{fmtPeso(y.php)}</span>
        </li>
      ))}
    </ul>
  );
}

function Side({ label, value, note }: { label: string; value: number | null; note: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/60 p-4">
      <div className="text-xs font-semibold tracking-widest text-black/60">{label}</div>
      <div className={`mt-1 font-serif text-2xl font-bold ${value == null ? "text-black/40" : "text-[#1b2a4a]"}`}>{fmtPeso(value)}</div>
      <div className="mt-1 text-xs text-black/60">{note}</div>
    </div>
  );
}

function OfficeBlock({ o }: { o: Office }) {
  const v = versions(o);
  const f = o.fy2027;
  const net = netChange(v.nep, v.house);
  const wholeNep = o.years.find((y) => y.stage === "nep")?.php;
  return (
    <section className="mt-6 border-t border-black/10 pt-5">
      <h3 className="font-serif text-xl font-bold">{o.name}</h3>
      <p className="text-sm text-black/60">{o.kind_label} · {o.tier_text}</p>

      <h4 className="mt-5 text-xs font-semibold tracking-widest text-black/60">ENACTED NA BUDGET (GAA) BAWAT TAON</h4>
      <Bars o={o} />
      <p className="mt-2 text-xs text-black/50">Buong opisina, ayon sa nakalathala. Hindi ito ang aktwal na nagastos. Ang &quot;-&quot; ay walang datos, hindi zero.</p>
      <ul className="mt-2 text-xs text-black/60">
        {o.by_congress.map((c) => (
          <li key={c.congress}>{c.congress}th Congress ({c.years_counted.join(", ")}): {fmtPeso(c.gaa_php)} (kabuuan ng enacted lang)</li>
        ))}
      </ul>

      <h4 className="mt-6 text-xs font-semibold tracking-widest text-black/60">FY2027: DALAWANG BERSYON NG IISANG BUDGET</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Side label="NEP (PANUKALA NG PANGULO)" value={v.nep} note={`${f.nep_records} proyekto, parehong hanay ng proyekto sa kanan`} />
        <Side label="HOUSE BILL (3RD READING)" value={v.house} note={`${f.hgab3_records} proyekto, mga pinangalanang proyekto lang`} />
      </div>
      <p className="mt-2 text-sm">
        Pagkakaiba (House bill minus NEP): <b className="tabular-nums">{net == null ? DASH : `${net > 0 ? "+" : ""}${fmtPeso(net)}`}</b>. <span className="text-black/60">Hindi dinadagdag ang dalawang bersyon, pinaghahambing lang.</span>
      </p>
      {wholeNep != null && (
        <p className="mt-1 text-xs text-black/50">Ang NEP para sa buong opisina ay {fmtPeso(wholeNep)}. Mas malaki ito sa NEP sa itaas dahil ang House bill ay mga pinangalanang proyekto lang, kaya ang pareho-ang-hanay na paghahambing ang ginamit.</p>
      )}

      <h4 className="mt-6 text-xs font-semibold tracking-widest text-black/60">PAGHAHAMBING NG MGA PROYEKTO</h4>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[26rem] text-sm">
          <caption className="sr-only">Mga proyekto sa FY2027 ayon sa pagkakaiba ng NEP at House bill, {o.name}</caption>
          <thead>
            <tr className="border-b border-black/20 text-left text-xs tracking-widest text-black/60">
              <th scope="col" className="py-2 pr-3">GRUPO</th>
              <th scope="col" className="py-2 pr-3 text-right">PROYEKTO</th>
              <th scope="col" className="py-2 text-right">HALAGA</th>
            </tr>
          </thead>
          <tbody>
            {groupList(o).map((g) => (
              <tr key={g.key} className="border-b border-black/10 align-top">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  <span className="font-medium">{g.label}</span> <span className="text-black/50">({g.sub})</span>
                  <span className="block text-xs text-black/60">{GROUP_HELP[g.key]}</span>
                  {g.unconfirmed_rows > 0 && <span className="block text-xs font-medium text-[#b5532f]">Unconfirmed: {g.unconfirmed_rows} proyekto, {fmtPeso(g.unconfirmed_php)}. Hindi tiyak ang pagtutugma.</span>}
                </th>
                <td className="py-2 pr-3 text-right tabular-nums">{g.rows}</td>
                <td className="py-2 text-right tabular-nums">{g.rows === 0 ? DASH : `${DIFF.has(g.key) ? (g.key === "increased" ? "+" : "-") : ""}${fmtPeso(g.php)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {f.office_change && f.office_change.rows > 0 && (
        <p className="mt-2 text-xs text-black/60">{f.office_change.rows} linya ang inalis sa mga bilang sa itaas dahil magkaiba ang opisinang nakasaad sa NEP ({fmtPeso(f.office_change.nep_php)}) at sa House bill ({fmtPeso(f.office_change.hgab3_php)}). Hindi ito pinagsama.</p>
      )}
      {o.notes.length > 0 && <p className="mt-1 text-xs text-black/60">Tala mula sa pinagmulan: {o.notes.join(" ")}</p>}
      <p className="mt-2 text-xs text-black/50">Ang bilang ng proyekto at halaga ay mula sa mga dokumento, hindi gastos. Ang opisinang ito ay {o.tier_text.toLowerCase()}, kaya ang bilang ay maaaring basahin bilang sa distritong ito.</p>
    </section>
  );
}

export default function DistrictCard({ d }: { d: District }) {
  const r = d.representative;
  return (
    <article className="rounded-xl border border-black/10 bg-white p-5 md:p-6" aria-labelledby={`h-${d.id}`}>
      <h2 id={`h-${d.id}`} className="font-serif text-2xl font-bold">{d.label}</h2>
      <p className="mt-1 text-sm text-black/70">
        Kinatawan ng distrito: {r.name} ({r.bill_count} panukalang batas). <a className="underline" href={r.profile_url} rel="noopener">Opisyal na profile sa House</a>
      </p>
      {d.offices.map((o) => <OfficeBlock key={o.id} o={o} />)}
      <p className="mt-5 text-sm"><a className="underline" href={d.url} rel="noopener">Tingnan ang buong detalye sa BetterGov Budget</a></p>
    </article>
  );
}
