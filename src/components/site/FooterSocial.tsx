"use client";
import Image from "next/image";
import BrandIcon from "@/components/ui/BrandIcon";
import { SITE } from "@/lib/brand";
import { useT } from "@/lib/i18n/i18n";

const SOCIAL = [
  { href: SITE.github, label: "home.foot.github", icon: "github" as const },
  { href: "https://discord.com/invite/qeSu7RJkjQ", label: "home.foot.discord", icon: "discord" as const },
];
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function FooterSocial() {
  const t = useT();
  return (
    <>
      <div className="flex items-center gap-5">
        {SOCIAL.map((s) => (
          <a key={s.href} href={s.href} aria-label={t(s.label)} title={t(s.label)} {...ext} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
            <BrandIcon name={s.icon} className="h-7 w-7" />
          </a>
        ))}
      </div>
      <a href="https://bettergov.ph" aria-label="BetterGov.PH" title="BetterGov.PH" {...ext} className="inline-block opacity-70 hover:opacity-100">
        <Image src="/brand/bettergov-icon-white.svg" alt="BetterGov.PH" width={72} height={72} />
      </a>
    </>
  );
}
