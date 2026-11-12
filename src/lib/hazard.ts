// Project NOAH hazard maps (BetterGov dataset 22, ODbL). Oriental Mindoro cut of the national PMTiles, hosted on our own R2 bucket.
// Rebuild: pmtiles extract <noah_hazard_maps.pmtiles URL> out.pmtiles --bbox=120.78,12.19,121.58,13.55 --maxzoom=12, then upload to the bom-tiles bucket.
export const HAZARD_TILES = process.env.NEXT_PUBLIC_HAZARD_TILES ?? "https://pub-c5c548b3eb984027b344f3db5f09c907.r2.dev/noah-ormin-z12.pmtiles";

export type HazardKind = "flood" | "landslide" | "debris" | "surge";
/** Variant ids are layer names inside the tiles; label keys live in dict/hazard.ts. */
export const VARIANTS: Partial<Record<HazardKind, { layer: string; label: string }[]>> = {
  flood: [{ layer: "flood_5yr", label: "hz.v.5" }, { layer: "flood_25yr", label: "hz.v.25" }, { layer: "flood_100yr", label: "hz.v.100" }],
  surge: [{ layer: "storm_surge_ssa1", label: "hz.v.ssa1" }, { layer: "storm_surge_ssa2", label: "hz.v.ssa2" }, { layer: "storm_surge_ssa3", label: "hz.v.ssa3" }, { layer: "storm_surge_ssa4", label: "hz.v.ssa4" }],
};
export const KINDS: { kind: HazardKind; label: string; field: "Var" | "HAZ"; layer?: string }[] = [
  { kind: "flood", label: "hz.k.flood", field: "Var" },
  { kind: "landslide", label: "hz.k.landslide", field: "HAZ", layer: "landslide" },
  { kind: "debris", label: "hz.k.debris", field: "HAZ", layer: "debris_flow" },
  { kind: "surge", label: "hz.k.surge", field: "HAZ" },
];
// One sequential ramp, light to dark: low, medium, high.
export const LEVEL_COLORS = ["#ffe08a", "#f08a3c", "#b8281c"] as const;
export const DEBRIS_COLOR = "#7a3b8f";
