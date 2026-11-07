"use client";
import { useRef } from "react";
import { Cloud, drift } from "./clouds";
import { FIESTA as F, PatternFill } from "./Patterns";
import { HalconShape } from "./shapes";
import { useScrollProgress } from "./useScrollProgress";
import { T } from "./i18n";
import Bird from "./Bird";

const STEPS = [1, 2, 3].map((n) => ({ h: `scene.na.${n}.h`, p: `scene.na.${n}.p` }));
// Captions mirror src/lib/stories.ts (which is itself marked draft: volunteers verify before launch).

// Seeded RNG so server and client draw the same scene.
const rng = (seed: number) => { let a = seed; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

const REEDS = (() => {
  const r = rng(11);
  return Array.from({ length: 46 }, (_, i) => { const x = -10 + (i / 45) * 1220 + (r() - 0.5) * 20, h = 30 + r() * 60, lean = (r() - 0.5) * 16; return `M${x.toFixed(1)} 100Q${(x + lean / 2).toFixed(1)} ${(100 - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(100 - h).toFixed(1)}L${(x + 3 + lean).toFixed(1)} ${(100 - h).toFixed(1)}Q${(x + 3 + lean / 2).toFixed(1)} ${(100 - h * 0.6).toFixed(1)} ${(x + 4).toFixed(1)} 100Z`; }).join("");
})();

// Near hill whose top edge is a row of pines (serrated), riding a gentle swell.
const PINE_HILL = (() => {
  const r = rng(5);
  let d = "M-10 200V160";
  for (let x = -10; x <= 1210; x += 13 + r() * 6) {
    const base = 156 + 7 * Math.sin(x / 150) + (x > 700 ? 4 : 0), h = 16 + r() * 16, w = h * 0.7;
    d += `L${(x - w / 2).toFixed(1)} ${base.toFixed(1)}L${x.toFixed(1)} ${(base - h).toFixed(1)}L${(x + w / 2).toFixed(1)} ${base.toFixed(1)}`;
  }
  return d + "L1210 200Z";
})();

/** Naujan Lake at dusk. Sun sinks, birds flap across, water ripples, all from the --p scroll variable. */
export default function NaujanScroll() {
  const root = useRef<HTMLDivElement>(null);
  useScrollProgress(root);
  const op = (i: number) => `clamp(0, calc((var(--p) - ${i / 3 - 0.08}) * 12), 1) * clamp(0, calc((${(i + 1) / 3 + 0.04} - var(--p)) * 12), 1)`;
  const WARM = "#ffd9c4", CREAM = "#fff6ea";
  return (
    <div ref={root} className="relative h-[260vh] [--p:0]">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ background: `linear-gradient(180deg, color-mix(in srgb, #7cc3ea calc((1 - var(--p)) * 100%), #3b3f8f) 0%, color-mix(in srgb, #fbe3a6 calc((1 - var(--p)) * 100%), ${F.orange}) 62%)` }}>
        <div className="absolute left-1/2 h-28 w-28 -translate-x-1/2 rounded-full" style={{ background: F.yellow, top: "calc(32% + var(--p) * 26%)", boxShadow: "0 0 0 22px rgb(244 185 46 / .18), 0 0 0 54px rgb(244 185 46 / .09)" }} aria-hidden />

        {/* clouds: five shapes, three depths, spread over all four corners and the horizon */}
        <Cloud kind="wisp" className="top-[8%] right-[6%] w-[26%] opacity-70" color={CREAM} style={drift(-30)} />
        <Cloud kind="puff" className="top-[17%] left-[4%] w-[11%] opacity-75" color={CREAM} style={drift(70)} />
        <Cloud kind="puff" className="top-[24%] left-[34%] w-[6%] opacity-55" color={CREAM} style={drift(-90)} />
        <Cloud kind="stratus" className="top-[30%] right-[20%] w-[21%] opacity-85" color={CREAM} style={drift(45)} />
        <Cloud kind="cumulus" className="top-[32%] left-[7%] w-[27%] opacity-95" color="#fff" style={drift(-35)} />
        <Cloud kind="puff" className="top-[38%] right-[4%] w-[13%] opacity-90" color={WARM} style={drift(60)} />
        <Cloud kind="wisp" className="top-[42%] right-[28%] w-[20%] opacity-85" color={WARM} style={drift(-50)} />
        <Cloud kind="bank" className="top-[36%] left-[26%] w-[34%] opacity-90" color={WARM} style={drift(25)} />

        {/* birds: a loose V, different wing speeds and starting beats */}
        <Bird className="top-[22%] left-[2%] w-[2.6%]" travel={2800} flap={0.62} delay={0} />
        <Bird className="top-[25%] left-[-1%] w-[2.2%]" travel={3000} flap={0.7} delay={-0.2} />
        <Bird className="top-[19%] left-[-1%] w-[2.2%]" travel={3000} flap={0.66} delay={-0.4} />
        <Bird className="top-[28%] left-[-4%] w-[1.8%]" travel={3300} flap={0.76} delay={-0.1} />
        <Bird className="top-[16%] left-[-4%] w-[1.8%]" travel={3300} flap={0.58} delay={-0.35} />
        <Bird className="top-[34%] left-[0%] w-[1.4%]" travel={2200} flap={0.5} delay={-0.15} />

        {/* hills: Halcon far in the haze, then three layers of growing contrast */}
        <div className="absolute inset-x-0 top-[34%] h-[28%]" aria-hidden>
          <div className="absolute bottom-[34%] right-[12%] w-[34%] opacity-80" style={{ transform: "translateX(calc((0.5 - var(--p)) * 6%))" }}><svg viewBox="0 0 160 90" className="h-auto w-full"><HalconShape color="#9a90d0" /></svg></div>
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d="M0 200V122C100 90 200 112 320 82S520 104 640 72 860 104 980 80 1120 104 1200 92V200Z" fill="#7a6fb5" opacity=".9" />
            <path d="M0 200V142C120 112 220 134 340 114S560 130 700 106 900 134 1040 118 1160 132 1200 122V200Z" fill="#5b4c99" />
            <path d={PINE_HILL} fill="#3b2f73" />
          </svg>
        </div>
        {/* the lake: sun glitter, ripples, soft reflection of the hills */}
        <div className="absolute inset-x-0 bottom-0 top-[62%] overflow-hidden" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${F.sky} 70%, ${F.orange}) 0%, ${F.blue} 60%, ${F.navy} 100%)` }} aria-hidden>
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[34%] w-full -scale-y-100 opacity-25"><path d="M0 200V142C120 112 220 134 340 114S560 130 700 106 900 134 1040 118 1160 132 1200 122V200Z" fill="#2a2060" /><path d={PINE_HILL} fill="#1d1546" /></svg>
          <div className="absolute left-1/2 top-0 h-full w-24 -translate-x-1/2 opacity-60" style={{ background: `linear-gradient(180deg, ${F.yellow}, transparent)`, filter: "blur(6px)" }} />
          <div className="absolute -inset-x-[10%] inset-y-0 opacity-15" style={{ transform: "translateX(calc((var(--p) - 0.5) * 12%))" }}><PatternFill variant="wave" colors={["#fff"]} /></div>
        </div>
        <svg viewBox="0 0 1200 100" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[16%] w-full" aria-hidden><path d={REEDS} fill="#14402a" /></svg>
        <div className="absolute inset-x-0 top-[9%] mx-auto max-w-xl px-6">
          {STEPS.map((s, i) => (
            <div key={s.h} className="absolute inset-x-6 text-center" style={{ opacity: `calc(${op(i)})` }}>
              <h3 className="font-serif text-3xl font-bold text-white md:text-5xl" style={{ textShadow: "0 2px 12px rgb(27 42 74 / .45)" }}><T k={s.h} /></h3>
              <p className="mt-3 text-base font-medium text-white/90 md:text-lg" style={{ textShadow: "0 1px 8px rgb(27 42 74 / .5)" }}><T k={s.p} /></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
