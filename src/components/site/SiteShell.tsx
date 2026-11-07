import EmergencyBar from "@/components/EmergencyBar";
import { KitHeader } from "@/components/kit/Layout";
import SiteFooter from "./SiteFooter";
import { NAV } from "./nav";

/** Skip link, emergency strip, sticky kit header, page, kit footer, community/credit bar. */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:p-3 focus:underline">Skip to content</a>
      <EmergencyBar />
      <div className="sticky top-0 z-40"><KitHeader links={NAV} /></div>
      <div id="main" tabIndex={-1} className="flex-1 outline-none">{children}</div>
      <SiteFooter />
    </>
  );
}
