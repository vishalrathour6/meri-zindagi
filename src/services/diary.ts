import type { Diary, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  CreateDiaryInput,
  DiaryQuery,
  UpdateDiaryInput,
} from "@/features/diary/schemas";
import { resolveOwnedTagIds } from "@/services/tags";

/**
 * Diary data-access layer. Every function is scoped by `userId` so a user can
 * only ever read or mutate their own entries — the id alone is never trusted.
 * Reused by the diary route handlers today and by the dashboard summary later.
 */

/** Tag fields returned alongside each entry. */
const tagSelect = { id: true, name: true, color: true } as const;

/** An entry plus its (lightweight) tags — the shape returned to clients. */
export type DiaryWithTags = Diary & {
  tags: { id: string; name: string; color: string }[];
};

export type DiaryListResult = {
  items: DiaryWithTags[];
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
  { q, date, tag, mood, page, pageSize }: DiaryQuery,
): Promise<DiaryListResult> {
  const where: Prisma.DiaryWhereInput = {
    userId,
    ...(date ? { createdAt: dayRange(date) } : {}),
    ...(tag ? { tags: { some: { id: tag } } } : {}),
    ...(mood ? { mood } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
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
      include: { tags: { select: tagSelect } },
    }),
    prisma.diary.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getDiary(
  userId: string,
  id: string,
): Promise<DiaryWithTags | null> {
  return prisma.diary.findFirst({
    where: { id, userId },
    include: { tags: { select: tagSelect } },
  });
}

export async function createDiary(
  userId: string,
  input: CreateDiaryInput,
): Promise<DiaryWithTags> {
  const { tagIds, ...rest } = input;
  const ownedTagIds = await resolveOwnedTagIds(userId, tagIds);
  return prisma.diary.create({
    data: {
      ...rest,
      userId,
      tags: { connect: ownedTagIds.map((id) => ({ id })) },
    },
    include: { tags: { select: tagSelect } },
  });
}

/** Returns the updated entry, or `null` if it doesn't belong to the user. */
export async function updateDiary(
  userId: string,
  id: string,
  input: UpdateDiaryInput,
): Promise<DiaryWithTags | null> {
  // Relation writes can't go through `updateMany`, so confirm ownership first,
  // then `update` by id (which we now know belongs to this user).
  const owned = await prisma.diary.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return null;

  const { tagIds, ...rest } = input;
  const data: Prisma.DiaryUpdateInput = { ...rest };
  if (tagIds !== undefined) {
    const ownedTagIds = await resolveOwnedTagIds(userId, tagIds);
    data.tags = { set: ownedTagIds.map((tagId) => ({ id: tagId })) };
  }

  return prisma.diary.update({
    where: { id },
    data,
    include: { tags: { select: tagSelect } },
  });
}

/** Returns `true` if an entry was deleted, `false` if none matched the user. */
export async function deleteDiary(
  userId: string,
  id: string,
): Promise<boolean> {
  const { count } = await prisma.diary.deleteMany({ where: { id, userId } });
  return count > 0;
}
