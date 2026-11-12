import { HalconShape, TamarawShape, HALCON, TAM_HALF, MangyanLines, LakeLines } from "./shapes";

// Fiesta palette: flat, bold, from the 74th-anniversary references.
export const FIESTA = { orange: "#e8552d", blue: "#2b4fa3", green: "#3aa65b", yellow: "#f4b92e", pink: "#f4a3c0", navy: "#1b2a4a", sky: "#4aa3d8", red: "#d2402f", mint: "#dcefe8", cream: "#fbf7f0" } as const;
/** Darker twins of the light brand colors. Use these under white text: plain green, sky and orange fail WCAG AA for it (3.1, 2.8, 3.6 vs 4.5). */
export const FIESTA_DEEP = { green: "#2a7f44", sky: "#1f7aaa", orange: "#c4431a" } as const;
const F = FIESTA;
const DEFAULT = [F.orange, F.blue, F.green, F.pink];

const rays = (n: number, r1: number, r2: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * r2, Math.sin(a) * r2] as const;
  });
const IKAT = ["00100", "01110", "11111", "01110", "00100"];

type Def = { w: number; h: number; label: string; tile: (c: string[]) => React.ReactNode };
export const PATTERNS = {
  mosaic: {
    w: 80, h: 80, label: "Tile mosaic (quarter disc, dots, triangle, semicircle)",
    tile: (c) => (
      <>
        <rect width="40" height="40" fill={c[3]} /><path d="M0 0H40A40 40 0 0 1 0 40Z" fill={c[0]} />
        <rect x="40" width="40" height="40" fill={c[1]} />
        {[50, 60, 70].flatMap((x) => [10, 20, 30].map((y) => <circle key={x + "-" + y} cx={x} cy={y} r="2.500" fill="#fff" />))}
        <rect y="40" width="40" height="40" fill={c[2]} /><path d="M0 80 40 40V80Z" fill={F.navy} />
        <rect x="40" y="40" width="40" height="40" fill={c[0]} /><path d="M40 80A20 20 0 0 1 80 80Z" fill={c[3]} />
      </>
    ),
  },
  dotblocks: {
    w: 36, h: 36, label: "Dot blocks (3x3)",
    tile: (c) => <>{[6, 18, 30].flatMap((x) => [6, 18, 30].map((y) => <circle key={x + "-" + y} cx={x} cy={y} r="3" fill={c[0]} />))}</>,
  },
  burst: {
    w: 64, h: 64, label: "Sunburst",
    tile: (c) => (
      <g transform="translate(32 32)"><circle r="8" fill={c[0]} />
        {rays(12, 14, 26).map((r, i) => <line key={i} x1={r[0]} y1={r[1]} x2={r[2]} y2={r[3]} stroke={c[0]} strokeWidth="3" strokeLinecap="round" />)}
      </g>
    ),
  },
  ikat: {
    w: 48, h: 48, label: "Pixel diamond (ikat-inspired)",
    tile: (c) => (
      <>{IKAT.flatMap((row, y) => [...row].map((v, x) => v === "1" && <rect key={x + "-" + y} x={4 + x * 8} y={4 + y * 8} width="7" height="7" fill={x === 2 && y === 2 ? c[1] ?? c[0] : c[0]} />))}</>
    ),
  },
  wave: {
    w: 48, h: 48, label: "Three-line waves",
    tile: (c) => <path d="M0 10Q12 0 24 10T48 10M0 26Q12 16 24 26T48 26M0 42Q12 32 24 42T48 42" fill="none" stroke={c[0]} strokeWidth="3.500" strokeLinecap="round" />,
  },
  peaks: {
    w: 56, h: 32, label: "Halcon massifs",
    tile: (c) => <g transform="translate(2 .5) scale(.33)"><HalconShape color={c[0]} /></g>,
  },
  horns: {
    w: 44, h: 52, label: "Tamaraw heads",
    tile: (c) => <g transform="translate(6 4) scale(.32)"><TamarawShape color={c[0]} /></g>,
  },
  mahaltana: {
    w: 192, h: 48, label: "Ma Hal Ta Na strip (Mangyan, Halcon, Tamaraw, Naujan)",
    tile: (c) => {
      const line = { fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round" } as const;
      return (
        <>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 48} width="48" height="48" fill={c[i] ?? c[0]} />)}
          <g transform="translate(9 9) scale(.3)" {...line} strokeWidth="6"><MangyanLines color="#fff" /></g>
          <g transform="translate(54 14) scale(.225)" {...line} strokeWidth="8"><path d={HALCON} /><path d="M102 2 96 36 88 66M72 18 66 44 56 72" strokeWidth="5.500" /></g>
          <g transform="translate(105 6) scale(.3)" {...line} strokeWidth="6"><path d={TAM_HALF} /><path d={TAM_HALF} transform="translate(100 0) scale(-1 1)" /></g>
          <g transform="translate(150 12) scale(.3)" {...line} strokeWidth="7"><LakeLines /></g>
        </>
      );
    },
  },
  emblems: {
    w: 96, h: 96, label: "Halcon + tamaraw tiles",
    tile: (c) => (
      <>
        <rect width="48" height="48" fill={c[2]} /><g transform="translate(6 14) scale(.225)"><HalconShape color="#fff" lit={false} /></g>
        <rect x="48" width="48" height="48" fill={c[0]} /><g transform="translate(57 6) scale(.3)"><TamarawShape color="#fff" /></g>
        <rect y="48" width="48" height="48" fill={c[1]} /><g transform="translate(9 54) scale(.3)"><TamarawShape color="#fff" /></g>
        <rect x="48" y="48" width="48" height="48" fill={F.navy} /><g transform="translate(54 62) scale(.225)"><HalconShape color={c[3]} lit={false} /></g>
      </>
    ),
  },
} satisfies Record<string, Def>;
export type PatternKey = keyof typeof PATTERNS;

export function PatternFill({ variant, colors = DEFAULT, opacity = 1, className = "absolute inset-0 h-full w-full" }: {
  variant: PatternKey; colors?: string[]; opacity?: number; className?: string;
}) {
  // Id from what the pattern is, not from useId: ids from separately streamed parts of a page can repeat, and a repeated id made one pattern paint over another (the footer strip showed dots or nothing). Same pattern, same colours, same id is harmless.
  const id = `pf-${variant}-${colors.join("").replace(/\W/g, "")}`;
  const p: Def = PATTERNS[variant];
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <defs><pattern id={id} width={p.w} height={p.h} patternUnits="userSpaceOnUse">{p.tile(colors)}</pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}
