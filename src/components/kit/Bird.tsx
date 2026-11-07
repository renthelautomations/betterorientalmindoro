import { FIESTA as F } from "./Patterns";

/** A bird whose wings flap by CSS (see globals.css). `travel` is its scroll travel in % of its own width. */
export default function Bird({ className, travel, flap, delay, color = F.navy }: { className: string; travel: number; flap: number; delay: number; color?: string }) {
  const vars = { "--flap": `${flap}s`, "--delay": `${delay}s` } as React.CSSProperties;
  return (
    <svg viewBox="0 0 30 14" className={`absolute ${className}`} style={{ transform: `translateX(calc(var(--p) * ${travel}%))`, ...vars }} aria-hidden="true" fill="none" stroke={color} strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round">
      <path className="bird-wing-l" d="M15 8Q9 2 1 6" /><path className="bird-wing-r" d="M15 8Q21 2 29 6" />
      <circle cx="15" cy="8" r="1.400" fill={color} stroke="none" />
    </svg>
  );
}
