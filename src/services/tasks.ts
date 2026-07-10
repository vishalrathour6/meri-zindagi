import type { Prisma, Task } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  CreateTaskInput,
  TaskQuery,
  UpdateTaskInput,
} from "@/features/tasks/schemas";

/**
 * Task data-access layer. Every function is scoped by `userId` so a user can
 * only read or mutate their own tasks. Reused by the task route handlers today
 * and by the dashboard summary later.
 */

export type TaskListResult = {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
};

/** Parse a `YYYY-MM-DD` string into a UTC `Date`, or `null` to clear. */
function parseDueDate(value: string | null | undefined): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export async function listTasks(
  userId: string,
  { q, status, page, pageSize }: TaskQuery,
): Promise<TaskListResult> {
  const where: Prisma.TaskWhereInput = {
    userId,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getTask(
  userId: string,
  id: string,
): Promise<Task | null> {
  return prisma.task.findFirst({ where: { id, userId } });
}

export async function createTask(
  userId: string,
  input: CreateTaskInput,
): Promise<Task> {
  return prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      dueDate: parseDueDate(input.dueDate),
    },
  });
}

/** Returns the updated task, or `null` if it doesn't belong to the user. */
export async function updateTask(
  userId: string,
  id: string,
  input: UpdateTaskInput,
): Promise<Task | null> {
  const data: Prisma.TaskUpdateManyMutationInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined)
    data.description = input.description || null;
  if (input.dueDate !== undefined) data.dueDate = parseDueDate(input.dueDate);
  if (input.status !== undefined) data.status = input.status;

  const { count } = await prisma.task.updateMany({
    where: { id, userId },
    data,
  });
  if (count === 0) return null;
  return prisma.task.findFirst({ where: { id, userId } });
}

/** Returns `true` if a task was deleted, `false` if none matched the user. */
export async function deleteTask(
  userId: string,
  id: string,
): Promise<boolean> {
  const { count } = await prisma.task.deleteMany({ where: { id, userId } });
  return count > 0;
}
