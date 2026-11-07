import Link from "next/link";
import { DASH, fmtPeso, gaaYears, getBadyet, netChange, proportionSegments, versions, type District, type Office } from "@/lib/badyet";

const SEG: Record<string, { name: string; color: string; sign: string }> = {
  unchanged: { name: "Pareho", color: "#1b2a4a", sign: "" },
  increased: { name: "Tumaas sa House bill", color: "#c2410c", sign: "+" },
  house_only: { name: "Nasa House bill lang", color: "#2b4fa3", sign: "" },
  nep_only: { name: "Nasa NEP lang", color: "#0f766e", sign: "" },
  decreased: { name: "Bumaba sa House bill", color: "#2f6b4f", sign: "-" },
  scope_review: { name: "Ibang bahagi ng parehong kalsada", color: "#6b6b6b", sign: "" },
};
const STRIPES = "repeating-linear-gradient(45deg, rgba(255,255,255,.85) 0 3px, transparent 3px 6px)";

export function Side({ label, value, note }: { label: string; value: number | null; note: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-black/10 bg-white p-4">
      <p className="text-xs font-semibold tracking-widest text-black/65">{label}</p>
      <p className={`mt-2 font-serif text-2xl font-bold sm:text-3xl ${value == null ? "text-black/65" : "text-fiesta-navy"}`}>{fmtPeso(value)}</p>
      <p className="mt-1 text-xs text-black/65">{note}</p>
    </div>
  );
}

