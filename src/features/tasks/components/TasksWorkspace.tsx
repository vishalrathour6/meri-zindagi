"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ALL_TAGS } from "@/features/tags/components/TagFilterSelect";

import type { Task, TaskListParams } from "../api";
import { useDeleteTask, useTasks, useUpdateTask } from "../hooks";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskList } from "./TaskList";
import { TasksToolbar, type StatusFilter } from "./TasksToolbar";

export function TasksWorkspace() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<string>(ALL_TAGS);
  const [tag, setTag] = useState<string>(ALL_TAGS);
  const [formOpen, setFormOpen] = useState(false);
  const [formTask, setFormTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const params: TaskListParams = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      status: status === "all" ? undefined : status,
      priority:
        priority === ALL_TAGS
          ? undefined
          : (priority as TaskListParams["priority"]),
      tag: tag === ALL_TAGS ? undefined : tag,
      page: 1,
      pageSize: 100,
    }),
    [debouncedSearch, status, priority, tag],
  );

  const { data, isLoading, isError } = useTasks(params);
  const updateMutation = useUpdateTask(params);
  const deleteMutation = useDeleteTask(params);
  const items = data?.items ?? [];

  function handleNew() {
    setFormTask(null);
    setFormOpen(true);
  }

  function handleEdit(task: Task) {
    setFormTask(task);
    setFormOpen(true);
  }

  function handleToggle(task: Task) {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    updateMutation.mutate(
      { id: task.id, input: { status: nextStatus } },
      {
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : "Failed to update task.",
          ),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        toast.success("Task deleted.");
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete the task.",
        );
        setDeleteTarget(null);
      },
    });
  }

  return (
    <>
      <Card className="flex flex-col gap-4 p-4">
        <TasksToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          priority={priority}
          onPriorityChange={setPriority}
          tag={tag}
          onTagChange={setTag}
          onNew={handleNew}
        />
        <Separator />
        <TaskList
          items={items}
          isLoading={isLoading}
          isError={isError}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      </Card>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={formTask}
        params={params}
      />

      <DeleteTaskDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        taskTitle={deleteTarget?.title}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
