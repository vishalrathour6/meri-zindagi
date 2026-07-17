import type { MetadataRoute } from "next";

/**
 * Web app manifest — makes Meri Zindagi installable. Served by Next at
 * `/manifest.webmanifest`; the `<link rel="manifest">` is injected automatically.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meri Zindagi — Daily Diary & Task Manager",
    short_name: "Meri Zindagi",
    description:
      "A secure app for keeping a daily diary and managing daily tasks in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
