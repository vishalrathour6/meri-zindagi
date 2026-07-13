import { AppHeader } from "@/components/layout/app-header";
import { TasksWorkspace } from "@/features/tasks/components/TasksWorkspace";

export default function TasksPage() {
  // Route is protected by the proxy prefix list; no session read needed here.
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Track what needs doing and check things off.
          </p>
        </div>
        <TasksWorkspace />
      </main>
    </>
  );
}
