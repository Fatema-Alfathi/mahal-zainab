import type { MetadataRoute } from "next";
import { assetPath } from "@/lib/assetPath";

// Lets the shop add the app to a phone's home screen with the YAL icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "بوتيك YAL",
    short_name: "YAL",
    description: "إدارة بوتيك YAL: الفساتين، العميلات، والحجوزات.",
    lang: "ar",
    dir: "rtl",
    start_url: assetPath("/"),
    scope: assetPath("/"),
    display: "standalone",
    background_color: "#faf6f2",
    theme_color: "#6e1024",
    icons: [
      { src: assetPath("/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: assetPath("/icon-512.png"), sizes: "512x512", type: "image/png" },
    ],
  };
}