export function ProportionBar({ o }: { o: Office }) {
  const seg = proportionSegments(o);
  const total = seg.reduce((a, s) => a + s.rows, 0);
  return (
    <div>
      <div role="img" aria-label={`Hati ng ${total} linya ng budget ayon sa pagbabago: ${seg.map((s) => `${SEG[s.key].name} ${s.rows}`).join(", ")}`} className="flex h-6 gap-0.5 overflow-hidden rounded-md bg-black/5 motion-reduce:transition-none">
        {seg.map((s) => s.rows > 0 && (
          <span key={s.key} className="flex h-full min-w-1 overflow-hidden" style={{ width: `${s.pct}%`, background: SEG[s.key].color }}>
            {s.unconfirmed_rows > 0 && <span className="ml-auto h-full" style={{ width: `${(s.unconfirmed_rows / s.rows) * 100}%`, backgroundImage: STRIPES }} />}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-black/65">Lapad = bilang ng linya ng budget (hindi halaga ng piso). Guhit-guhit = hindi tiyak ang pagtutugma (unconfirmed).</p>
      <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {seg.map((s) => (
          <li key={s.key} className="flex gap-3 text-sm">
            <span aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: SEG[s.key].color }} />
            <span className="min-w-0">
              <span className="font-semibold">{SEG[s.key].name}</span>
              <span className="block tabular-nums text-black/75">{s.rows} linya · {s.rows === 0 ? DASH : `${SEG[s.key].sign}${fmtPeso(s.php)}`}</span>
              {s.unconfirmed_rows > 0 && <span className="block text-xs font-semibold text-[#9a3f1e]">Unconfirmed: {s.unconfirmed_rows} linya, {fmtPeso(s.unconfirmed_php)}. Hindi tiyak ang pagtutugma.</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GaaBars({ o }: { o: Office }) {
  const ys = gaaYears(o);
  const max = Math.max(...ys.map((y) => y.php ?? 0), 1);
  const row = (y: (typeof ys)[number]) => (
    <li key={y.fy} className="flex items-center gap-2 text-sm">
      <span className="w-10 shrink-0 tabular-nums text-black/70">{y.fy}</span>
      <span className="h-3 min-w-0 flex-1 rounded-sm bg-black/5" aria-hidden><span className="block h-3 rounded-sm bg-fiesta-navy" style={{ width: `${((y.php ?? 0) / max) * 100}%` }} /></span>
      <span className="w-20 shrink-0 text-right tabular-nums">{fmtPeso(y.php)}</span>
    </li>
  );
  const recent = ys.slice(-5).reverse();
  const older = ys.slice(0, -5).reverse();
  return (
    <>
      <ul className="space-y-1.5">{recent.map(row)}</ul>
      {(older.length > 0 || o.by_congress.length > 0) && (
        <details className="mt-3 text-sm">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-fiesta-blue underline">Ipakita pa: mas lumang taon at kabuuan bawat Kongreso</summary>
          <ul className="mt-2 space-y-1.5">{older.map(row)}</ul>
          <ul className="mt-3 text-xs text-black/70">
            {o.by_congress.map((c) => <li key={c.congress}>{c.congress}th Congress ({c.years_counted.join(", ")}): {fmtPeso(c.gaa_php)} (kabuuan ng enacted lang)</li>)}
          </ul>
        </details>
      )}
    </>
  );
}

/** Per-office source notes, rendered inside the collapsed notes bar. */
export function OfficeNotes({ d }: { d: District }) {
  return (
    <div>
      <p className="font-semibold">{d.label}</p>
      {d.offices.map((o) => {
        const wholeNep = o.years.find((y) => y.stage === "nep")?.php;
        const oc = o.fy2027.office_change;
        return (
          <ul key={o.id} className="mt-1 list-disc space-y-1 pl-5">
            {wholeNep != null && <li>{o.name}: ang NEP para sa buong opisina ay {fmtPeso(wholeNep)}. Mas malaki ito sa NEP na ipinapakita dahil ang House bill ay mga pinangalanang proyekto lang, kaya pareho-ang-hanay na paghahambing ang ginamit.</li>}
            {oc && oc.rows > 0 && <li>{oc.rows} linya ang inalis sa mga bilang dahil magkaiba ang opisinang nakasaad sa NEP ({fmtPeso(oc.nep_php)}) at sa House bill ({fmtPeso(oc.hgab3_php)}). Hindi ito pinagsama.</li>}
            {o.notes.length > 0 && <li>Tala mula sa pinagmulan: {o.notes.join(" ")}</li>}
            <li>Ang opisinang ito ay {o.tier_text.toLowerCase()}, kaya ang bilang ay maaaring basahin bilang sa distritong ito.</li>
          </ul>
        );
      })}
    </div>
  );
}

export const NO_SPEND = "Hindi ito ang nagastos. Hindi ito paratang.";

export function repLink(d: District) {
  const r = d.representative;
  return (
    <>
      {r.name} ({r.bill_count} panukalang batas).{" "}
      <a className="font-medium text-fiesta-blue underline" href={r.profile_url} rel="noopener noreferrer" target="_blank">Opisyal na profile sa House</a>
    </>
  );
}

/** NEP and House bill totals of an office, side by side. Deliberately never summed. */
export function VersionsPair({ o }: { o: Office }) {
  const v = versions(o);
  const f = o.fy2027;
  const net = netChange(v.nep, v.house);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Side label="NEP (PANUKALA NG PANGULO)" value={v.nep} note={`${f.nep_records} proyekto`} />
        <Side label="HOUSE BILL (3RD READING)" value={v.house} note={`${f.hgab3_records} proyekto, pinangalanan lang`} />
      </div>
      <p className="mt-2 text-sm">Pagkakaiba (House bill minus NEP): <b className="tabular-nums">{net == null ? DASH : `${net > 0 ? "+" : ""}${fmtPeso(net)}`}</b>. <span className="text-black/70">Pinaghahambing lang, hindi dinadagdag.</span></p>
    </div>
  );
}

/** Record card on the main page: one district, links to its detail page. */
export function DistrictCard({ d, slug, h }: { d: District; slug: string; h: string }) {
  return (
    <article aria-labelledby={`h-${slug}`} className="flex flex-col rounded-2xl border border-black/10 bg-white p-5">
      <h2 id={`h-${slug}`} className="font-serif text-xl font-bold">{d.label}</h2>
      <p className="mt-1 text-sm text-black/75">Kinatawan: {repLink(d)}</p>
      {d.offices.map((o) => (
        <div key={o.id} className="mt-4">
          <p className="mb-2 text-sm font-semibold">{o.name} <span className="font-normal text-black/70">· FY2027, dalawang bersyon ng iisang budget</span></p>
          <VersionsPair o={o} />
        </div>
      ))}
      <Link href={`/badyet/${slug}`} className="mt-5 inline-flex min-h-11 items-center self-start rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue">Buksan ang {h}</Link>
    </article>
  );
}

const GROUPS: [string, string][] = [
  ["Nasa House bill lang", "Proyektong lumabas sa House bill na hindi nahanap sa NEP (\"insertion candidate\"): posibleng bago, o posibleng hindi lang natugma sa pangalan. Kandidato lang para sa paghahambing, hindi paratang."],
  ["Nasa NEP lang", "Proyektong nasa NEP na hindi nahanap sa House bill (\"deletion candidate\"). Kandidato lang para sa paghahambing, hindi paratang."],
  ["Pareho", "Magkatugmang proyekto na walang pagbabago sa halaga."],
  ["Tumaas / bumaba sa House bill", "Magkatugmang proyekto na iba ang halaga. Ang ipinapakita ay ang dagdag o bawas."],
  ["Ibang bahagi ng parehong kalsada", "Hindi binibilang na pagbabago."],
  ["Unconfirmed", "Hindi tiyak ang pagtutugma ng proyekto (malabo o dalawa ang posibleng tugma). Kasama ito sa \"nasa House bill lang\" at laging ipinapakita nang hiwalay."],
];

/** Full notes and disclaimers; shown inside an Accordion, the one-line version stays visible above it. */
export function BadyetNotes({ districts }: { districts: District[] }) {
  const { meta, disclaimers } = getBadyet();
  return (
    <div className="space-y-5">
      <ul className="list-disc space-y-1 pl-5">
        <li>Ang mga halaga ay ayon sa nakalathala sa mga dokumento. <b>Hindi ito ang nagastos.</b></li>
        <li>Ang <b>NEP</b> (panukala ng Pangulo) at ang <b>House bill</b> ay dalawang bersyon ng <b>iisang</b> budget. Pinaghahambing ang mga ito, <b>hindi pinagsasama</b>.</li>
        <li>Ang &quot;-&quot; ay walang datos, hindi zero.</li>
        <li>Ang &quot;nasa House bill lang&quot; at &quot;nasa NEP lang&quot; ay kandidato para sa paghahambing, hindi natuklasang paglabag, at <b>hindi paratang</b> laban sa sinumang opisina o opisyal.</li>
        <li>Ang House bill ay mga pinangalanang proyekto lang, kaya ang paghahambing ay sa parehong hanay ng proyekto.</li>
        <li>Ang pagbanggit sa kinatawan ay para mahanap ang distrito. Hindi nito sinasabing humiling o nagkontrol siya ng anumang proyekto o halaga.</li>
      </ul>
      <div>
        <p className="font-semibold">Ano ang ibig sabihin ng mga grupo</p>
        <dl className="mt-2 space-y-2">{GROUPS.map(([t, b]) => <div key={t}><dt className="font-medium">{t}</dt><dd className="text-black/70">{b}</dd></div>)}</dl>
      </div>
      <div className="space-y-3">{districts.map((d) => <OfficeNotes key={d.id} d={d} />)}</div>
      <div className="space-y-2 text-xs text-black/70">
        <p className="font-semibold text-black/85">Paalala mula sa pinagmulan (orihinal, sa English)</p>
        <p>{meta.notice}</p>
        {disclaimers.map((x) => <p key={x.title}><b>{x.title}</b> {x.body} <a className="underline" href={x.url} rel="noopener">Basahin</a></p>)}
        <p>{meta.representatives_note}</p>
        <p>Tala sa mga opisina: iniuugnay lang ng mapa ng DEO ang opisina sa distrito. Para sa dalawang distritong ito, bawat opisina ay naglilingkod sa isang distrito lang (&quot;lone&quot;). Ang bahagi ng budget ng DPWH na nasa Central Office, regional office, o walang tugmang opisina ay wala sa alinmang distrito sa ibaba, kaya hindi sinasaklaw ng pahinang ito ang buong DPWH budget.</p>
      </div>
    </div>
  );
}
