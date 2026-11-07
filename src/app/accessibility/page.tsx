import type { Metadata } from "next";
import Doc from "@/components/Doc";

export const metadata: Metadata = { title: "Accessibility" };

export default function Page() {
  return (
    <Doc title="Accessibility">
      <p>We want everyone in Oriental Mindoro to be able to use this website. We aim to follow WCAG 2.1 level AA: readable contrast, keyboard navigation, a skip link, and text alternatives for maps.</p>
      <p>The map on the Bayan page has a plain list of every municipality next to it, so it is not required to use the site.</p>
      <p>If something is hard to use, tell the volunteers through the project GitHub page and we will fix it.</p>
    </Doc>
  );
}
