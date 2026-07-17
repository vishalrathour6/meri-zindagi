"use client";

import { LogOutIcon } from "lucide-react";

import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { QUERY_CACHE_KEY } from "@/app/providers";

/**
 * Sign-out control. The form action is the `logout` server action so it works
 * without client JS; on submit we also drop the persisted React Query cache so
 * one user's offline-cached data never rehydrates for the next.
 */
export function LogoutButton() {
  function clearPersistedCache() {
    try {
      window.localStorage.removeItem(QUERY_CACHE_KEY);
    } catch {
      // Ignore storage access errors (private mode, etc.).
    }
  }

  return (
    <form action={logout} onSubmit={clearPersistedCache}>
      <Button type="submit" variant="outline" size="sm">
        <LogOutIcon className="size-4" />
        Sign out
      </Button>
    </form>
  );
}
