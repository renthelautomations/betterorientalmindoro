import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/kit/Ui";
import PageHead from "@/components/site/PageHead";
import { ServiceLink } from "@/components/site/ServiceLink";
import { getCategories, getCategory, getServices } from "@/lib/services";

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/serbisyo/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  return c ? { title: c.name, description: c.blurb } : {};
}

export default async function CategoryPage({ params }: PageProps<"/serbisyo/[category]">) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const rows = getServices(c.slug);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <PageHead crumbs={[{ label: "Home", href: "/" }, { label: "Serbisyo", href: "/serbisyo" }, { label: c.name }]} eyebrow="KATEGORYA" title={c.name}><p>{c.blurb}</p></PageHead>
      <div className="mt-8">
        {rows.length ? (
          <ul className="space-y-3">{rows.map((s) => <li key={s.id}><ServiceLink s={s} /></li>)}</ul>
        ) : (
          <EmptyState title="Wala pang naka-lista">
            Wala pa kaming nakukumpirmang opisyal na source para dito. May alam ka bang source? Ipaalam sa aming volunteers. Para sa emergency, tingnan ang <Link href="/hotlines" className="underline">mga hotline</Link>.
          </EmptyState>
        )}
      </div>
    </main>
  );
}
