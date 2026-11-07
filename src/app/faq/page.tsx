import type { Metadata } from "next";
import { DocShell, DocFaq } from "@/components/site/DocShell";
import Bilingual from "@/lib/i18n/Bilingual";
import { FAQ_EN, FAQ_FIL } from "@/lib/faq";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return (
    <DocShell titleKey="docs.title.faq" eyebrowKey="docs.eyebrow.faq">
      <Bilingual en={<DocFaq items={FAQ_EN} />} fil={<DocFaq items={FAQ_FIL} />} />
    </DocShell>
  );
}
