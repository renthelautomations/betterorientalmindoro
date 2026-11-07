// Builds an SVG path of the Oriental Mindoro outline (largest polygon) for the logo mark.
import { readFileSync, writeFileSync } from "node:fs";
const f = JSON.parse(readFileSync("public/data/provinces.geojson", "utf8")).features[0].geometry;
const polys = f.type === "Polygon" ? [f.coordinates] : f.coordinates;
const area = (r) => Math.abs(r.reduce((s, p, i) => s + (p[0] * r[(i + 1) % r.length][1] - r[(i + 1) % r.length][0] * p[1]), 0) / 2);
const ring = polys.map((p) => p[0]).sort((a, b) => area(b) - area(a))[0];
const k = Math.cos((12.9 * Math.PI) / 180);
const pts = ring.map(([x, y]) => [x * k, -y]);
const [minX, maxX] = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))];
const [minY, maxY] = [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))];
const s = 100 / (maxY - minY), w = (maxX - minX) * s;
// province file is already simplified; keep all points
const d = pts.filter(() => true).map(([x, y], i) => `${i ? "L" : "M"}${((x - minX) * s).toFixed(1)} ${((y - minY) * s).toFixed(1)}`).join("") + "Z";
writeFileSync("src/lib/logo-path.ts", `export const LOGO_PATH = "${d}";\nexport const LOGO_VIEWBOX = "0 0 ${w.toFixed(1)} 100";\n`);
console.log("points", ring.length, "->", d.length, "chars, width", w.toFixed(1));
