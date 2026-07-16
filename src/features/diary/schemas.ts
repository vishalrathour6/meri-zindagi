import { z } from "zod";

/** Shared field rules so create/update stay consistent. */
const title = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title is too long");
const content = z.string().trim().min(1, "Write something before saving");
/** Ids of tags to attach to the entry. */
const tagIds = z.array(z.string()).optional();
/** Optional mood attached to the entry. */
export const moods = ["Happy", "Neutral", "Sad"] as const;
const mood = z.enum(moods).nullable().optional();

/** Body for creating a diary entry. */
export const createDiarySchema = z.object({ title, content, tagIds, mood });

/**
 * Body for updating an entry. Every field is optional (PATCH semantics) but at
 * least one must be provided so we never issue an empty update.
 */
export const updateDiarySchema = createDiarySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nothing to update",
  });

/** Query string for listing entries — search, single-day filter, pagination. */
export const diaryQuerySchema = z.object({
  q: z.string().trim().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date")
    .optional(),
  tag: z.string().optional(),
  mood: z.enum(moods).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type Mood = (typeof moods)[number];
export type CreateDiaryInput = z.infer<typeof createDiarySchema>;
export type UpdateDiaryInput = z.infer<typeof updateDiarySchema>;
export type DiaryQuery = z.infer<typeof diaryQuerySchema>;
