"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReliefSvg from "@/components/ReliefSvg";
import { useT } from "@/lib/i18n/i18n";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

const DEM: maplibregl.RasterDEMSourceSpecification = { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], encoding: "terrarium", tileSize: 256, maxzoom: 12, attribution: "Terrain: Mapzen / AWS Open Data" };

export type Pt = { id: string; lat: number; lon: number };

/** Project points as a circle layer over the municipality outlines. One point = a record pin (no click, zoomed in). */
export default function ProjectMap({ points, label, vars = {} }: { points: Pt[]; label: string; vars?: Record<string, string | number> }) {
  const t = useT();
  const el = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const single = points.length === 1;

  useEffect(() => {
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el.current!,
        style: { version: 8, sources: { dem: DEM, shade: DEM }, layers: [{ id: "bg", type: "background", paint: { "background-color": "#cfe6ef" } }, { id: "relief", type: "hillshade", source: "shade", paint: { "hillshade-exaggeration": 0.55, "hillshade-shadow-color": "#2d5a4a", "hillshade-highlight-color": "#fff8e6", "hillshade-accent-color": "#4a7a68" } }] },
        pitch: single ? 45 : 38,
        ...(single ? { center: [points[0].lon, points[0].lat] as [number, number], zoom: 11 } : { bounds: [120.85, 12.2, 121.55, 13.55] as [number, number, number, number], fitBoundsOptions: { padding: 16 } }),
        attributionControl: { compact: true },
      });
    } catch {
      queueMicrotask(() => setFailed(true)); // no WebGL: relief drawing and the list next to the map take over
      return;
    }
    map.on("load", () => {
      map.setTerrain({ source: "dem", exaggeration: 1.4 });
      for (const f of ["municipalities", "component_cities"]) {
        map.addSource(f, { type: "geojson", data: `/data/${f}.geojson` });
        map.addLayer({ id: `${f}-fill`, type: "fill", source: f, paint: { "fill-color": "#ffffff", "fill-opacity": 0.14 } });
        map.addLayer({ id: `${f}-line`, type: "line", source: f, paint: { "line-color": "#ffffff", "line-width": 1.3, "line-opacity": 0.9 } });
      }
      map.addSource("pts", {
        type: "geojson",
        data: { type: "FeatureCollection", features: points.map((p) => ({ type: "Feature", properties: { id: p.id }, geometry: { type: "Point", coordinates: [p.lon, p.lat] } })) },
      });
      map.addLayer({ id: "pts", type: "circle", source: "pts", paint: { "circle-radius": single ? 8 : 3.5, "circle-color": "#b5532f", "circle-stroke-color": "#fff", "circle-stroke-width": single ? 2 : 1, "circle-opacity": 0.85 } });
      if (!single) {
        map.on("click", "pts", (e: maplibregl.MapLayerMouseEvent) => router.push(`/proyekto/${e.features![0].properties.id}`));
        map.on("mouseenter", "pts", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "pts", () => (map.getCanvas().style.cursor = ""));
      }
    });
    return () => map.remove();
  }, [points, single, router]);

  if (failed) return <ReliefSvg slugs={{}} />;
  return <div ref={el} role="img" aria-label={Object.entries(vars).reduce((a, [k, v]) => a.replace(`{${k}}`, String(v)), t(label))} className={`w-full rounded-2xl ${single ? "h-64" : "h-80 lg:h-96"}`} />;
}
