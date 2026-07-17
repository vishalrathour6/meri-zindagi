"use client";

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/common/service-worker-register";

/** Key under which the React Query cache is persisted (cleared on logout). */
export const QUERY_CACHE_KEY = "mz-query-cache";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            // Keep data long enough to be worth persisting for offline reads.
            gcTime: 1000 * 60 * 60 * 24,
          },
        },
      }),
  );

  // Persist the cache to localStorage so the last-loaded diary/tasks/tags are
  // readable offline. `undefined` storage (SSR) makes the persister a no-op.
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      key: QUERY_CACHE_KEY,
    }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
      >
        {children}
        <ServiceWorkerRegister />
        <Toaster richColors position="top-right" />
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
