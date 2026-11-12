import { T } from "@/lib/i18n/i18n";
import HazardMap from "./HazardMapLoader";

export default function TownHazard({ name, bounds }: { name: string; bounds: [number, number, number, number] }) {
  return (
    <div className="space-y-5">
      <HazardMap name={name} bounds={bounds} />
      <div className="rounded-2xl bg-fiesta-mint p-5 text-sm"><p className="font-semibold text-fiesta-navy"><T k="hz.nocolor" /></p><p className="mt-1 text-black/75"><T k="hz.check" /></p></div>
      <p className="text-xs text-black/70"><T k="hz.src" /></p>
    </div>
  );
}
