"use client";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagFilterSelect } from "@/features/tags/components/TagFilterSelect";

import type { TaskStatus } from "../schemas";
import { priorities } from "../schemas";
import { PRIORITY_META } from "../priority";

export type StatusFilter = TaskStatus | "all";

type TasksToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  onNew: () => void;
};

export function TasksToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  tag,
  onTagChange,
  onNew,
}: TasksToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks…"
          className="pl-8"
          aria-label="Search tasks"
        />
      </div>
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as StatusFilter)}
      >
        <SelectTrigger className="sm:w-40" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tasks</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="sm:w-40" aria-label="Filter by priority">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {priorities.map((p) => (
            <SelectItem key={p} value={p}>
              {PRIORITY_META[p].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <TagFilterSelect
        value={tag}
        onChange={onTagChange}
        className="sm:w-40"
      />
      <Button onClick={onNew}>
        <Plus className="mr-1 size-4" />
        Add task
      </Button>
    </div>
  );
}
