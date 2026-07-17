"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (`public/sw.js`) once on the client. Runs only in
 * production — under `next dev` the SW would fight Turbopack's changing asset URLs.
 * Renders nothing.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Registration failures shouldn't break the app; offline is best-effort.
      });
  }, []);

  return null;
}
