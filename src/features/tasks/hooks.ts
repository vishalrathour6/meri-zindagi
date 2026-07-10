"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type Task,
  type TaskListParams,
  type TaskListResult,
} from "./api";
import type { CreateTaskInput, UpdateTaskInput } from "./schemas";

/** Centralised query keys so mutations can invalidate consistently. */
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
};

export function useTasks(params: TaskListParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasks(params),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

/**
 * Update a task (edit form or inline status toggle). Optimistically patches the
 * cached item so checkbox toggles feel instant; rolls back on error.
 */
export function useUpdateTask(params: TaskListParams) {
  const queryClient = useQueryClient();
  const key = taskKeys.list(params);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskListResult>(key);
      if (previous) {
        queryClient.setQueryData<TaskListResult>(key, {
          ...previous,
          items: previous.items.map((task: Task) =>
            task.id === id ? { ...task, ...input } : task,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

export function useDeleteTask(params: TaskListParams) {
  const queryClient = useQueryClient();
  const key = taskKeys.list(params);

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskListResult>(key);
      if (previous) {
        queryClient.setQueryData<TaskListResult>(key, {
          ...previous,
          items: previous.items.filter((task: Task) => task.id !== id),
          total: Math.max(0, previous.total - 1),
        });
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}
