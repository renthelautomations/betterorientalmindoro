import type { Metadata } from "next";
import Doc from "@/components/Doc";
import Bilingual from "@/lib/i18n/Bilingual";

export const metadata: Metadata = { title: "Accessibility" };

export default function Page() {
  return (
    <Doc titleKey="docs.title.accessibility">
      <Bilingual
        en={<>
          <p>We want everyone in Oriental Mindoro to be able to use this website. We aim to follow WCAG 2.1 level AA: readable contrast, keyboard navigation, a skip link, and text alternatives for maps.</p>
          <p>The map on the Bayan page has a plain list of every municipality next to it, so it is not required to use the site.</p>
          <p>If something is hard to use, tell the volunteers through the project GitHub page and we will fix it.</p>
        </>}
        fil={<>
          <p>Nais naming magamit ng lahat ng taga-Oriental Mindoro ang website na ito. Layunin naming sundin ang WCAG 2.1 level AA: malinaw na contrast, pag-navigate gamit ang keyboard, isang skip link, at mga alternatibong teksto para sa mga mapa.</p>
          <p>Ang mapa sa pahina ng Bayan ay may simpleng listahan ng bawat munisipalidad sa tabi nito, kaya hindi kailangang gamitin ang mapa para magamit ang site.</p>
          <p>Kung may mahirap gamitin, sabihin sa mga boluntaryo sa pamamagitan ng GitHub page ng proyekto at aayusin namin ito.</p>
        </>}
      />
    </Doc>
  );
}
