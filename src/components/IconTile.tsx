import Link from "next/link";
import { ICONS, type IconKey } from "@/lib/brand";

export default function IconTile({ icon }: { icon: IconKey }) {
  const i = ICONS[icon];
  return (
    <Link
      href={`/${i.key}`}
      style={{ backgroundColor: i.color }}
      className="group flex min-h-44 flex-col justify-between rounded-2xl p-5 text-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="font-serif text-4xl font-bold">{i.short}</span>
      <span>
        <span className="block text-lg font-semibold">{i.name}</span>
        <span className="mt-1 block text-sm leading-snug text-white/90">{i.blurb}</span>
      </span>
    </Link>
  );
}
