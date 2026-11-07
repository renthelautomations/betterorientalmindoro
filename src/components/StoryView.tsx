import { ICONS, type IconKey } from "@/lib/brand";
import { STORIES } from "@/lib/stories";
import WeatherNow from "./WeatherNow";

export default function StoryView({ icon }: { icon: IconKey }) {
  const i = ICONS[icon];
  const s = STORIES[icon];
  return (
    <main>
      <div style={{ backgroundColor: i.color }} className="text-white">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <p className="font-serif text-5xl font-bold">{i.short}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{s.title}</h1>
        </div>
      </div>
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-10 text-lg leading-relaxed">
        {icon === "ma" && <p className="inline-block rounded-full bg-black/5 px-4 py-1 text-sm font-semibold">In preparation</p>}
        {s.draft && <p className="text-sm font-semibold text-[var(--ma)]">Draft: for volunteer review</p>}
        {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
        {icon === "hal" && <WeatherNow />}
        {s.link && <p><a className="underline" href={s.link.href} rel="noopener">{s.link.label}</a></p>}
      </article>
    </main>
  );
}
