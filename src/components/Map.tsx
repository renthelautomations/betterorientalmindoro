"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/i18n";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ReliefSvg, { RAMP, breaks, centroid, rings } from "./ReliefSvg";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

// Hillshade and 3D terrain read the same public tiles through two sources, as MapLibre recommends.
const DEM: maplibregl.RasterDEMSourceSpecification = { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], encoding: "terrarium", tileSize: 256, maxzoom: 12, attribution: "Terrain: Mapzen / AWS Open Data" };
const clean = (n: string) => n.replace(/\s*\(.*\)/, "").replace(/^City of (.*)$/, "$1 City");

type Props = { slugs: Record<string, string>; values?: Record<string, number>; onSelect?: (slug: string | null) => void; selected?: string | null };

/**
 * Tilted relief map. Terrain is real elevation; each town is a raised block whose height and shade follow `values`
 * (population). Hover lifts a block, click opens it (or reports it through onSelect). Falls back to ReliefSvg without WebGL.
 */
export default function Map({ slugs, values, onSelect, selected }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useT();
  const [failed, setFailed] = useState(false);
  const cb = useRef(onSelect);
  const mapRef = useRef<maplibregl.Map | null>(null);
  useEffect(() => { cb.current = onSelect; });

  useEffect(() => {
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: el.current!,
        style: { version: 8, sources: { dem: DEM, shade: DEM }, layers: [
          { id: "sea", type: "background", paint: { "background-color": "#cfe6ef" } },
          { id: "relief", type: "hillshade", source: "shade", paint: { "hillshade-exaggeration": 0.55, "hillshade-shadow-color": "#2d5a4a", "hillshade-highlight-color": "#fff8e6", "hillshade-accent-color": "#4a7a68" } },
        ] },
        bounds: [120.9, 12.25, 121.5, 13.5], fitBoundsOptions: { padding: 4, pitch: 52, bearing: -12 },
        pitch: 52, bearing: -12, maxPitch: 70, attributionControl: { compact: true }, cooperativeGestures: true,
      });
    } catch {
      queueMicrotask(() => setFailed(true)); // no WebGL: ReliefSvg and the plain town list take over
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    const markers: { m: maplibregl.Marker; el: HTMLElement; ll: [number, number]; pop: number }[] = [];
    let hovered: string | null = null;
    const sel = (id: string, key: "hover" | "selected", on: boolean) => map.setFeatureState({ source: "towns", id }, { [key]: on });

    map.on("load", async () => {
      try {
        const [a, b] = await Promise.all(["municipalities", "component_cities"].map((f) => fetch(`/data/${f}.geojson`).then((r) => r.json())));
        const feats = [...a.features, ...b.features];
        const brk = breaks(Object.values(values ?? {}));
        const max = Math.max(...Object.values(values ?? {}), 1);
        for (const f of feats) { const v = values?.[f.properties.ADM3_PCODE] ?? 0; f.properties.pop = v; f.properties.h = 700 + (values ? (v / max) * 7500 : 2500); }
        map.setTerrain({ source: "dem", exaggeration: 1.5 });
        map.setZoom(map.getZoom() + 0.3);
        map.addSource("towns", { type: "geojson", data: { type: "FeatureCollection", features: feats }, promoteId: "ADM3_PCODE" });
        const lit: maplibregl.ExpressionSpecification = ["any", ["boolean", ["feature-state", "hover"], false], ["boolean", ["feature-state", "selected"], false]];
        const ramp: unknown[] = ["step", ["get", "pop"], RAMP[0]]; brk.forEach((v, i) => ramp.push(v, RAMP[i + 1]));
        map.addLayer({ id: "towns-ext", type: "fill-extrusion", source: "towns", paint: {
          "fill-extrusion-color": ["case", lit, "#e8552d", values ? (ramp as maplibregl.ExpressionSpecification) : "#7fa4d6"],
          "fill-extrusion-height": ["+", ["get", "h"], ["case", lit, 900, 0]], "fill-extrusion-opacity": 0.94, "fill-extrusion-vertical-gradient": true } });
        map.addLayer({ id: "towns-line", type: "line", source: "towns", paint: { "line-color": "#ffffff", "line-width": 1.5, "line-opacity": 0.85 } });

        for (const f of feats) {
          const [lng, lat] = centroid(f.geometry);
          const d = document.createElement("div");
          d.textContent = clean(f.properties.ADM3_EN);
          d.className = "pointer-events-none hidden rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-[#1b2a4a] shadow sm:block";
          markers.push({ m: new maplibregl.Marker({ element: d, anchor: "bottom", offset: [0, -4] }).setLngLat([lng, lat]).addTo(map), el: d, ll: [lng, lat], pop: f.properties.pop });
        }
        // Declutter: biggest towns claim their label first; any label that would overlap one already placed is hidden.
        const declutter = () => {
          const placed: { x: number; y: number; w: number }[] = [];
          for (const k of [...markers].sort((a, b) => b.pop - a.pop)) {
            const p = map.project(k.ll), w = k.el.textContent!.length * 6.4 + 18;
            const clash = placed.some((q) => Math.abs(q.x - p.x) < (q.w + w) / 2 && Math.abs(q.y - p.y) < 20);
            k.el.style.visibility = clash ? "hidden" : "visible";
            if (!clash) placed.push({ x: p.x, y: p.y, w });
          }
        };
        map.on("moveend", declutter); map.once("idle", declutter);
        map.on("mousemove", "towns-ext", (e) => {
          const id = String(e.features![0].id);
          map.getCanvas().style.cursor = "pointer";
          if (hovered !== id) { if (hovered) sel(hovered, "hover", false); hovered = id; sel(id, "hover", true); cb.current?.(slugs[id] ?? null); }
        });
        map.on("mouseleave", "towns-ext", () => { map.getCanvas().style.cursor = ""; if (hovered) sel(hovered, "hover", false); hovered = null; });
        map.on("click", "towns-ext", (e) => {
          const slug = slugs[String(e.features![0].id)];
          if (!slug) return;
          if (cb.current) cb.current(slug); else router.push(`/bayan/${slug}`);
        });
        void rings;
      } catch { setFailed(true); }
    });
    return () => { markers.forEach((k) => k.m.remove()); mapRef.current = null; map.remove(); };
  }, [slugs, values, router]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getSource("towns")) return;
    for (const [pc, slug] of Object.entries(slugs)) map.setFeatureState({ source: "towns", id: pc }, { selected: slug === selected });
  }, [selected, slugs]);

  if (failed) return <ReliefSvg slugs={slugs} values={values} onSelect={onSelect} selected={selected} />;
  return <div ref={el} role="img" aria-label={t("home.map.aria")} className="h-[62vh] min-h-96 w-full overflow-hidden rounded-3xl ring-1 ring-black/5" />;
}
