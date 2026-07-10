import { LogOutIcon } from "lucide-react";

import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

/**
 * Sign-out control. Uses a form whose action is the `logout` server action so
 * it works without client-side JavaScript.
 */
export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="sm">
        <LogOutIcon className="size-4" />
        Sign out
      </Button>
    </form>
  );
}
