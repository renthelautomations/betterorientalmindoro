"use client";
import { ServiceRow } from "@/components/kit/Parts";
import type { KitIconName } from "@/components/kit/KitIcon";
import { useT } from "@/lib/i18n/i18n";

/** A service category as a kit ServiceRow whose title and blurb follow the language (svc.cat.* keys). */
export default function CatRow({ slug, icon, color }: { slug: string; icon: KitIconName; color: string }) {
  const t = useT();
  return <ServiceRow icon={icon} title={t(`svc.cat.${slug}`)} sub={t(`svc.cat.${slug}.b`)} color={color} />;
}
