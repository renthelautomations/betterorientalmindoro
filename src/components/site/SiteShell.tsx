import EmergencyBar from "@/components/EmergencyBar";
import { KitHeader, KitFooter } from "@/components/kit/Layout";
import SiteFooterBar from "./SiteFooterBar";
import { NAV, FOOTER_LINKS, FOOTER_SOURCES } from "./nav";

/** Skip link, emergency strip, sticky kit header, page, kit footer, community/credit bar. */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:p-3 focus:underline">Skip to content</a>
      <EmergencyBar />
      <div className="sticky top-0 z-40"><KitHeader links={NAV} /></div>
      <div id="main" tabIndex={-1} className="flex-1 outline-none">{children}</div>
      <KitFooter links={FOOTER_LINKS} sources={FOOTER_SOURCES} />
      <SiteFooterBar />
    </>
  );
}
