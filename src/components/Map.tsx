"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/i18n";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

// slugs: ADM3_PCODE -> municipality slug. Click a polygon to open its page.
// With onSelect, hover/tap reports the slug (null on leave) and click no longer navigates; the page shows its own "Buksan" link.
export default function Map({ slugs, onSelect, selected }: { slugs: Record<string, string>; onSelect?: (slug: string | null) => void; selected?: string | null }) {
  const el = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useT();
  const [failed, setFailed] = useState(false);
  const cb = useRef(onSelect);
  cb.current = onSelect;
  const mapRef = useRef<maplibregl.Map | null>(null);

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
    mapRef.current = map;
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
    map.on("load", () => {
      for (const f of ["municipalities", "component_cities"]) {
        map.addSource(f, { type: "geojson", data: `/data/${f}.geojson` });
        map.addLayer({ id: `${f}-fill`, type: "fill", source: f, paint: { "fill-color": "#2f6b4f", "fill-opacity": 0.35 } });
        map.addLayer({ id: `${f}-line`, type: "line", source: f, paint: { "line-color": "#1b2a4a", "line-width": 1 } });
        map.on("click", `${f}-fill`, (e: maplibregl.MapLayerMouseEvent) => {
          const slug = slugs[e.features![0].properties.ADM3_PCODE];
          if (!slug) return;
          if (cb.current) cb.current(slug);
          else router.push(`/bayan/${slug}`);
        });
        map.on("mousemove", `${f}-fill`, (e: maplibregl.MapLayerMouseEvent) => {
          map.getCanvas().style.cursor = "pointer";
          cb.current?.(slugs[e.features![0].properties.ADM3_PCODE] ?? null);
          popup.setLngLat(e.lngLat).setText(String(e.features![0].properties.ADM3_EN).replace(/\s*\(.*\)/, "")).addTo(map);
        });
        map.on("mouseleave", `${f}-fill`, () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      }
      for (const f of ["municipalities", "component_cities"]) {
        map.addLayer({ id: `${f}-sel`, type: "line", source: f, filter: ["==", ["get", "ADM3_PCODE"], ""], paint: { "line-color": "#e8552d", "line-width": 3 } });
      }
    });
    return () => { mapRef.current = null; map.remove(); };
  }, [slugs, router]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const pc = Object.entries(slugs).find(([, v]) => v === selected)?.[0] ?? "";
    for (const f of ["municipalities", "component_cities"]) if (map.getLayer(`${f}-sel`)) map.setFilter(`${f}-sel`, ["==", ["get", "ADM3_PCODE"], pc]);
  }, [selected, slugs]);

  if (failed) return <p className="rounded-2xl bg-black/5 p-6 text-sm text-black/65">{t("home.map.fail")}</p>;
  return <div ref={el} role="img" aria-label={t("home.map.aria")} className="h-[60vh] min-h-96 w-full rounded-2xl" />;
}
