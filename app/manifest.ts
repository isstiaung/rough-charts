import type { MetadataRoute } from "next";

// Required to emit the manifest as a file under `output: "export"`
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hand Drawn Charts",
    short_name: "HD Charts",
    description:
      "Create sketchy, hand-drawn style charts in the browser. Import CSV, edit live, and export as PNG, SVG, or JPEG.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8ee",
    theme_color: "#fdf8ee",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
