import type { NextConfig } from "next";

// The ?v= must match ASSET_VERSION in src/lib/asset-version.ts — bump both
// together whenever a public/icons file changes content at the same URL.
const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/icons/**",
        search: "?v=4",
      },
    ],
  },
};

export default nextConfig;
