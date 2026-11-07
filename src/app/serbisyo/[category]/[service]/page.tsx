import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ServiceDetail from "@/components/services/ServiceDetail";
import { getCategory, getService, getServices } from "@/lib/services";

export function generateStaticParams() {
  return getServices().map((s) => ({ category: s.category, service: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/serbisyo/[category]/[service]">): Promise<Metadata> {
  const { category, service } = await params;
  const s = getService(category, service);
  return s ? { title: s.title, description: s.summary } : {};
}

export default async function ServicePage({ params }: PageProps<"/serbisyo/[category]/[service]">) {
  const { category, service } = await params;
  const s = getService(category, service);
  const c = getCategory(category);
  if (!s || !c) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/serbisyo/${c.slug}`} className="text-sm underline">← {c.name}</Link>
      <div className="mt-3"><ServiceDetail s={s} /></div>
    </main>
  );
}
