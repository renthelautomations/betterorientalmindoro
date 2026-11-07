import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Old routes keep working: the Datos hub is gone, town tabs live inside the town page, categories live on /serbisyo.
  async redirects() {
    return [
      { source: "/datos", destination: "/estatistika", permanent: true },
      { source: "/bayan/:slug/:tab(tulong|proyekto|halalan|datos)", destination: "/bayan/:slug", permanent: true },
      { source: "/serbisyo/:category", destination: "/serbisyo", permanent: true },
    ];
  },
};

export default nextConfig;
