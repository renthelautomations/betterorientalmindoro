"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

// Hillshade and 3D terrain read the same tiles through two sources, as MapLibre recommends.
const DEM: maplibregl.RasterDEMSourceSpecification = { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], encoding: "terrarium", tileSize: 256, maxzoom: 12, attribution: "Terrain: Mapzen / AWS Open Data" };

/** Tilted 3D relief of the province. Elevation comes from the public AWS terrain tiles (needs network + WebGL). */
export default function Terrain3D() {
  const el = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el.current!,
        style: {
          version: 8,
          sources: { dem: DEM, shade: DEM },
          layers: [
            { id: "bg", type: "background", paint: { "background-color": "#cfe6ef" } },
            { id: "relief", type: "hillshade", source: "shade", paint: { "hillshade-exaggeration": 0.7, "hillshade-shadow-color": "#1d4a37", "hillshade-highlight-color": "#fff4d6", "hillshade-accent-color": "#2f6b4f" } },
          ],
        },
        center: [121.25, 13.05], zoom: 8.4, pitch: 62, bearing: -18, maxPitch: 75,
        attributionControl: { compact: true },
      });
    } catch { setFailed(true); return; }
    map.on("load", () => {
      map.setTerrain({ source: "dem", exaggeration: 1.8 });
      map.addSource("towns", { type: "geojson", data: "/data/municipalities.geojson" });
      map.addLayer({ id: "towns-line", type: "line", source: "towns", paint: { "line-color": "#fff", "line-width": 1.200, "line-opacity": 0.7 } });
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    return () => map.remove();
  }, []);
  if (failed) return <p className="rounded-2xl bg-black/5 p-6 text-sm text-black/65">Hindi ma-load ang 3D na mapa sa device na ito (kailangan ng WebGL).</p>;
  return <div ref={el} role="img" aria-label="3D relief map of Oriental Mindoro, drag to rotate" className="h-[60vh] min-h-96 w-full rounded-2xl" />;
}
