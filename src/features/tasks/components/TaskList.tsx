"use client";

import { Skeleton } from "@/components/ui/skeleton";

import type { Task } from "../api";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  items: Task[];
  isLoading: boolean;
  isError: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskList({
  items,
  isLoading,
  isError,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 rounded-md border p-3">
            <Skeleton className="mt-1 size-4 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive py-6 text-sm">
        Couldn&apos;t load your tasks. Please try again.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-sm">
        No tasks here. Add one to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
