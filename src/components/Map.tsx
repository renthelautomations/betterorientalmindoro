"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

// slugs: ADM3_PCODE -> municipality slug. Click a polygon to open its page.
export default function Map({ slugs }: { slugs: Record<string, string> }) {
  const el = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el.current!,
        style: { version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": "#e3eef2" } }] },
        bounds: [120.85, 12.2, 121.55, 13.55],
        fitBoundsOptions: { padding: 16 },
        attributionControl: false,
      });
    } catch {
      setFailed(true); // no WebGL: the page's plain municipality list still works
      return;
    }
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
    map.on("load", () => {
      for (const f of ["municipalities", "component_cities"]) {
        map.addSource(f, { type: "geojson", data: `/data/${f}.geojson` });
        map.addLayer({ id: `${f}-fill`, type: "fill", source: f, paint: { "fill-color": "#2f6b4f", "fill-opacity": 0.35 } });
        map.addLayer({ id: `${f}-line`, type: "line", source: f, paint: { "line-color": "#1b2a4a", "line-width": 1 } });
        map.on("click", `${f}-fill`, (e: maplibregl.MapLayerMouseEvent) => {
          const slug = slugs[e.features![0].properties.ADM3_PCODE];
          if (slug) router.push(`/bayan/${slug}`);
        });
        map.on("mousemove", `${f}-fill`, (e: maplibregl.MapLayerMouseEvent) => {
          map.getCanvas().style.cursor = "pointer";
          popup.setLngLat(e.lngLat).setText(String(e.features![0].properties.ADM3_EN).replace(/\s*\(.*\)/, "")).addTo(map);
        });
        map.on("mouseleave", `${f}-fill`, () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      }
    });
    return () => map.remove();
  }, [slugs, router]);

  if (failed) return <p className="rounded-2xl bg-black/5 p-6 text-sm text-black/65">Hindi ma-load ang mapa sa device na ito. Gamitin ang listahan sa ibaba.</p>;
  return <div ref={el} role="img" aria-label="Map of Oriental Mindoro municipalities" className="h-[60vh] min-h-96 w-full rounded-2xl" />;
}
