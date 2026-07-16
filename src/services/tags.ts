import type { Tag } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { CreateTagInput } from "@/features/tags/schemas";
import { colorForName } from "@/features/tags/colors";

/**
 * Tag data-access layer. Every function is scoped by `userId` so a user can
 * only read or mutate their own tags. Reused by the tag route handlers and by
 * the diary/task services when connecting tags to entries.
 */

export async function listTags(userId: string): Promise<Tag[]> {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/**
 * Find-or-create a tag by name for this user. Relies on the
 * `@@unique([userId, name])` constraint so repeated inline creation of the same
 * name never produces duplicates. Color defaults deterministically from the
 * name when not supplied.
 */
export async function createTag(
  userId: string,
  input: CreateTagInput,
): Promise<Tag> {
  const color = input.color ?? colorForName(input.name);
  return prisma.tag.upsert({
    where: { userId_name: { userId, name: input.name } },
    update: {},
    create: { userId, name: input.name, color },
  });
}

/**
 * Filter a list of tag ids down to the ones this user actually owns, so a user
 * can never attach another user's tag to their diary entry or task.
 */
export async function resolveOwnedTagIds(
  userId: string,
  ids: string[] | undefined,
): Promise<string[]> {
  if (!ids || ids.length === 0) return [];
  const rows = await prisma.tag.findMany({
    where: { userId, id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}
