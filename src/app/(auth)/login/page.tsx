import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to continue to Meri Zindagi.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
