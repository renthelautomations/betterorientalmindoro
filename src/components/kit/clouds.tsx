// Three cloud shapes, all with a flat base. Each has its own viewBox so widths scale them cleanly.
export const CLOUDS = {
  cumulus: { vb: "0 0 120 50", d: "M16 46C4 46 0 34 10 30 8 20 20 14 28 20 32 8 50 4 60 14 66 8 82 8 86 18 98 14 108 22 106 32 114 34 116 40 116 46Z" },
  stratus: { vb: "0 0 160 30", d: "M8 26C0 26 0 18 8 17 14 11 26 10 32 15 40 7 58 7 66 14 76 9 94 10 100 16 112 12 128 14 132 20 146 19 154 22 152 26Z" },
  puff: { vb: "0 0 70 40", d: "M8 36C0 36 -1 26 8 24 8 14 22 10 30 16 34 8 50 8 54 18 64 18 68 28 62 36Z" },
  // thin streak that catches the light near the horizon
  wisp: { vb: "0 0 200 20", d: "M4 14C20 10 40 14 60 11 90 6 120 12 150 9 170 8 190 12 196 14 170 17 100 18 4 17Z" },
  // big rolling cloud bank
  bank: { vb: "0 0 200 60", d: "M6 56C0 50 6 44 16 44 18 34 34 28 46 34 52 20 76 16 90 28 100 14 128 12 140 28 152 20 176 24 180 38 194 38 198 48 192 56Z" },
} as const;

export function Cloud({ kind, className, style, color = "#fff" }: { kind: keyof typeof CLOUDS; className: string; style?: React.CSSProperties; color?: string }) {
  return <svg viewBox={CLOUDS[kind].vb} className={`absolute ${className}`} style={style} aria-hidden="true"><path d={CLOUDS[kind].d} fill={color} /></svg>;
}

/** How far a cloud travels over the whole scroll, as a % of its own width. Far clouds: small, pale, slow. Near: big, bright, fast. */
export const drift = (shift: number) => ({ transform: `translateX(calc((var(--p) - 0.5) * ${shift}%))` });
