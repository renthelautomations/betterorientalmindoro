import { Breadcrumbs } from "@/components/kit/Ui";

/** Page opener: breadcrumbs, eyebrow, the one h1 (kit SectionHeader is an h2), lede. */
export default function PageHead({ crumbs, eyebrow, title, children }: { crumbs: { label: string; href?: string }[]; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header>
      <Breadcrumbs items={crumbs} />
      <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-[#b5532f]">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{title}</h1>
      <div className="mt-3 h-1 w-16 rounded-full bg-fiesta-orange" />
      {children && <div className="mt-4 max-w-2xl space-y-2 text-black/75">{children}</div>}
    </header>
  );
}
