import Link from "next/link";
import Icon from "@/components/ui/Icon";
import FooterSocial from "./FooterSocial";
import { Landmark } from "./KitT";
import { T } from "@/lib/i18n/i18n";
import { SITE } from "@/lib/brand";
import pkg from "../../../package.json";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Sits under the kit footer: community links, BetterGov mark, licence, credit and version. */
export default function SiteFooterBar() {
  return (
    <Landmark as="section" label="home.foot.aria" className="bg-fiesta-navy text-white/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 pb-6">
      <FooterSocial />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-6 text-xs">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 Better Oriental Mindoro</span>
            <span aria-hidden="true" className="text-white/30">|</span>
            <Link href="https://github.com/renthelautomations/betterorientalmindoro/blob/main/LICENSE" {...ext} className="hover:underline">MIT</Link>
            <span aria-hidden="true" className="text-white/30">|</span>
            <span><T k="home.foot.cited" /></span>
          </p>
          <p className="flex items-center gap-x-6">
            <a href="https://github.com/renthelautomations" {...ext} className="inline-flex items-center gap-1.5 hover:text-white">
              <Icon name="heart" className="h-3.5 w-3.5" />
              <T k="home.foot.built" /> <b className="font-semibold text-white">Renthel Cueto</b>
            </a>
            <a href={`${SITE.github}/commits/main`} {...ext} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white">
              <Icon name="gear" className="h-3.5 w-3.5" />
              <T k="home.foot.ver" /> {pkg.version}
            </a>
          </p>
        </div>
      </div>
    </Landmark>
  );
}
