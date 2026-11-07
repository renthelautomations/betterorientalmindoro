"use client";
import { useT } from "@/lib/i18n/i18n";

type Shape = { code: string; d: string; fill: string; name: string; value: string | null; href?: string };

/** Client half of LinkChoropleth: geometry is computed on the server, text (aria-label, "no data") is resolved here. ariaKey is a dictionary key. */
export default function ChoroSvg({ viewBox, shapes, legend, ariaKey, unit }: { viewBox: string; shapes: Shape[]; legend: { c: string; text: string }[]; ariaKey: string; unit?: string }) {
  const t = useT();
  return (
    <figure>
      <svg viewBox={viewBox} className="mx-auto h-auto w-full max-w-xs" role="group" aria-label={unit ? t(ariaKey).replace("{0}", t(unit)) : t(ariaKey)}>
        {shapes.map((r) => {
          const shape = <path d={r.d} fill={r.fill} stroke="#fff" strokeWidth="1.500" strokeLinejoin="round" className="transition-opacity hover:opacity-80"><title>{`${r.name}: ${r.value ?? t("bayan.map.nodata")}`}</title></path>;
          return r.href ? <a key={r.code} href={r.href}>{shape}</a> : <g key={r.code}>{shape}</g>;
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-black/70">
        {legend.map((l) => <span key={l.c} className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: l.c }} />{l.text}</span>)}
      </figcaption>
    </figure>
  );
}
