import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile higher in the tree otherwise makes
  // Next infer the wrong root.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        // Never cache the service worker itself, and let it control the whole
        // origin scope.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
