// Downloads NAMRIA/PSA boundaries (BetterGov dataset 23, MIT) and keeps Oriental Mindoro only.
import { writeFileSync } from "node:fs";
const B = "https://github.com/bendlikeabamboo/barangay-boundaries-repository/releases/download/v2026.4.13.0";
const PROVINCE = "Oriental Mindoro";
for (const f of ["provinces", "municipalities", "component_cities", "barangays"]) {
  const d = await (await fetch(`${B}/${f}.geojson`)).json();
  const features = d.features.filter((x) => x.properties.ADM2_EN === PROVINCE);
  writeFileSync(`public/data/${f}.geojson`, JSON.stringify({ type: "FeatureCollection", features }));
  console.log(f, features.length);
}
