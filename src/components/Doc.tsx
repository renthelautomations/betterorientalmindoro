import PageHead from "@/components/site/PageHead";

export default function Doc({ title, eyebrow = "IMPORMASYON", children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <PageHead crumbs={[{ label: "Home", href: "/" }, { label: title }]} eyebrow={eyebrow} title={title} />
      <div className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
    </main>
  );
}
