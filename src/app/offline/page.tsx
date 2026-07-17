import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline — Meri Zindagi",
};

/**
 * Fallback shown when a navigation is attempted offline and the target page
 * isn't cached. Precached by the service worker so it's always available.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
        <WifiOff className="size-7" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="text-muted-foreground text-sm">
        We couldn&apos;t reach the network. Pages and entries you&apos;ve already
        opened stay available — reconnect to sync new changes.
      </p>
    </main>
  );
}
