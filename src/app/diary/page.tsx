import { AppHeader } from "@/components/layout/app-header";
import { DiaryWorkspace } from "@/features/diary/components/DiaryWorkspace";

export default function DiaryPage() {
  // Route is protected by the proxy prefix list; no session read needed here.
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Diary</h1>
          <p className="text-muted-foreground mt-1">
            Capture your day and revisit past entries.
          </p>
        </div>
        <DiaryWorkspace />
      </main>
    </>
  );
}
