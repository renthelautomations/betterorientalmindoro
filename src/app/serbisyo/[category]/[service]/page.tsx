import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TBreadcrumbs } from "@/components/site/DynBits";
import SvcDetail from "@/components/site/SvcDetail";
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
    <main className="mx-auto max-w-6xl px-4 py-10">
      <TBreadcrumbs items={[{ label: "dyn.home", href: "/" }, { label: "nav.services", href: "/serbisyo" }, { label: s.title }]} />
      <div className="mt-6"><SvcDetail s={s} /></div>
    </main>
  );
}
