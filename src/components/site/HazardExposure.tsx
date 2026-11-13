import { getTownBarangays } from "@/lib/barangays";
import { MEASURES, exposureMeta, exposureReady, getExposure } from "@/lib/hazard-exposure";
import { T } from "@/lib/i18n/i18n";
import HazardExposureView from "./HazardExposureView";

/** Hazard exposure of every barangay of a town, worked out from the NOAH maps. Rows only carry the shares for this town. */
export default function HazardExposure({ slug, name }: { slug: string; pcode: string; name: string }) {
  if (!exposureReady) return null;
  const rows = getTownBarangays(slug).map((b) => { const e = getExposure(b.code) ?? {}; return { code: b.code, name: b.name, href: `/bayan/${slug}/${b.slug}`, area: b.areaKm2, v: Object.fromEntries(MEASURES.map((m) => [m.id, e[m.key] ?? 0])) }; });
  if (!rows.length) return null;
  return (
    <section aria-labelledby="hx-h" className="space-y-3">
      <h3 id="hx-h" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="hx.h" /></h3>
      <p className="max-w-3xl text-sm text-black/70"><T k="hx.p" /></p>
      <HazardExposureView rows={rows} measures={MEASURES.map((m) => ({ id: m.id, label: m.label }))} town={name} computed={exposureMeta.computedAt} />
    </section>
  );
}
