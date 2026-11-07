import { Halcon, Lake, Mangyan, Tamaraw } from "@/components/kit/Motifs";
import { FIESTA as F, FIESTA_DEEP as D } from "@/components/kit/Patterns";

// The kit's "banners" hero, with the emblems sized to the pennant (about 58% of its width) instead of a fixed
// 40px, so they stay large at any width. Colours and shapes come straight from the kit.
const FLAGS = [
  { c: F.blue, el: <Mangyan className="h-auto w-[58%]" color="#fff" /> },
  { c: F.green, el: <Halcon className="h-auto w-[62%]" color="#fff" outline /> },
  { c: F.red, el: <Tamaraw className="h-auto w-[58%]" color="#fff" outline /> },
  { c: D.sky, el: <Lake className="h-auto w-[62%]" color="#fff" /> },
];

export default function PennantHero({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ background: F.cream }}>
      <div className="absolute right-6 top-4 -z-10 hidden w-[46%] sm:block" aria-hidden="true">
        <div className="h-1 rounded bg-[#8b8f99]" />
        <div className="flex justify-between gap-2 px-2">
          {FLAGS.map((f, i) => (
            <div key={i} className="flex aspect-[1/1.9] min-w-0 flex-1 items-start justify-center pt-[14%]" style={{ background: f.c, clipPath: "polygon(0 0,100% 0,100% 82%,50% 100%,0 82%)" }}>{f.el}</div>
          ))}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
