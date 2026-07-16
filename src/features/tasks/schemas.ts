import { z } from "zod";

/** Shared field rules so create/update stay consistent. */
const title = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title is too long");
const description = z
  .string()
  .trim()
  .max(2000, "Description is too long")
  .optional();
const dueDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date")
  .nullable()
  .optional();
export const taskStatuses = ["Pending", "Completed"] as const;
const status = z.enum(taskStatuses);
/** Ids of tags to attach to the task. */
const tagIds = z.array(z.string()).optional();

/** Body for creating a task. Status defaults to Pending in the database. */
export const createTaskSchema = z.object({ title, description, dueDate, tagIds });

/** Body for updating a task — every field optional, but at least one required. */
export const updateTaskSchema = z
  .object({ title: title.optional(), description, dueDate, status, tagIds })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nothing to update",
  });

/** Query string for listing tasks — search, status filter, pagination. */
export const taskQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: status.optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(100),
});

export type TaskStatus = (typeof taskStatuses)[number];
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
