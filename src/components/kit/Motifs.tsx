// Flat vector motifs, dividers and hero backgrounds. Colors via props.
import { FIESTA as F, PatternFill, PATTERNS, type PatternKey } from "./Patterns";
import { HALCON, TAM_HALF, HalconShape, TamarawShape, MangyanLines, LakeLines } from "./shapes";

// ---- Motifs (flat, modeled on the four pennant emblems) ----

export function Halcon({ className = "h-24 w-auto", color = "currentColor", outline = false }: { className?: string; color?: string; outline?: boolean }) {
  if (outline)
    return (
      <svg viewBox="0 0 160 90" className={className} overflow="visible" aria-hidden="true" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d={HALCON} /><path d="M102 2 96 36 88 66M72 18 66 44 56 72" strokeWidth="3.500" />
      </svg>
    );
  // Massif with curved slopes, lit east face, ridge lines and a foothill band.
  return (
    <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
      <clipPath id="halcon-clip"><path d={HALCON} /></clipPath>
      <path d={HALCON} fill={color} />
      <g clipPath="url(#halcon-clip)">
        <path d="M97 2 101 7 104 4 107 11 111 9 114 16C119 18 122 22 125 26 134 38 144 58 150 90H110C118 60 104 36 97 2Z" fill="#fff" opacity=".26" />
        <path d="M102 2 96 36 88 66M72 18 66 44 56 72M134 28 140 54" fill="none" stroke="#000" opacity=".16" strokeWidth="1.600" strokeLinecap="round" />
        <path d="M0 90V82C22 70 44 78 66 76 92 74 120 66 160 76V90Z" fill="#000" opacity=".22" />
      </g>
    </svg>
  );
}

// One fused silhouette: horns rise from the brow in a V, ears out, face tapers to a narrow muzzle. Eyes/ears/nostrils are real cutouts.

export function Tamaraw({ className = "h-24 w-auto", color = "currentColor", outline = false }: { className?: string; color?: string; outline?: boolean }) {
  if (outline)
    return (
      <svg viewBox="0 0 100 120" className={className} overflow="visible" aria-hidden="true" fill="none" stroke={color} strokeWidth="4.500" strokeLinejoin="round" strokeLinecap="round">
        <path d={TAM_HALF} /><path d={TAM_HALF} transform="translate(100 0) scale(-1 1)" />
      </svg>
    );
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <g fill={color} fillRule="evenodd">
        <path d={TAM_HALF} /><path d={TAM_HALF} transform="translate(100 0) scale(-1 1)" />
      </g>
    </svg>
  );
}

export function Lake({ className = "h-24 w-auto", color = "currentColor" }: { className?: string; color?: string }) {
  return <svg viewBox="0 0 120 80" className={className} aria-hidden="true" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"><LakeLines /></svg>;
}

export function Mangyan({ className = "h-24 w-auto", color = "currentColor" }: { className?: string; color?: string }) {
  return <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"><MangyanLines color={color} /></svg>;
}

export function Sun({ className = "h-16 w-16", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="18" fill={color} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x="48" y="8" width="4" height="14" rx="2" fill={color} transform={`rotate(${i * 30} 50 50)`} />)}
    </svg>
  );
}

// ---- Dividers: flat strips, full width ----
export const DIVIDERS = {
  tiles: { label: "Tile strip", pattern: "mosaic" as PatternKey, h: 40, colors: [F.orange, F.blue, F.green, F.yellow] },
  mahaltana: { label: "Ma Hal Ta Na (the four pillars)", pattern: "mahaltana" as PatternKey, h: 48, colors: [F.blue, F.green, F.red, F.sky] },
  emblems: { label: "Halcon + tamaraw tiles", pattern: "emblems" as PatternKey, h: 48, colors: [F.red, F.blue, F.green, F.pink] },
  peaks: { label: "Halcon massifs", pattern: "peaks" as PatternKey, h: 32, colors: [F.green] },
  horns: { label: "Tamaraw heads", pattern: "horns" as PatternKey, h: 52, colors: [F.red] },
} as const;
export type DividerKey = keyof typeof DIVIDERS;

export function Divider({ variant, className = "" }: { variant: DividerKey; className?: string }) {
  const d = DIVIDERS[variant];
  // Tile strip is the 80x80 mosaic cropped to its top row.
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height: d.h }}>
      <PatternFill variant={d.pattern} colors={[...d.colors]} />
    </div>
  );
}

