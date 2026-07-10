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
import { RegisterForm } from "@/features/auth/components/register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Start keeping your diary and tasks in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
