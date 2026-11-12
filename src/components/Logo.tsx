import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo-path";

export default function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const fg = tone === "light" ? "#ffffff" : "#1b2a4a";
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox={LOGO_VIEWBOX} className="h-10 w-auto" aria-hidden="true">
        <path d={LOGO_PATH} fill={fg} />
      </svg>
      <span className="whitespace-nowrap leading-none" style={{ color: fg }}>
        <span className="block font-serif text-xl font-bold">better</span>{" "}
        <span className="block text-sm font-semibold tracking-wide">Oriental Mindoro</span>
      </span>
    </span>
  );
}
