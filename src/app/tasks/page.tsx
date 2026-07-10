import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { TasksWorkspace } from "@/features/tasks/components/TasksWorkspace";

export default function TasksPage() {
  // Route is protected by the proxy prefix list; no session read needed here.
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Track what needs doing and check things off.
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
      <TasksWorkspace />
    </main>
  );
}
