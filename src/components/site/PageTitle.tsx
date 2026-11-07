/** SectionHeader look, but an h1 (the kit SectionHeader renders h2). */
export default function PageTitle({ eyebrow, title, color = "#b5532f" }: { eyebrow: string; title: string; color?: string }) {
  return (
    <header>
      <p className="text-xs font-semibold tracking-[0.2em]" style={{ color }}>{eyebrow}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold">{title}</h1>
      <div className="mt-3 h-1 w-16 rounded-full" style={{ background: color }} />
    </header>
  );
}
