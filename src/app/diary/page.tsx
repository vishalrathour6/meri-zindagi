import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DiaryWorkspace } from "@/features/diary/components/DiaryWorkspace";

export default function DiaryPage() {
  // Route is protected by the proxy prefix list; no session read needed here.
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Diary</h1>
          <p className="text-muted-foreground mt-1">
            Capture your day and revisit past entries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
      <DiaryWorkspace />
    </main>
  );
}
