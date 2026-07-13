"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/diary", label: "Diary" },
  { href: "/tasks", label: "Tasks" },
  { href: "/profile", label: "Profile" },
] as const;

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            size="sm"
            aria-current={active ? "page" : undefined}
            className={cn(
              active ? "bg-accent text-foreground" : "text-muted-foreground",
            )}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
