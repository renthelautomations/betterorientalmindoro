import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Crumbs } from "@/components/site/ProjectBits";
import { DocBody } from "@/components/site/GovProcDoc";
import { getDoc, getDocs, neighbours } from "@/lib/gov-proc-data";
import { slugRef } from "@/lib/gov-proc";

export const generateStaticParams = () => getDocs().map((d) => ({ id: d.id }));

export async function generateMetadata({ params }: PageProps<"/pamahalaan/dokumento/[id]">): Promise<Metadata> {
  const d = getDoc((await params).id);
  return d ? { title: d.title.slice(0, 70), description: "Document listed on ormindoro.gov.ph with facts read automatically from the scanned PDF. Open the PDF to confirm." } : {};
}

export default async function Dokumento({ params }: PageProps<"/pamahalaan/dokumento/[id]">) {
  const { id } = await params;
  const d = getDoc(id);
  if (!d) notFound();
  const { prev, next } = neighbours(id);
  const slim = (x: typeof prev) => (x ? { id: x.id, type: x.type } : null);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Crumbs items={[{ label: "nav.gov", href: "/pamahalaan" }, ...(d.refNo ? [{ label: d.refNo, href: `/pamahalaan/bidding/${slugRef(d.refNo)}` }] : []), { label: d.id }]} />
      <DocBody d={d} project={d.refNo ? { slug: slugRef(d.refNo), title: d.refNo } : null} prev={slim(prev)} next={slim(next)} />
    </main>
  );
}
