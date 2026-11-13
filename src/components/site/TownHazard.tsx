import { T } from "@/lib/i18n/i18n";
import HazardMap from "./HazardMapLoader";
import HazardExposure from "./HazardExposure";
import { getProjects } from "@/lib/projects";
import { getMunicipalities } from "@/lib/municipalities";

export default function TownHazard({ name, bounds, pcode }: { name: string; bounds: [number, number, number, number]; pcode: string }) {
  const slug = getMunicipalities().find((m) => m.pcode === pcode)?.slug ?? "";
  const projects = getProjects(slug).filter((p) => p.lat != null && p.lon != null).map((p) => ({ id: p.id, title: p.title, cost: p.cost, status: p.status, year: p.year, category: p.category, lon: p.lon!, lat: p.lat! }));
  return (
    <div className="space-y-5">
      <HazardMap name={name} bounds={bounds} pcode={pcode} projects={projects} />
      <HazardExposure pcode={pcode} slug={slug} name={name} />
      <div className="rounded-2xl bg-fiesta-mint p-5 text-sm"><p className="font-semibold text-fiesta-navy"><T k="hz.nocolor" /></p><p className="mt-1 text-black/75"><T k="hz.check" /></p></div>
      <p className="text-xs text-black/70"><T k="hz.src" /></p>
    </div>
  );
}
