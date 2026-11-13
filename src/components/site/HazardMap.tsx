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
export type MapProject = { id: string; title: string; cost?: number; status?: string; year?: number; category?: string; lon: number; lat: number };
export default function HazardMap({ name, bounds, pcode, projects = [] }: { name: string; bounds: [number, number, number, number]; pcode: string; projects?: MapProject[] }) {
  const t = useT();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tiles, setTiles] = useState<"loading" | "ok" | "error">("loading");
  const [shown, setShown] = useState<number | null>(null);
  const [showProj, setShowProj] = useState(false);
  const [floodOnly, setFloodOnly] = useState(false);
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
        map.addLayer({ id, type: "fill", source: "noah", "source-layer": id, layout: { visibility: "none" }, paint: { "fill-color": color, "fill-opacity": 0.78 } });
      }
      for (const f of ["municipalities", "component_cities"]) {
        map.addSource(f, { type: "geojson", data: `/data/${f}.geojson` });
        map.addLayer({ id: `${f}-line`, type: "line", source: f, paint: { "line-color": "#1b2a4a", "line-width": 1.4, "line-opacity": 0.8 } });
        map.addLayer({ id: `${f}-this`, type: "line", source: f, filter: ["==", ["get", "ADM3_PCODE"], pcode], paint: { "line-color": "#e8552d", "line-width": 3, "line-opacity": 0.95 } }); // this town, drawn heavier
      }
      map.addSource("projects", { type: "geojson", data: { type: "FeatureCollection", features: projects.map((p) => ({ type: "Feature", geometry: { type: "Point", coordinates: [p.lon, p.lat] }, properties: { id: p.id, title: p.title, cost: p.cost ?? null, status: p.status ?? "", year: p.year ?? null, flood: /flood/i.test(p.category ?? "") } })) } });
      map.addLayer({ id: "projects", type: "circle", source: "projects", layout: { visibility: "none" }, paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 3.5, 14, 7], "circle-color": ["case", ["get", "flood"], "#e8552d", "#2b4fa3"], "circle-stroke-color": "#fff", "circle-stroke-width": 1.6 } });
      map.on("click", "projects", (e) => {
        const f = e.features?.[0]; if (!f) return;
        const q = f.properties as { id: string; title: string; cost: number | null; status: string; year: number | null };
        const box = document.createElement("div"); box.style.cssText = "max-width:16rem;font:13px/1.35 system-ui";
        const h = document.createElement("div"); h.textContent = q.title; h.style.cssText = "font-weight:700;color:#1b2a4a"; box.append(h);
        const m = document.createElement("div"); m.textContent = [q.cost ? `₱${Math.round(q.cost).toLocaleString("en-PH")}` : "", q.status, q.year].filter(Boolean).join(" · "); m.style.cssText = "margin:4px 0;color:#555"; box.append(m);
        const a = document.createElement("a"); a.href = `/proyekto/${q.id}`; a.textContent = "Open project"; a.style.cssText = "color:#2b4fa3;font-weight:600"; box.append(a);
        new maplibregl.Popup({ closeButton: true, maxWidth: "18rem" }).setLngLat((f.geometry as unknown as { coordinates: [number, number] }).coordinates).setDOMContent(box).addTo(map);
      });
      map.on("mouseenter", "projects", () => { map.getCanvas().style.cursor = "pointer"; }); map.on("mouseleave", "projects", () => { map.getCanvas().style.cursor = ""; });
      // Barangay lines appear as you zoom in; names of towns when zoomed out, names of barangays when zoomed in (small barangays only at higher zoom, so labels stay readable).
      map.addSource("brgy", { type: "geojson", data: "/data/barangays.geojson" });
      map.addLayer({ id: "brgy-line", type: "line", source: "brgy", minzoom: 10.3, paint: { "line-color": "#1b2a4a", "line-width": ["interpolate", ["linear"], ["zoom"], 10.3, 0.4, 14, 1.2], "line-opacity": 0.5 } });
      const mid = (g: { type: string; coordinates: number[][][] | number[][][][] }) => { const rings = (g.type === "Polygon" ? [g.coordinates as number[][][]] : (g.coordinates as number[][][][])).map((p) => p[0]); const big = rings.reduce((a, r) => (r.length > a.length ? r : a), rings[0]); return [big.reduce((x, p) => x + p[0], 0) / big.length, big.reduce((y, p) => y + p[1], 0) / big.length] as [number, number]; };
      const labels: { el: HTMLElement; min: number; max: number }[] = [];
      const add = (text: string, at: [number, number], cls: string, min: number, max: number) => {
        const el = document.createElement("div"); el.textContent = text; el.className = `pointer-events-none whitespace-nowrap text-center ${cls}`; el.style.textShadow = "0 0 3px #fff, 0 0 3px #fff, 0 0 5px #fff"; el.style.display = "none";
        new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(at).addTo(map); labels.push({ el, min, max });
      };
      const sync = () => { const z = map.getZoom(); for (const l of labels) l.el.style.display = z >= l.min && z < l.max ? "" : "none"; };
      const clean = (n: string) => { const b = n.replace(/\s*\(.*\)/, "").trim(); return b.startsWith("City of ") ? `${b.slice(8)} City` : b; };
      type Fc = { features: { properties: Record<string, string | number>; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] };
      Promise.all(["municipalities", "component_cities", "barangays"].map((f) => fetch(`/data/${f}.geojson`).then((r) => r.json() as Promise<Fc>))).then(([a, b, c]) => {
        for (const f of [...a.features, ...b.features]) add(clean(String(f.properties.ADM3_EN)), mid(f.geometry), `font-serif text-sm font-bold ${f.properties.ADM3_PCODE === pcode ? "text-fiesta-orange" : "text-fiesta-navy"}`, 0, 11.6);
        for (const f of c.features) { const area = Number(f.properties.AREA_SQKM); add(String(f.properties.ADM4_EN).replace(/\s*\(Pob\.\)/, ""), mid(f.geometry), `text-[11px] font-semibold ${f.properties.ADM3_PCODE === pcode ? "text-fiesta-navy" : "text-black/60"}`, area > 25 ? 11.6 : area > 6 ? 12.2 : 13, 99); }
        sync(); map.on("zoom", sync);
      }).catch(() => { /* labels are a help, not a need: the hazard map works without them */ });
      setReady(true);
    });
    // The hazard tiles come from our storage bucket; say so on screen if they do not arrive instead of showing a bare relief map.
    map.on("sourcedata", (e) => { if (e.sourceId === "noah" && e.isSourceLoaded) setTiles("ok"); });
    map.on("error", (e) => { if ((e as { sourceId?: string }).sourceId === "noah") setTiles("error"); });
    return () => { mapRef.current = null; map.remove(); };
  }, [bounds, pcode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const id of LAYERS) map.setLayoutProperty(id, "visibility", id === active ? "visible" : "none");
    setShown(null);
    const count = () => setShown(map.queryRenderedFeatures({ layers: [active] }).length);
    map.on("idle", count); // after every pan, zoom or layer change: is any of this hazard drawn in view?
    return () => { map.off("idle", count); };
  }, [active, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty("projects", "visibility", showProj ? "visible" : "none");
    map.setFilter("projects", floodOnly ? ["==", ["get", "flood"], true] : null);
  }, [showProj, floodOnly, ready]);

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
      {projects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("hz.proj")}>
          <button type="button" aria-pressed={showProj} className={chip(showProj)} onClick={() => setShowProj(!showProj)}><T k="hz.proj" /> ({projects.length})</button>
          {showProj && <button type="button" aria-pressed={floodOnly} className={chip(floodOnly)} onClick={() => setFloodOnly(!floodOnly)}><T k="hz.proj.flood" /></button>}
          {showProj && <span className="flex items-center gap-4 text-xs text-black/70"><span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-fiesta-orange" /><T k="hz.proj.f" /></span><span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-fiesta-blue" /><T k="hz.proj.o" /></span></span>}
        </div>
      )}
      {tiles === "error" && <p role="alert" className="rounded-2xl bg-fiesta-red/10 p-4 text-sm font-semibold text-fiesta-navy"><T k="hz.err" /></p>}
      <p className="text-xs text-black/65"><T k="hz.zoomhint" /></p>
      <div ref={el} role="img" aria-label={t("hz.aria").replace("{name}", name)} className="h-[26rem] w-full rounded-2xl lg:h-[32rem]" />
      <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${tiles === "loading" || shown === null ? "bg-black/5 text-black/70" : shown ? "bg-fiesta-mint text-fiesta-navy" : "bg-fiesta-yellow/30 text-fiesta-navy"}`} aria-live="polite">
        {tiles === "loading" || shown === null ? <T k="hz.st.load" /> : shown ? <T k="hz.st.some" /> : <T k="hz.st.none" />}
      </p>
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold tracking-widest text-black/65"><T k="hz.legend" /></p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">{levels.map((x) => <li key={x.l} className="flex items-center gap-2 text-sm"><span className="h-4 w-4 rounded" style={{ background: x.c }} aria-hidden /><T k={x.l} /></li>)}</ul>
        <p className="mt-3 text-sm text-black/75"><T k={`hz.d.${kind}`} /></p>
      </div>
    </div>
  );
}
