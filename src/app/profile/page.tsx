import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/layout/app-header";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { prisma } from "@/lib/prisma";

/** First letters of the name, for the avatar fallback. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function ProfilePage() {
  // Route is protected by the proxy; read fresh values from the DB (not the
  // possibly-stale session token) so the forms always show current data.
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  if (!user) redirect("/login");

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account details.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-medium">
                  {initials(user.name)}
                </div>
                <div>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Update your display name.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileForm name={user.name} email={user.email} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change the password you use to sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
