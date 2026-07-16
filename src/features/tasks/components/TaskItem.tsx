"use client";

import { CalendarClock, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateLabel, snippet } from "@/lib/format";
import { TagBadge } from "@/features/tags/components/TagBadge";

import { PRIORITY_META } from "../priority";
import type { Task } from "../api";

type TaskItemProps = {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

/** Whether a pending task's due date is in the past (compared by calendar day). */
function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "Completed") return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const completed = task.status === "Completed";
  const overdue = isOverdue(task);

  return (
    <li className="flex items-start gap-3 rounded-md border p-3">
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggle(task)}
        className="mt-1"
        aria-label={completed ? "Mark task pending" : "Mark task completed"}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium",
            completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        {task.description ? (
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
            {snippet(task.description)}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            className={cn("font-normal", PRIORITY_META[task.priority].badgeClass)}
          >
            {PRIORITY_META[task.priority].label}
          </Badge>
          {task.dueDate ? (
            <Badge
              variant={overdue ? "destructive" : "secondary"}
              className="font-normal"
            >
              <CalendarClock className="mr-1 size-3" />
              {overdue ? "Overdue · " : "Due "}
              {formatDateLabel(task.dueDate)}
            </Badge>
          ) : null}
        </div>
        {task.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}
