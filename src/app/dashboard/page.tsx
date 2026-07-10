import { auth } from "@/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function DashboardPage() {
  // Route is already protected by the proxy; `auth()` gives us the session user.
  const session = await auth();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name ?? "friend"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
      <p className="text-muted-foreground mt-8">
        Protected route placeholder — summary cards and stats arrive in a later
        phase.
      </p>
    </main>
  );
}
