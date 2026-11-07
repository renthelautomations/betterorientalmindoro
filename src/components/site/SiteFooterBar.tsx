import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import BrandIcon from "@/components/ui/BrandIcon";
import { SITE } from "@/lib/brand";
import pkg from "../../../package.json";

const SOCIAL = [
  { href: SITE.github, label: "Better Oriental Mindoro on GitHub", icon: "github" as const },
  { href: "https://discord.com/invite/qeSu7RJkjQ", label: "BetterGov.PH community on Discord", icon: "discord" as const },
];
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Sits under the kit footer: community links, BetterGov mark, licence, credit and version. */
export default function SiteFooterBar() {
  return (
    <section aria-label="Komunidad at credits" className="bg-fiesta-navy text-white/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 pb-6">
          <div className="flex items-center gap-5">
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} aria-label={s.label} title={s.label} {...ext} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
                <BrandIcon name={s.icon} className="h-7 w-7" />
              </a>
            ))}
          </div>
          <a href="https://bettergov.ph" aria-label="BetterGov.PH" title="BetterGov.PH" {...ext} className="inline-block opacity-70 hover:opacity-100">
            <Image src="/brand/bettergov-icon-white.svg" alt="BetterGov.PH" width={72} height={72} />
          </a>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-6 text-xs">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 Better Oriental Mindoro</span>
            <span aria-hidden="true" className="text-white/30">|</span>
            <Link href="https://github.com/renthelautomations/betterorientalmindoro/blob/main/LICENSE" {...ext} className="hover:underline">MIT</Link>
            <span aria-hidden="true" className="text-white/30">|</span>
            <span>Public data is cited to its source on each page.</span>
          </p>
          <p className="flex items-center gap-x-6">
            <a href="https://github.com/renthelautomations" {...ext} className="inline-flex items-center gap-1.5 hover:text-white">
              <Icon name="heart" className="h-3.5 w-3.5" />
              Built by <b className="font-semibold text-white">Renthel Cueto</b>
            </a>
            <a href={`${SITE.github}/commits/main`} {...ext} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white">
              <Icon name="gear" className="h-3.5 w-3.5" />
              Ver. {pkg.version}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
