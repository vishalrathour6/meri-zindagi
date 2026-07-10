import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Meri Zindagi</h1>
        <p className="text-muted-foreground text-lg">
          Your daily diary &amp; task manager — all in one place.
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
