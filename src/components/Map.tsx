"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

export default function Map() {
  const el = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{ name: string; area: number } | null>(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: el.current!,
      style: { version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": "#e8f1f5" } }] },
      bounds: [120.3, 12.2, 121.7, 13.6],
    });
    map.on("load", () => {
      for (const f of ["municipalities", "component_cities"]) {
        map.addSource(f, { type: "geojson", data: `/data/${f}.geojson` });
        map.addLayer({ id: `${f}-fill`, type: "fill", source: f, paint: { "fill-color": "#2f855a", "fill-opacity": 0.35 } });
        map.addLayer({ id: `${f}-line`, type: "line", source: f, paint: { "line-color": "#22543d", "line-width": 1 } });
        map.on("click", `${f}-fill`, (e: maplibregl.MapLayerMouseEvent) => {
          const p = e.features![0].properties;
          setSel({ name: p.ADM3_EN ?? p.psgc_name, area: Math.round(p.AREA_SQKM) });
        });
        map.on("mouseenter", `${f}-fill`, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", `${f}-fill`, () => (map.getCanvas().style.cursor = ""));
      }
    });
    return () => map.remove();
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <div ref={el} className="h-full w-full" />
      {sel && (
        <div className="absolute left-4 top-4 rounded bg-white p-3 shadow">
          <b>{sel.name}</b>
          <div className="text-sm">{sel.area.toLocaleString()} km²</div>
        </div>
      )}
    </div>
  );
}
