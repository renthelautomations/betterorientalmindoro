import type { Metadata } from "next";
import { Accordion } from "@/components/kit/Ui";
import Doc from "@/components/Doc";
import Bilingual from "@/lib/i18n/Bilingual";
import { FAQ_EN, FAQ_FIL } from "@/lib/faq";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return (
    <Doc titleKey="docs.title.faq" eyebrowKey="docs.eyebrow.faq">
      <Bilingual en={<Accordion items={FAQ_EN} />} fil={<Accordion items={FAQ_FIL} />} />
    </Doc>
  );
}
