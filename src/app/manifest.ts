import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Better Oriental Mindoro",
    short_name: "Better OM",
    description: "A volunteer-led civic website for Oriental Mindoro.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f0",
    theme_color: "#1b2a4a",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
