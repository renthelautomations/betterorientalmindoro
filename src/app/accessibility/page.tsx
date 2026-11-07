import type { Metadata } from "next";
import { DocShell, DocBody, type DocSection } from "@/components/site/DocShell";
import Bilingual from "@/lib/i18n/Bilingual";

export const metadata: Metadata = { title: "Accessibility" };

const view = (callout: string, sections: DocSection[]) => (
  <DocShell titleKey="docs.title.accessibility" sections={sections}><DocBody callout={callout} sections={sections} icons={["people", "pin", "alert"]} /></DocShell>
);

export default function Page() {
  return (
    <Bilingual
      en={view("We want everyone in Oriental Mindoro to be able to use this website. We aim to follow WCAG 2.1 level AA: readable contrast, keyboard navigation, a skip link, and text alternatives for maps.", [
        { id: "maps", h: "Maps", body: <p>The map on the Bayan page has a plain list of every municipality next to it, so it is not required to use the site.</p> },
        { id: "feedback", h: "Tell us", body: <p>If something is hard to use, tell the volunteers through the project GitHub page and we will fix it.</p> },
      ])}
      fil={view("Nais naming magamit ng lahat ng taga-Oriental Mindoro ang website na ito. Layunin naming sundin ang WCAG 2.1 level AA: malinaw na contrast, pag-navigate gamit ang keyboard, isang skip link, at mga alternatibong teksto para sa mga mapa.", [
        { id: "maps", h: "Mga mapa", body: <p>Ang mapa sa pahina ng Bayan ay may simpleng listahan ng bawat munisipalidad sa tabi nito, kaya hindi kailangang gamitin ang mapa para magamit ang site.</p> },
        { id: "feedback", h: "Sabihin sa amin", body: <p>Kung may mahirap gamitin, sabihin sa mga boluntaryo sa pamamagitan ng GitHub page ng proyekto at aayusin namin ito.</p> },
      ])}
    />
  );
}
