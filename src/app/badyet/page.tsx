import type { Metadata } from "next";
import BadyetDistrict, { OfficeNotes } from "@/components/site/BadyetDistrict";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import { Accordion, Breadcrumbs } from "@/components/kit/Ui";
import PageTitle from "@/components/site/PageTitle";
import { getBadyet, getDistricts } from "@/lib/badyet";

export const metadata: Metadata = { title: "Badyet", description: "Budget ng DPWH sa dalawang distrito ng Oriental Mindoro: enacted na budget 2020-2026 at paghahambing ng NEP at House bill para sa 2027." };

const date = (s: string) => s.slice(0, 10);

const GROUPS: [string, string][] = [
  ["Nasa House bill lang", "Proyektong lumabas sa House bill na hindi nahanap sa NEP (\"insertion candidate\"): posibleng bago, o posibleng hindi lang natugma sa pangalan. Kandidato lang para sa paghahambing, hindi paratang."],
  ["Nasa NEP lang", "Proyektong nasa NEP na hindi nahanap sa House bill (\"deletion candidate\"). Kandidato lang para sa paghahambing, hindi paratang."],
  ["Pareho", "Magkatugmang proyekto na walang pagbabago sa halaga."],
  ["Tumaas / bumaba sa House bill", "Magkatugmang proyekto na iba ang halaga. Ang ipinapakita ay ang dagdag o bawas."],
  ["Ibang bahagi ng parehong kalsada", "Hindi binibilang na pagbabago."],
  ["Unconfirmed", "Hindi tiyak ang pagtutugma ng proyekto (malabo o dalawa ang posibleng tugma). Kasama ito sa \"nasa House bill lang\" at laging ipinapakita nang hiwalay."],
];

// Both districts are in the static HTML; the switch is plain anchors and :target picks the panel, so it works without JS.
export default function Badyet() {
  const { meta, disclaimers } = getBadyet();
  const [d1, d2] = getDistricts();
  const notes = (
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
      <div className="space-y-3">{[d1, d2].map((d) => <OfficeNotes key={d.id} d={d} />)}</div>
      <div className="space-y-2 text-xs text-black/70">
        <p className="font-semibold text-black/85">Paalala mula sa pinagmulan (orihinal, sa English)</p>
        <p>{meta.notice}</p>
        {disclaimers.map((x) => <p key={x.title}><b>{x.title}</b> {x.body} <a className="underline" href={x.url} rel="noopener">Basahin</a></p>)}
        <p>{meta.representatives_note}</p>
        <p>Tala sa mga opisina: iniuugnay lang ng mapa ng DEO ang opisina sa distrito. Para sa dalawang distritong ito, bawat opisina ay naglilingkod sa isang distrito lang (&quot;lone&quot;). Ang bahagi ng budget ng DPWH na nasa Central Office, regional office, o walang tugmang opisina ay wala sa alinmang distrito sa ibaba, kaya hindi sinasaklaw ng pahinang ito ang buong DPWH budget.</p>
      </div>
    </div>
  );
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Datos", href: "/datos" }, { label: "Badyet" }]} />
      <div className="mt-4"><PageTitle eyebrow="BADYET" title="Badyet ng Oriental Mindoro" /></div>
      <p className="mt-4 max-w-2xl text-black/75">
        Ang halaga ng DPWH district engineering office sa bawat distrito ng kongreso: ang enacted na budget mula 2020 hanggang 2026, at ang dalawang bersyon ng 2027 budget. Mga kabuuang halaga lang ito, wala pang listahan ng proyekto.
      </p>
      <div className="mt-6"><Accordion items={[{ q: "Hindi ito ang nagastos. Hindi ito paratang.", a: notes }]} /></div>

      <div className="mt-8 [&:has(#d2:target)_#d1]:hidden [&:not(:has(#d2:target))_#d2]:hidden">
        <BadyetDistrict d={d1} id="d1" />
        <BadyetDistrict d={d2} id="d2" />
      </div>

      <SourceNote>
        Data mula sa BetterGov Budget API, kinuha noong {date(meta.built_at)}. Hindi nakasaad ang lisensya sa API response. Portrait at pangalan ng kinatawan: House of Representatives of the Philippines. Malaya at hindi opisyal ang pahinang ito (independent and unofficial); hindi ito ang talaan ng budget department.
      </SourceNote>
      <div className="mt-3 flex flex-wrap gap-2">
        <SourceLink href="https://budget.bettergov.ph/docs" icon="database">BetterGov Budget API</SourceLink>
        <SourceLink href={meta.source_repo} icon="github">Source repo</SourceLink>
        <SourceLink href="https://budget.bettergov.ph/docs" icon="book">Dokumentasyon</SourceLink>
        <SourceLink href="https://lgu.bettergov.ph/BUDGET_GUIDE.html" icon="compass">Gabay</SourceLink>
      </div>
    </main>
  );
}
