import type { ReactNode } from "react";
import { ICONS, type IconKey } from "@/lib/brand";
import { STORIES } from "@/lib/stories";
import { PatternFill, type PatternKey } from "@/components/kit/Patterns";

// Header band plus a calm reading column. `scene` is an optional kit scroll section.
// Reduced motion shrinks the tall scroll scene to one screen; the text below is plain HTML either way.
export default function StoryPage({ icon, pattern, scene, children }: { icon: IconKey; pattern: PatternKey; scene?: ReactNode; children?: ReactNode }) {
  const i = ICONS[icon];
  const s = STORIES[icon];
  return (
    <main>
      <div className="relative isolate overflow-hidden text-white" style={{ backgroundColor: i.color }}>
        <PatternFill variant={pattern} colors={["#fff"]} opacity={0.15} />
        <div className="mx-auto max-w-3xl px-4 py-14">
          <p className="font-serif text-5xl font-bold">{i.short}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{s.title}</h1>
        </div>
      </div>
      {scene && <><h2 className="sr-only">Sa larawan</h2><div className="overflow-hidden motion-reduce:[&>div]:h-[80vh] motion-reduce:[&>div>div]:h-[80vh]">{scene}</div></>}
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-10 text-lg leading-relaxed">
        {icon === "ma" && <p className="inline-block rounded-full bg-black/5 px-4 py-1 text-sm font-semibold">In preparation</p>}
        {s.draft && <p className="text-sm font-semibold text-[#8f3f20]">Draft: for volunteer review</p>}
        {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
        {children}
        {s.link && <p><a className="inline-block py-2 underline" href={s.link.href} rel="noopener">{s.link.label}</a></p>}
      </article>
    </main>
  );
}
