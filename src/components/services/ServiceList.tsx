import Link from "next/link";
import type { Service } from "@/lib/services";

export default function ServiceList({ rows }: { rows: Service[] }) {
  return (
    <ul className="divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
      {rows.map((s) => (
        <li key={s.id}>
          <Link href={`/serbisyo/${s.category}/${s.id}`} className="block px-4 py-3 hover:bg-black/[0.03]">
            <span className="font-medium">{s.title}</span>
            <span className="mt-0.5 block text-sm text-black/60">{s.summary}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
