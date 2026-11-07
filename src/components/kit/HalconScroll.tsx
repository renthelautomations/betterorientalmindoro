"use client";
import { useRef } from "react";
import { Cloud, drift } from "./clouds";
import { useScrollProgress } from "./useScrollProgress";
import { T } from "./i18n";
import Bird from "./Bird";
import { HALCON, HalconShape } from "./shapes";
import { FIESTA as F } from "./Patterns";

const STEPS = [1, 2, 3].map((n) => ({ h: `scene.hal.${n}.h`, p: `scene.hal.${n}.p` }));

// Seeded forest so server and client render the same trees. Two-tier pines of varied height.
function forest(seed: number, n: number, hMin: number, hMax: number) {
  let a = seed;
  const rnd = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let d = "";
  for (let i = 0; i < n; i++) {
    const x = -20 + (i / (n - 1)) * 1240 + (rnd() - 0.5) * 14, h = hMin + rnd() * (hMax - hMin), w = h * 0.62, y = 100;
    d += `M${(x - w / 2).toFixed(1)} ${y}L${x.toFixed(1)} ${(y - h * 0.72).toFixed(1)}L${(x + w / 2).toFixed(1)} ${y}ZM${(x - w * 0.36).toFixed(1)} ${(y - h * 0.4).toFixed(1)}L${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + w * 0.36).toFixed(1)} ${(y - h * 0.4).toFixed(1)}Z`;
  }
  return d;
}
const TREES_BACK = forest(7, 64, 34, 58), TREES_FRONT = forest(21, 56, 26, 46);

