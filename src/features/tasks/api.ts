import type {
  CreateTaskInput,
  TaskStatus,
  UpdateTaskInput,
} from "./schemas";

/**
 * Client-facing task shape. Dates cross the wire as ISO strings (JSON has no
 * Date type), so we model them as strings rather than reusing Prisma's type.
 */
export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskListParams = {
  q?: string;
  status?: TaskStatus;
  page?: number;
  pageSize?: number;
};

export type TaskListResult = {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
};

async function toError(res: Response, fallback: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? fallback);
}

export async function fetchTasks(
  params: TaskListParams,
): Promise<TaskListResult> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const res = await fetch(`/api/tasks?${search.toString()}`);
  if (!res.ok) throw await toError(res, "Failed to load tasks.");
  return res.json();
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await toError(res, "Failed to create the task.");
  return res.json();
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await toError(res, "Failed to save the task.");
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw await toError(res, "Failed to delete the task.");
}
