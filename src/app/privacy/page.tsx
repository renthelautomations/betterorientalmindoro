import type { Metadata } from "next";
import { DocShell, DocBody, type DocSection } from "@/components/site/DocShell";
import Bilingual from "@/lib/i18n/Bilingual";

export const metadata: Metadata = { title: "Privacy Policy" };

const view = (callout: string, sections: DocSection[]) => (
  <DocShell titleKey="docs.title.privacy" sections={sections}><DocBody callout={callout} sections={sections} icons={["shield", "weather", "alert"]} /></DocShell>
);

export default function Page() {
  return (
    <Bilingual
      en={view("This website does not have user accounts and does not collect personal information through forms.", [
        { id: "what", h: "What we use", body: <ul>
          <li>No advertising trackers are used. Vercel Web Analytics counts page views in aggregate without cookies or personal profiles, and the footer visit count is one anonymous number stored in our own database.</li>
          <li>The Hal page loads current weather from Open-Meteo, which receives your IP address as part of the request.</li>
          <li>The hosting provider may keep standard server logs.</li>
        </ul> },
        { id: "changes", h: "If this changes", body: <p>If this changes, for example when we add a contact or report form, we will update this page first.</p> },
      ])}
      fil={view("Walang user account ang website na ito at hindi ito kumukuha ng personal na impormasyon sa pamamagitan ng mga form.", [
        { id: "what", h: "Ano ang ginagamit namin", body: <ul>
          <li>Walang ginagamit na advertising tracker. Binibilang ng Vercel Web Analytics ang mga pagtingin sa pahina nang pinagsama-sama, walang cookie at walang personal na profile, at ang bilang ng bisita sa footer ay isang anonymous na numero sa sarili naming database.</li>
          <li>Ang pahina ng Hal ay kumukuha ng kasalukuyang lagay ng panahon mula sa Open-Meteo, na tumatanggap ng iyong IP address bilang bahagi ng kahilingan.</li>
          <li>Maaaring magtago ang hosting provider ng karaniwang server logs.</li>
        </ul> },
        { id: "changes", h: "Kung magbago ito", body: <p>Kung magbago ito, halimbawa kapag nagdagdag kami ng contact o report form, uunahin naming i-update ang pahinang ito.</p> },
      ])}
    />
  );
}
