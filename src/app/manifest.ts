import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HPLoyalty",
    short_name: "HPLoyalty",
    description: "Loyalty rewards for local businesses",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe3",
    theme_color: "#2f4b7c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
