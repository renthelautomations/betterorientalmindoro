"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import { T, useT } from "@/lib/i18n/i18n";
import { DEBRIS_COLOR, HAZARD_TILES, KINDS, LEVEL_COLORS, VARIANTS, type HazardKind } from "@/lib/hazard";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
let registered = false;
const DEM: maplibregl.RasterDEMSourceSpecification = { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], encoding: "terrarium", tileSize: 256, maxzoom: 12, attribution: "Terrain: Mapzen / AWS Open Data" };
const LAYERS = ["debris_flow", "landslide", "flood_5yr", "flood_25yr", "flood_100yr", "storm_surge_ssa1", "storm_surge_ssa2", "storm_surge_ssa3", "storm_surge_ssa4"];
const chip = (on: boolean) => `inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ring-1 transition ${on ? "bg-fiesta-navy text-white ring-fiesta-navy" : "bg-white text-fiesta-navy ring-black/15 hover:bg-black/5"}`;

/** NOAH hazard layers over relief, fitted to one town. Tiles come from our R2 bucket by range requests. */
export default function HazardMap({ name, bounds }: { name: string; bounds: [number, number, number, number] }) {
  const t = useT();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [kind, setKind] = useState<HazardKind>("flood");
  const [variant, setVariant] = useState<Record<string, number>>({ flood: 1, surge: 1 });

  const k = KINDS.find((x) => x.kind === kind)!;
  const vs = VARIANTS[kind];
  const active = k.layer ?? vs![variant[kind]].layer;

  useEffect(() => {
    if (!registered) { maplibregl.addProtocol("pmtiles", new Protocol().tile); registered = true; }
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el.current!,
        style: { version: 8, sources: { dem: DEM, shade: DEM }, layers: [{ id: "bg", type: "background", paint: { "background-color": "#cfe6ef" } }, { id: "relief", type: "hillshade", source: "shade", paint: { "hillshade-exaggeration": 0.5, "hillshade-shadow-color": "#2d5a4a", "hillshade-highlight-color": "#fff8e6", "hillshade-accent-color": "#4a7a68" } }] },
        bounds, fitBoundsOptions: { padding: 24 }, maxZoom: 16, attributionControl: { compact: true },
      });
    } catch { queueMicrotask(() => setFailed(true)); return; }
    mapRef.current = map;
    map.on("load", () => {
      map.addSource("noah", { type: "vector", url: `pmtiles://${HAZARD_TILES}`, attribution: "Hazard: Project NOAH (ODbL)" });
      for (const id of LAYERS) {
        const field = id.startsWith("flood") ? "Var" : "HAZ";
        const color: maplibregl.ExpressionSpecification | string = id === "debris_flow" ? DEBRIS_COLOR : ["match", ["get", field], 1, LEVEL_COLORS[0], 2, LEVEL_COLORS[1], LEVEL_COLORS[2]];
        map.addLayer({ id, type: "fill", source: "noah", "source-layer": id, layout: { visibility: "none" }, paint: { "fill-color": color, "fill-opacity": 0.7 } });
      }
      for (const f of ["municipalities", "component_cities"]) {
        map.addSource(f, { type: "geojson", data: `/data/${f}.geojson` });
        map.addLayer({ id: `${f}-line`, type: "line", source: f, paint: { "line-color": "#1b2a4a", "line-width": 1.4, "line-opacity": 0.8 } });
      }
      setReady(true);
    });
    return () => { mapRef.current = null; map.remove(); };
  }, [bounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const id of LAYERS) map.setLayoutProperty(id, "visibility", id === active ? "visible" : "none");
  }, [active, ready]);

  if (failed) return <p className="rounded-2xl bg-fiesta-mint p-5 text-sm"><T k="hz.nogl" /></p>;
  const levels = kind === "debris" ? [{ c: DEBRIS_COLOR, l: "hz.debris.l" }] : LEVEL_COLORS.map((c, i) => ({ c, l: `hz.l.${i + 1}` }));
  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-black/75">{t("hz.lead").replace("{name}", name)}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("hz.tab")}>
        {KINDS.map((x) => <button key={x.kind} type="button" aria-pressed={kind === x.kind} className={chip(kind === x.kind)} onClick={() => setKind(x.kind)}><T k={x.label} /></button>)}
      </div>
      {vs && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("hz.variant")}>
          <span className="text-sm text-black/70"><T k="hz.variant" />:</span>
          {vs.map((v, i) => <button key={v.layer} type="button" aria-pressed={variant[kind] === i} className={chip(variant[kind] === i)} onClick={() => setVariant({ ...variant, [kind]: i })}><T k={v.label} /></button>)}
        </div>
      )}
      <div ref={el} role="img" aria-label={t("hz.aria").replace("{name}", name)} className="h-[26rem] w-full rounded-2xl lg:h-[32rem]" />
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold tracking-widest text-black/65"><T k="hz.legend" /></p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">{levels.map((x) => <li key={x.l} className="flex items-center gap-2 text-sm"><span className="h-4 w-4 rounded" style={{ background: x.c }} aria-hidden /><T k={x.l} /></li>)}</ul>
        <p className="mt-3 text-sm text-black/75"><T k={`hz.d.${kind}`} /></p>
      </div>
    </div>
  );
}
