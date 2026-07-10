import type { Diary } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  CreateDiaryInput,
  DiaryQuery,
  UpdateDiaryInput,
} from "@/features/diary/schemas";

/**
 * Diary data-access layer. Every function is scoped by `userId` so a user can
 * only ever read or mutate their own entries — the id alone is never trusted.
 * Reused by the diary route handlers today and by the dashboard summary later.
 */

export type DiaryListResult = {
  items: Diary[];
  total: number;
  page: number;
  pageSize: number;
};

/** Build the UTC start/end bounds for a single `YYYY-MM-DD` day. */
function dayRange(date: string): { gte: Date; lt: Date } {
  const [year, month, day] = date.split("-").map(Number);
  const gte = new Date(Date.UTC(year, month - 1, day));
  const lt = new Date(Date.UTC(year, month - 1, day + 1));
  return { gte, lt };
}

export async function listDiaries(
  userId: string,
  { q, date, page, pageSize }: DiaryQuery,
): Promise<DiaryListResult> {
  const where = {
    userId,
    ...(date ? { createdAt: dayRange(date) } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.diary.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.diary.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getDiary(
  userId: string,
  id: string,
): Promise<Diary | null> {
  return prisma.diary.findFirst({ where: { id, userId } });
}

export async function createDiary(
  userId: string,
  data: CreateDiaryInput,
): Promise<Diary> {
  return prisma.diary.create({ data: { ...data, userId } });
}

/** Returns the updated entry, or `null` if it doesn't belong to the user. */
export async function updateDiary(
  userId: string,
  id: string,
  data: UpdateDiaryInput,
): Promise<Diary | null> {
  const { count } = await prisma.diary.updateMany({
    where: { id, userId },
    data,
  });
  if (count === 0) return null;
  return prisma.diary.findFirst({ where: { id, userId } });
}

/** Returns `true` if an entry was deleted, `false` if none matched the user. */
export async function deleteDiary(
  userId: string,
  id: string,
): Promise<boolean> {
  const { count } = await prisma.diary.deleteMany({ where: { id, userId } });
  return count > 0;
}
