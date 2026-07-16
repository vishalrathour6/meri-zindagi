import type { Prisma, Task } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  CreateTaskInput,
  TaskQuery,
  UpdateTaskInput,
} from "@/features/tasks/schemas";
import { resolveOwnedTagIds } from "@/services/tags";

/**
 * Task data-access layer. Every function is scoped by `userId` so a user can
 * only read or mutate their own tasks. Reused by the task route handlers today
 * and by the dashboard summary later.
 */

/** Tag fields returned alongside each task. */
const tagSelect = { id: true, name: true, color: true } as const;

/** A task plus its (lightweight) tags — the shape returned to clients. */
export type TaskWithTags = Task & {
  tags: { id: string; name: string; color: string }[];
};

export type TaskListResult = {
  items: TaskWithTags[];
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
  { q, status, priority, tag, page, pageSize }: TaskQuery,
): Promise<TaskListResult> {
  const where: Prisma.TaskWhereInput = {
    userId,
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(tag ? { tags: { some: { id: tag } } } : {}),
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
      // Enum sorts by declared order (Low, Medium, High), so `desc` = High first.
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: { select: tagSelect } },
    }),
    prisma.task.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getTask(
  userId: string,
  id: string,
): Promise<TaskWithTags | null> {
  return prisma.task.findFirst({
    where: { id, userId },
    include: { tags: { select: tagSelect } },
  });
}

export async function createTask(
  userId: string,
  input: CreateTaskInput,
): Promise<TaskWithTags> {
  const ownedTagIds = await resolveOwnedTagIds(userId, input.tagIds);
  return prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      dueDate: parseDueDate(input.dueDate),
      priority: input.priority ?? "Medium",
      tags: { connect: ownedTagIds.map((id) => ({ id })) },
    },
    include: { tags: { select: tagSelect } },
  });
}

/** Returns the updated task, or `null` if it doesn't belong to the user. */
export async function updateTask(
  userId: string,
  id: string,
  input: UpdateTaskInput,
): Promise<TaskWithTags | null> {
  // Relation writes can't go through `updateMany`, so confirm ownership first,
  // then `update` by id (which we now know belongs to this user).
  const owned = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return null;

  const data: Prisma.TaskUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined)
    data.description = input.description || null;
  if (input.dueDate !== undefined) data.dueDate = parseDueDate(input.dueDate);
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.tagIds !== undefined) {
    const ownedTagIds = await resolveOwnedTagIds(userId, input.tagIds);
    data.tags = { set: ownedTagIds.map((tagId) => ({ id: tagId })) };
  }

  return prisma.task.update({
    where: { id },
    data,
    include: { tags: { select: tagSelect } },
  });
}

/** Returns `true` if a task was deleted, `false` if none matched the user. */
export async function deleteTask(
  userId: string,
  id: string,
): Promise<boolean> {
  const { count } = await prisma.task.deleteMany({ where: { id, userId } });
  return count > 0;
}
