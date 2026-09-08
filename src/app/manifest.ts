import type { MetadataRoute } from "next";

import { ASSET_VERSION } from "@/lib/asset-version";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Local Loyalty",
    short_name: "Local Loyalty",
    description: "Loyalty rewards for local businesses",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f9fb",
    theme_color: "#0b2f55",
    icons: [
      { src: `/icons/icon-192.png?v=${ASSET_VERSION}`, sizes: "192x192", type: "image/png" },
      { src: `/icons/icon-512.png?v=${ASSET_VERSION}`, sizes: "512x512", type: "image/png" },
      {
        src: `/icons/icon-maskable-512.png?v=${ASSET_VERSION}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