/** Scroll-driven scene. Sets --p (0..1) on the root; layers move with CSS only. Static when reduced motion is on. */
export default function HalconScroll() {
  const root = useRef<HTMLDivElement>(null);
  useScrollProgress(root);
  const op = (i: number) => `clamp(0, calc((var(--p) - ${i / 3 - 0.08}) * 12), 1) * clamp(0, calc((${(i + 1) / 3 + 0.04} - var(--p)) * 12), 1)`;
  return (
    <div ref={root} className="relative h-[260vh] [--p:0]">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${F.yellow} calc((1 - var(--p)) * 100%), #5fb0e6), color-mix(in srgb, #fbe3a6 calc((1 - var(--p)) * 100%), #bfe3f6))` }}>
        {/* sun */}
        <div className="absolute right-[14%] h-24 w-24 rounded-full" style={{ background: F.orange, top: "calc(58% - var(--p) * 46%)", boxShadow: "0 0 0 18px rgb(232 85 45 / .12), 0 0 0 40px rgb(232 85 45 / .07)" }} aria-hidden />
        {/* clouds: five shapes, three depths, every corner and the horizon covered */}
        <Cloud kind="wisp" className="top-[7%] right-[6%] w-[26%] opacity-70" color="#fff6ea" style={drift(-30)} />
        <Cloud kind="puff" className="top-[17%] left-[7%] w-[10%] opacity-75" style={drift(70)} />
        <Cloud kind="puff" className="top-[27%] left-[38%] w-[6%] opacity-55" style={drift(-90)} />
        <Cloud kind="stratus" className="top-[22%] right-[10%] w-[20%] opacity-80" style={drift(-45)} />
        <Cloud kind="bank" className="top-[40%] left-[2%] w-[30%] opacity-85" color="#fff0e0" style={drift(30)} />
        <Cloud kind="wisp" className="top-[44%] right-[2%] w-[22%] opacity-80" color="#ffe3cf" style={drift(-55)} />
        {/* birds, flapping */}
        <Bird className="top-[26%] left-[1%] w-[2.6%]" travel={2800} flap={0.62} delay={0} />
        <Bird className="top-[29%] left-[-2%] w-[2.2%]" travel={3000} flap={0.7} delay={-0.2} />
        <Bird className="top-[23%] left-[-2%] w-[2.2%]" travel={3000} flap={0.66} delay={-0.4} />
        <Bird className="top-[32%] left-[-5%] w-[1.8%]" travel={3300} flap={0.76} delay={-0.1} />
        {/* far ridge: lighter, gives depth behind Halcon */}
        <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute -left-[6%] bottom-[14%] h-[38%] w-[112%]" style={{ transform: "translateX(calc((0.5 - var(--p)) * 4%))" }} aria-hidden>
          <path d="M0 300V190L90 150 170 175 260 110 340 150 430 90 520 140 600 120 690 70 780 130 880 100 960 150 1060 120 1140 160 1200 140V300Z" fill="#7f9ad6" opacity=".6" />
          <path d="M0 300V230C120 200 220 220 340 196S560 214 700 190 900 220 1040 204 1160 216 1200 208V300Z" fill="#6a85c9" opacity=".8" />
        </svg>
        {/* Halcon */}
        <div className="absolute inset-x-0 bottom-[13%] mx-auto w-[min(94%,960px)]" style={{ transform: "translateY(calc((1 - var(--p)) * 12%)) scale(calc(0.94 + var(--p) * 0.1))", transformOrigin: "50% 100%" }} aria-hidden>
          <svg viewBox="0 0 160 90" className="h-auto w-full">
            <clipPath id="hs-clip"><path d={HALCON} /></clipPath>
            <HalconShape color={F.blue} />
            <path d="M101 10 96 36 88 66M72 26 66 44 56 72M133 34 140 54M46 60 56 72" fill="none" stroke="#000" opacity=".18" strokeWidth="1.600" strokeLinecap="round" />
            <path clipPath="url(#hs-clip)" d="M0 90V74C20 66 36 70 60 74 90 78 116 66 160 72V90Z" fill="#1d4a37" opacity=".45" />
          </svg>
        </div>
        {/* mid clouds hugging the slopes: one big on the left, one smaller on the right, different shapes */}
        <Cloud kind="cumulus" className="bottom-[36%] left-[18%] w-[24%] opacity-95" style={drift(-40)} />
        <Cloud kind="bank" className="bottom-[33%] right-[14%] w-[22%] opacity-90" color="#fff0e0" style={drift(55)} />
        {/* mist at the base */}
        <div className="absolute inset-x-0 bottom-[14%] h-[20%]" style={{ background: "linear-gradient(to top, rgb(255 255 255 / .9), rgb(255 255 255 / 0))" }} aria-hidden />
        {/* foothills + trees */}
        <div className="absolute inset-x-0 bottom-0 h-[26%]" style={{ background: F.green, clipPath: "polygon(0 35%,18% 12%,40% 30%,62% 8%,84% 28%,100% 14%,100% 100%,0 100%)" }} aria-hidden />
        <svg viewBox="0 0 1200 100" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[9%] h-[13%] w-full" aria-hidden>
          <path d={TREES_BACK} fill="#2f8f4e" /><g transform="translate(9 0)"><path d={TREES_FRONT} fill="#1d5a38" /></g>
        </svg>
        {/* near clouds: bigger and brighter, opposite corners */}
        <Cloud kind="stratus" className="bottom-[12%] left-[12%] w-[24%] opacity-95" style={drift(60)} />
        <Cloud kind="puff" className="bottom-[10%] right-[10%] w-[11%] opacity-95" style={drift(-80)} />
        <div className="absolute inset-x-0 bottom-0 h-[14%]" style={{ background: F.navy, clipPath: "polygon(0 40%,25% 15%,55% 38%,80% 10%,100% 30%,100% 100%,0 100%)" }} aria-hidden />
        {/* captions */}
        <div className="absolute inset-x-0 top-[10%] mx-auto max-w-xl px-6">
          {STEPS.map((s, i) => (
            <div key={s.h} className="absolute inset-x-6 text-center" style={{ opacity: `calc(${op(i)})` }}>
              <h3 className="font-serif text-3xl font-bold text-[#1b2a4a] md:text-5xl"><T k={s.h} /></h3>
              <p className="mt-3 text-base font-medium text-[#1b2a4a]/80 md:text-lg"><T k={s.p} /></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
