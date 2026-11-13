import data from "@/data/hazard-exposure.json";

// Share (0 to 1) of a barangay's land inside a NOAH hazard layer and level, computed by scripts/compute-hazard-exposure.py. Missing key = none mapped.
export const MEASURES = [
  { id: "flood100", key: "flood_100yr:any", label: "hx.m.flood100" },
  { id: "flood100hi", key: "flood_100yr:3", label: "hx.m.flood100hi" },
  { id: "flood25", key: "flood_25yr:any", label: "hx.m.flood25" },
  { id: "flood5", key: "flood_5yr:any", label: "hx.m.flood5" },
  { id: "landslide", key: "landslide:any", label: "hx.m.landslide" },
  { id: "landslidehi", key: "landslide:3", label: "hx.m.landslidehi" },
  { id: "debris", key: "debris_flow:any", label: "hx.m.debris" },
  { id: "surge", key: "storm_surge_ssa1:any", label: "hx.m.surge" },
] as const;
const items = (data as { items: Record<string, Record<string, number>> }).items;
/** False until scripts/compute-hazard-exposure.py has produced real numbers: the page then shows nothing instead of a wall of 0%. */
export const exposureReady = Object.keys(items).length > 0;
export const exposureMeta = { computedAt: (data as { computedAt: string }).computedAt };
export const getExposure = (pcode: string): Record<string, number> | undefined => items[pcode];
