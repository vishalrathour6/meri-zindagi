"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoutButton } from "@/components/layout/logout-button";
import { NAV_ITEMS } from "@/components/layout/nav-items";

/** Hamburger-triggered navigation drawer shown below the `md` breakpoint. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="md:hidden"
        >
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4 max-w-xs">
        <SheetHeader className="p-0">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "justify-start",
                  active ? "bg-accent text-foreground" : "text-muted-foreground",
                )}
              >
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
        <Separator />
        <LogoutButton />
      </SheetContent>
    </Sheet>
  );
}
