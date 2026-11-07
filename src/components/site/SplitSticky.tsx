// Two columns where the short one stays in view while the long one scrolls (desktop only; stacks on phones).
// `top` clears the sticky site header. Put the chart or map in `side`, the long list or table in `children`.
export default function SplitSticky({ side, children, reverse = false, className = "" }: { side: React.ReactNode; children: React.ReactNode; reverse?: boolean; className?: string }) {
  return (
    <div className={`grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] ${className}`}>
      <div className={`min-w-0 lg:sticky lg:top-28 ${reverse ? "lg:order-2" : ""}`}>{side}</div>
      <div className={`min-w-0 ${reverse ? "lg:order-1" : ""}`}>{children}</div>
    </div>
  );
}
