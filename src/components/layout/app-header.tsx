"use client";

import Link from "next/link";

import { LogoutButton } from "@/components/layout/logout-button";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/** Shared top navigation bar for the authenticated area of the app. */
export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Meri Zindagi
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
