import type { Metadata } from "next";
import DistrictCard from "@/components/badyet/DistrictCard";
import { SourceNote } from "@/components/stats/StatCard";
import { getBadyet, getDistricts } from "@/lib/badyet";

export const metadata: Metadata = { title: "Badyet", description: "Budget ng DPWH sa dalawang distrito ng Oriental Mindoro: enacted na budget 2020-2026 at paghahambing ng NEP at House bill para sa 2027." };

const date = (s: string) => s.slice(0, 10);

export default function Badyet() {
  const { meta, disclaimers } = getBadyet();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Badyet ng Oriental Mindoro</h1>
      <p className="mt-2 text-black/70">
        Ang halaga ng DPWH district engineering office sa bawat distrito ng kongreso: ang enacted na budget mula 2020 hanggang 2026, at ang dalawang bersyon ng 2027 budget. Mga kabuuang halaga lang ito, wala pang listahan ng proyekto.
      </p>

      <aside className="mt-6 rounded-xl border border-[#1b2a4a]/20 bg-[#1b2a4a]/5 p-4 text-sm leading-relaxed" aria-labelledby="paano">
        <h2 id="paano" className="font-serif text-lg font-bold">Paano basahin</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Ang mga halaga ay ayon sa nakalathala sa mga dokumento. <b>Hindi ito ang nagastos.</b></li>
          <li>Ang <b>NEP</b> (panukala ng Pangulo) at ang <b>House bill</b> ay dalawang bersyon ng <b>iisang</b> budget. Pinaghahambing ang mga ito, <b>hindi pinagsasama</b>.</li>
          <li>Ang &quot;-&quot; ay walang datos, hindi zero.</li>
          <li>Ang &quot;nasa House bill lang&quot; at &quot;nasa NEP lang&quot; ay kandidato para sa paghahambing, hindi natuklasang paglabag, at <b>hindi paratang</b> laban sa sinumang opisina o opisyal.</li>
          <li>Ang House bill ay mga pinangalanang proyekto lang, kaya ang paghahambing ay sa parehong hanay ng proyekto.</li>
          <li>Ang pagbanggit sa kinatawan ay para mahanap ang distrito. Hindi nito sinasabing humiling o nagkontrol siya ng anumang proyekto o halaga.</li>
        </ul>
      </aside>

      <div className="mt-8 space-y-8">
        {getDistricts().map((d) => <DistrictCard key={d.id} d={d} />)}
      </div>

      <h2 className="mt-10 font-serif text-xl font-bold">Ano ang ibig sabihin ng mga grupo</h2>
      <dl className="mt-3 space-y-3 text-sm">
        <div><dt className="font-medium">Nasa House bill lang</dt><dd className="text-black/70">Proyektong lumabas sa House bill na hindi nahanap sa NEP. Tinatawag itong &quot;insertion candidate&quot;: posibleng bago, o posibleng hindi lang natugma sa pangalan.</dd></div>
        <div><dt className="font-medium">Nasa NEP lang</dt><dd className="text-black/70">Proyektong nasa NEP na hindi nahanap sa House bill (&quot;deletion candidate&quot;).</dd></div>
        <div><dt className="font-medium">Parehong halaga</dt><dd className="text-black/70">Magkatugmang proyekto na walang pagbabago.</dd></div>
        <div><dt className="font-medium">Mas mataas / mas mababa sa House bill</dt><dd className="text-black/70">Magkatugmang proyekto na iba ang halaga. Ang ipinapakita ay ang dagdag o bawas.</dd></div>
        <div><dt className="font-medium">Ibang bahagi ng parehong kalsada</dt><dd className="text-black/70">Hindi binibilang na pagbabago.</dd></div>
        <div><dt className="font-medium">Unconfirmed</dt><dd className="text-black/70">Hindi tiyak ang pagtutugma ng proyekto (malabo o dalawa ang posibleng tugma). Kasama ito sa &quot;nasa House bill lang&quot; at laging ipinapakita nang hiwalay.</dd></div>
      </dl>

      <section className="mt-10 rounded-xl border border-black/10 bg-white p-4 text-xs leading-relaxed text-black/70" aria-labelledby="paalala">
        <h2 id="paalala" className="text-sm font-semibold">Paalala mula sa pinagmulan (orihinal, sa English)</h2>
        <p className="mt-2">{meta.notice}</p>
        {disclaimers.map((x) => (
          <p key={x.title} className="mt-2"><b>{x.title}</b> {x.body} <a className="underline" href={x.url} rel="noopener">Basahin</a></p>
        ))}
        <p className="mt-2">{meta.representatives_note}</p>
        <p className="mt-2">Tala sa mga opisina: iniuugnay lang ng mapa ng DEO ang opisina sa distrito. Para sa dalawang distritong ito, bawat opisina ay naglilingkod sa isang distrito lang (&quot;lone&quot;). Ang bahagi ng budget ng DPWH na nasa Central Office, regional office, o walang tugmang opisina ay wala sa alinmang distrito sa itaas, kaya hindi sinasaklaw ng pahinang ito ang buong DPWH budget.</p>
      </section>

      <SourceNote>
        Source: <a className="underline" href="https://budget.bettergov.ph/docs" rel="noopener">BetterGov Budget API</a>, kinuha mula sa data na binuo noong {date(meta.built_at)} (<a className="underline" href={meta.source_repo} rel="noopener">source repo</a>, commit {meta.source_commit.slice(0, 7)}). Hindi nakasaad ang lisensya sa API response; tingnan ang <a className="underline" href="https://budget.bettergov.ph/docs" rel="noopener">dokumentasyon</a> at <a className="underline" href="https://lgu.bettergov.ph/BUDGET_GUIDE.html" rel="noopener">gabay</a>. Portrait at pangalan ng kinatawan: House of Representatives of the Philippines. Malaya at hindi opisyal ang pahinang ito; hindi ito ang talaan ng budget department.
      </SourceNote>
    </main>
  );
}
