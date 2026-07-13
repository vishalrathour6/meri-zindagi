import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";

export default async function DashboardPage() {
  // Route is already protected by the proxy; `auth()` gives us the session user.
  const session = await auth();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name ?? "friend"}.
        </p>
        <p className="text-muted-foreground mt-8">
          Protected route placeholder — summary cards and stats arrive in a
          later phase.
        </p>
      </main>
    </>
  );
}
