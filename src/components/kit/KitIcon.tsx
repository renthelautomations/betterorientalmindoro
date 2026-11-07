// 24x24 civic icon set. variant: line (stroke), duo (tinted fill + stroke), badge (white on colored circle).
export const KIT_ICONS = {
  phone: "M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  health: "M12 21s-8-5-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 6-8 11-8 11ZM12 9v5M9.500 11.500h5",
  school: "M2 9l10-5 10 5-10 5L2 9ZM6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500",
  road: "M8 3 5 21M16 3l3 18M12 4v3M12 11v3M12 18v3",
  budget: "M7 4v16M7 4h6a4 4 0 0 1 0 8H7M5 8h11M5 11h11",
  pin: "M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21ZM12 12a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z",
  weather: "M7 18a4 4 0 0 1-.500-8A6 6 0 0 1 18 11a3.500 3.500 0 0 1-.500 7H7Z",
  doc: "M6 3h8l5 5v13H6V3ZM14 3v5h5M9 13h7M9 17h7",
  people: "M9 11a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7ZM2.500 20a6.500 6.500 0 0 1 13 0M16 4.500a3.500 3.500 0 0 1 0 6.500M18 14a6.500 6.500 0 0 1 3.500 6",
  flood: "M3 10c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 15c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 20c3 0 3-2 6-2s3 2 6 2 3-2 6-2",
  fire: "M12 22c4 0 7-2.800 7-7 0-3-2-5-3.500-7-.500 2-1.500 3-3 3 0-4-1.500-7-4-9 0 4-3.500 6-3.500 12 0 4.200 3 8 7 8Z",
  shield: "M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6l8-3Z",
  ferry: "M2 16l2.500 4h15L22 16H2ZM6 16v-5h12v5M9 11V7h6v4M12 3v4",
  farm: "M12 22V8M12 8c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4ZM12 14c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4Z",
  mountain: "M2 20l7-13 4 7 3-4 6 10H2Z",
  tamaraw: "M3 4c1 6 4 9 9 9s8-3 9-9M12 13v4M9 20h6",
  calendar: "M4 6h16v15H4V6ZM4 10h16M8 3v4M16 3v4",
  alert: "M12 3 2 20h20L12 3ZM12 10v5M12 18v.01",
  drop: "M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11Z",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.500-4.500",
  menu: "M4 7h16M4 12h16M4 17h16",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12.500l4.500 4.500L19 7",
  mail: "M3 6h18v12H3V6ZM3 7l9 7 9-7",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18",
} as const;
export type KitIconName = keyof typeof KIT_ICONS;

export default function KitIcon({ name, variant = "line", color = "currentColor", className = "h-6 w-6" }: {
  name: KitIconName; variant?: "line" | "duo" | "badge"; color?: string; className?: string;
}) {
  const d = KIT_ICONS[name];
  if (variant === "badge")
    return (
      <span className={`inline-flex items-center justify-center rounded-full p-2 text-white ${className}`} style={{ background: color }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full" aria-hidden="true"><path d={d} /></svg>
      </span>
    );
  return (
    <svg viewBox="0 0 24 24" fill={variant === "duo" ? color : "none"} fillOpacity={variant === "duo" ? 0.16 : undefined} stroke={color} strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
