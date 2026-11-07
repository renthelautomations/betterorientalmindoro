import type { Metadata } from "next";
import { DocShell, DocBody, type DocSection } from "@/components/site/DocShell";
import Bilingual from "@/lib/i18n/Bilingual";

export const metadata: Metadata = { title: "Terms of Use" };

const view = (callout: string, sections: DocSection[]) => (
  <DocShell titleKey="docs.title.terms" sections={sections}><DocBody callout={callout} sections={sections} icons={["doc", "tamaraw", "shield"]} /></DocShell>
);

export default function Page() {
  return (
    <Bilingual
      en={view("Better Oriental Mindoro is a volunteer-led civic website under the BetterGov.PH initiative. It is not the official website of the Provincial Government of Oriental Mindoro or of any local government unit.", [
        { id: "information", h: "Use of information", body: <p>Information is gathered from public sources and shown for general reference. We try to keep it accurate and show the source and date for each item, but we cannot guarantee it is complete or current. Confirm with the proper office before acting on it, especially for emergencies, permits and payments.</p> },
        { id: "open-source", h: "Open source", body: <p>The website code is released under the MIT License. Public data keeps the license of its source, shown where the data appears.</p> },
        { id: "no-warranty", h: "No warranty", body: <p>The site is provided as is, free of charge, by volunteers.</p> },
      ])}
      fil={view("Ang Better Oriental Mindoro ay isang civic website na pinapatakbo ng mga boluntaryo sa ilalim ng inisyatibong BetterGov.PH. Hindi ito ang opisyal na website ng Pamahalaang Panlalawigan ng Oriental Mindoro o ng alinmang lokal na pamahalaan.", [
        { id: "information", h: "Paggamit ng impormasyon", body: <p>Ang impormasyon ay kinukuha mula sa mga pampublikong pinagmulan at ipinapakita bilang pangkalahatang sanggunian. Sinisikap naming panatilihin itong tumpak at ipakita ang pinagmulan at petsa ng bawat aytem, ngunit hindi namin masisiguro na ito ay kumpleto o napapanahon. Kumpirmahin muna sa tamang tanggapan bago kumilos batay rito, lalo na sa mga emerhensiya, permit, at bayarin.</p> },
        { id: "open-source", h: "Open source", body: <p>Ang code ng website ay inilabas sa ilalim ng MIT License. Ang pampublikong datos ay nananatili sa lisensya ng pinagmulan nito, na ipinapakita kung saan lumalabas ang datos.</p> },
        { id: "no-warranty", h: "Walang garantiya", body: <p>Ang site ay ibinibigay nang kung ano ito, nang libre, ng mga boluntaryo.</p> },
      ])}
    />
  );
}
