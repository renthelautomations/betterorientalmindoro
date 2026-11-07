export type IconKey = "ma" | "hal" | "ta" | "na";

export type Icon = { key: IconKey; short: string; name: string; color: string; blurb: string };

export const ICONS: Record<IconKey, Icon> = {
  ma: { key: "ma", short: "Ma", name: "Mangyan", color: "#b5532f", blurb: "Ang mga katutubo ng Mindoro: kultura, wika, at tradisyon." },
  hal: { key: "hal", short: "Hal", name: "Mount Halcon", color: "#2f6b4f", blurb: "Ang bundok at pinakasikat na akyatan ng lalawigan." },
  ta: { key: "ta", short: "Ta", name: "Tamaraw", color: "#6b4a2f", blurb: "Ang bihirang dwarf buffalo na tanging sa Mindoro matatagpuan." },
  na: { key: "na", short: "Na", name: "Naujan Lake", color: "#1f7a8c", blurb: "Ang pinakamalaking lawa ng lalawigan, mayaman sa buhay-ilang." },
};

export const ICON_KEYS = Object.keys(ICONS) as IconKey[];

export const isIconKey = (s: string): s is IconKey => s in ICONS;

export const SITE = {
  name: "Better Oriental Mindoro",
  tagline: "Apat na haligi ng Oriental Mindoro.",
  github: "https://github.com/renthelautomations/betterorientalmindoro",
};
