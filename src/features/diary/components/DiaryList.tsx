"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import type { Diary } from "../api";
import { formatDateLabel, snippet } from "../utils";

type DiaryListProps = {
  items: Diary[];
  selectedId: string | null;
  onSelect: (entry: Diary) => void;
  isLoading: boolean;
  isError: boolean;
};

export function DiaryList({
  items,
  selectedId,
  onSelect,
  isLoading,
  isError,
}: DiaryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2 rounded-md border p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive px-1 py-6 text-sm">
        Couldn&apos;t load your entries. Please try again.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground px-1 py-6 text-sm">
        No entries yet. Create your first diary entry to get started.
      </p>
    );
  }

  return (
    <ScrollArea className="h-[60vh] pr-2">
      <ul className="space-y-2">
        {items.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelect(entry)}
              aria-current={entry.id === selectedId}
              className={cn(
                "hover:bg-accent focus-visible:ring-ring w-full rounded-md border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                entry.id === selectedId && "border-primary bg-accent",
              )}
            >
              <p className="truncate font-medium">{entry.title}</p>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {snippet(entry.content)}
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs">
                {formatDateLabel(entry.createdAt)}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
