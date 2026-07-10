import { z } from "zod";

/** Shared field rules so create/update stay consistent. */
const title = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title is too long");
const content = z.string().trim().min(1, "Write something before saving");

/** Body for creating a diary entry. */
export const createDiarySchema = z.object({ title, content });

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
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateDiaryInput = z.infer<typeof createDiarySchema>;
export type UpdateDiaryInput = z.infer<typeof updateDiarySchema>;
export type DiaryQuery = z.infer<typeof diaryQuerySchema>;
