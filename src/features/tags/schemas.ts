import { z } from "zod";

import { TAG_COLOR_KEYS } from "./colors";

/** Shared field rules so create stays consistent with any future edit path. */
const name = z
  .string()
  .trim()
  .min(1, "Tag name is required")
  .max(50, "Tag name is too long");
const color = z.enum(TAG_COLOR_KEYS).optional();

/** Body for creating (or finding) a tag. Color is optional — the service picks
 * a deterministic default from the name when omitted. */
export const createTagSchema = z.object({ name, color });

export type CreateTagInput = z.infer<typeof createTagSchema>;

/** A tag id reference, reused by diary/task schemas for their `tagIds` field. */
export const tagId = z.string();
