import Link from "next/link";
import { ServiceRow } from "@/components/kit/Parts";
import type { KitIconName } from "@/components/kit/KitIcon";
import type { Service } from "@/lib/services";

export const CATEGORY_ICON: Record<string, KitIconName> = {
  certificates: "doc", business: "budget", social: "people", health: "health", taxation: "budget",
  agriculture: "farm", infrastructure: "road", education: "school", "public-safety": "shield",
};

/** Kit ServiceRow made into a link to the service record. */
export function ServiceLink({ s }: { s: Service }) {
  return <Link href={`/serbisyo/${s.category}/${s.id}`} className="block rounded-xl"><ServiceRow icon={CATEGORY_ICON[s.category] ?? "doc"} title={s.title} sub={s.summary} /></Link>;
}
