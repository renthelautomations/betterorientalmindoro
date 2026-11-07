"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

export type Pt = { id: string; lat: number; lon: number };

/** Project points as a circle layer over the municipality outlines. One point = a record pin (no click, zoomed in). */
export default function ProjectMap({ points, label }: { points: Pt[]; label: string }) {
  const el = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const single = points.length === 1;

  useEffect(() => {
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el.current!,
        style: { version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": "#e3eef2" } }] },
        ...(single ? { center: [points[0].lon, points[0].lat] as [number, number], zoom: 11 } : { bounds: [120.85, 12.2, 121.55, 13.55] as [number, number, number, number], fitBoundsOptions: { padding: 16 } }),
        attributionControl: false,
      });
    } catch {
      setFailed(true); // no WebGL: the list next to the map still works
      return;
    }
    map.on("load", () => {
      for (const f of ["municipalities", "component_cities"]) {
        map.addSource(f, { type: "geojson", data: `/data/${f}.geojson` });
        map.addLayer({ id: `${f}-fill`, type: "fill", source: f, paint: { "fill-color": "#dcefe8", "fill-opacity": 0.9 } });
        map.addLayer({ id: `${f}-line`, type: "line", source: f, paint: { "line-color": "#1b2a4a", "line-width": 1 } });
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

  if (failed) return <p className="rounded-2xl bg-black/5 p-6 text-sm text-black/70">Hindi ma-load ang mapa sa device na ito. Gamitin ang listahan sa ibaba.</p>;
  return <div ref={el} role="img" aria-label={label} className={`w-full rounded-2xl ${single ? "h-64" : "h-80 lg:h-96"}`} />;
}
