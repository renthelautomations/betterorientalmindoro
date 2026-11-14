import EmergencyBar from "@/components/EmergencyBar";
import SiteHeader from "./SiteHeader";
import { getCategories } from "@/lib/services";
import SiteFooter from "./SiteFooter";
import GroupContinuity from "./GroupContinuity";
import { buildMenu } from "./nav";
import VolunteerDialog, { VolunteerButton } from "./VolunteerDialog";
import { getMunicipalities } from "@/lib/municipalities";
import { T } from "@/lib/i18n/i18n";

/** Skip link, emergency strip, sticky kit header, page, kit footer, community/credit bar. */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:p-3 focus:underline">Skip to content</a>
      <EmergencyBar />
      <div className="sticky top-0 z-40"><SiteHeader entries={buildMenu(getCategories().map((c) => c.slug), getMunicipalities().map((m) => ({ slug: m.slug, name: m.name })))} extra={<VolunteerButton className="hidden min-h-9 items-center sm:inline-flex rounded-full bg-fiesta-orange px-3.5 text-xs font-bold text-fiesta-navy transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue"><T k="vol.cta" /></VolunteerButton>} /></div>
      <div id="main" tabIndex={-1} className="flex-1 outline-none">{children}</div>
      <GroupContinuity />
      <SiteFooter />
      <VolunteerDialog towns={getMunicipalities().map((m) => m.name)} />
    </>
  );
}