// ---- Hero backgrounds ----
export type BgKey = "mosaic" | "banners" | "panels" | "dawn" | "ikat";
export const BG_LABELS: Record<BgKey, string> = {
  mosaic: "Halcon + tamaraw tiles on mint",
  banners: "Four pennants (Ma Hal Ta Na emblems)",
  panels: "Color-block province collage",
  dawn: "Flat dawn over Halcon",
  ikat: "Navy pixel-diamond band",
};
const PENNANTS = [
  { c: F.blue, el: (c: string) => <Mangyan className="h-10 w-10" color={c} /> },
  { c: F.green, el: (c: string) => <Halcon className="h-8 w-11" color={c} outline /> },
  { c: F.red, el: (c: string) => <Tamaraw className="h-12 w-11" color={c} outline /> },
  { c: F.sky, el: (c: string) => <Lake className="h-10 w-12" color={c} /> },
];

export function HeroBg({ variant, children, className = "" }: { variant: BgKey; children?: React.ReactNode; className?: string }) {
  const base = `relative isolate overflow-hidden ${className}`;
  if (variant === "mosaic")
    return (
      <div className={base} style={{ background: F.mint }}>
        <div className="absolute inset-y-0 right-0 -z-10 w-1/2 min-w-52"><PatternFill variant="emblems" colors={[F.red, F.blue, F.green, F.pink]} /></div>
        <div className="relative">{children}</div>
      </div>
    );
  if (variant === "banners")
    return (
      <div className={base} style={{ background: F.cream }}>
        <div className="absolute right-6 top-4 -z-10 hidden w-[46%] sm:block">
          <div className="h-1 rounded bg-[#8b8f99]" />
          <div className="mt-0 flex justify-between gap-2 px-2">
            {PENNANTS.map((p, i) => (
              <div key={i} className="flex aspect-[1/1.9] min-w-0 flex-1 items-start justify-center pt-5" style={{ background: p.c, clipPath: "polygon(0 0,100% 0,100% 82%,50% 100%,0 82%)" }}>{p.el("#fff")}</div>
            ))}
          </div>
        </div>
        <div className="relative">{children}</div>
      </div>
    );
  if (variant === "panels")
    return (
      <div className={base} style={{ background: F.cream }}>
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMaxYMid slice" className="absolute inset-y-0 right-0 -z-10 h-full w-1/2" aria-hidden="true">
          <path d="M20 60 140 20l90 50-10 130-130 40L10 170Z" fill={F.green} />
          <path d="M150 40l110-10 40 80-30 80-70-20Z" fill={F.red} />
          <path d="M300 30l60 10-10 180-50-20Z" fill={F.blue} />
          <ellipse cx="190" cy="235" rx="52" ry="40" fill={F.sky} />
          <g transform="translate(34 118) scale(.9)"><HalconShape color="#fff" lit={false} /></g><g transform="translate(185 52) scale(.95)"><TamarawShape color="#fff" /></g><circle cx="262" cy="60" r="10" fill={F.yellow} />
        </svg>
        <div className="relative">{children}</div>
      </div>
    );
  if (variant === "dawn")
    return (
      <div className={base} style={{ background: F.yellow }}>
        <Sun className="absolute right-[4%] top-6 -z-10 h-20 w-20" color={F.orange} />
        <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 -z-10 h-full w-full" aria-hidden="true">
          <g transform="translate(0 60)"><path d="M0 400L255 222 345 267 540 80 645 151 765 9 915 169 1005 124 1200 400Z" fill={F.blue} /><path d="M765 9 915 169 1005 124 1200 400H840L765 178Z" fill="#fff" opacity=".18" /></g>
          <path d="M0 400V300l150-60 110 50 140-70 120 60 160-80 140 70 140-40 140 60 100-40V400Z" fill={F.green} />
          <path d="M0 400V340l200-40 180 40 180-30 200 40 200-35 240 30V400Z" fill={F.navy} />
        </svg>
        <div className="relative">{children}</div>
      </div>
    );
  return (
    <div className={`${base} text-white`} style={{ background: F.navy }}>
      <PatternFill variant="ikat" colors={[F.orange, F.yellow]} opacity={0.3} />
      <div className="absolute inset-x-0 bottom-0 h-3" style={{ background: `repeating-linear-gradient(90deg,${F.orange} 0 24px,${F.green} 24px 48px,${F.sky} 48px 72px,${F.yellow} 72px 96px)` }} />
      <div className="relative">{children}</div>
    </div>
  );
}

export { PATTERNS };
