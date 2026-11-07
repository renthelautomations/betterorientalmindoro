"use client";
import PageHead from "@/components/site/PageHead";
import { useT } from "@/lib/i18n/i18n";

/** Chrome for a long-form page. Title and eyebrow are dictionary keys; the body is a <Bilingual> pair passed as children. */
export default function Doc({ titleKey, eyebrowKey = "docs.eyebrow.info", children }: { titleKey: string; eyebrowKey?: string; children: React.ReactNode }) {
  const t = useT();
  const title = t(titleKey);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <PageHead crumbs={[{ label: t("docs.home"), href: "/" }, { label: title }]} eyebrow={t(eyebrowKey)} title={title} />
      <div className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
    </main>
  );
}
