import type { Metadata } from "next";
import Doc from "@/components/Doc";
import Bilingual from "@/lib/i18n/Bilingual";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <Doc titleKey="docs.title.privacy">
      <Bilingual
        en={<>
          <p>This website does not have user accounts and does not collect personal information through forms.</p>
          <ul>
            <li>No analytics or advertising trackers are used.</li>
            <li>The Hal page loads current weather from Open-Meteo, which receives your IP address as part of the request.</li>
            <li>The hosting provider may keep standard server logs.</li>
          </ul>
          <p>If this changes, for example when we add a contact or report form, we will update this page first.</p>
        </>}
        fil={<>
          <p>Walang user account ang website na ito at hindi ito kumukuha ng personal na impormasyon sa pamamagitan ng mga form.</p>
          <ul>
            <li>Walang ginagamit na analytics o advertising tracker.</li>
            <li>Ang pahina ng Hal ay kumukuha ng kasalukuyang lagay ng panahon mula sa Open-Meteo, na tumatanggap ng iyong IP address bilang bahagi ng kahilingan.</li>
            <li>Maaaring magtago ang hosting provider ng karaniwang server logs.</li>
          </ul>
          <p>Kung magbago ito, halimbawa kapag nagdagdag kami ng contact o report form, uunahin naming i-update ang pahinang ito.</p>
        </>}
      />
    </Doc>
  );
}
