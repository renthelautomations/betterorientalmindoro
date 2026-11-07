import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ServiceList from "@/components/services/ServiceList";
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/serbisyo" className="text-sm underline">← Lahat ng serbisyo</Link>
      <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">{c.name}</h1>
      <p className="mt-2 text-black/70">{c.blurb}</p>
      <div className="mt-8">
        {rows.length ? (
          <ServiceList rows={rows} />
        ) : (
          <p className="text-sm text-black/60">Wala pang naka-lista na serbisyo dito dahil wala pa kaming nakukumpirmang opisyal na source. May alam ka bang source? Ipaalam sa aming volunteers. Para sa emergency, tingnan ang <Link href="/hotlines" className="underline">mga hotline</Link>.</p>
        )}
      </div>
    </main>
  );
}
