import type { TaskPriority } from "./schemas";
import { priorities } from "./schemas";

/**
 * Display metadata for each priority — label + Badge classes tuned for light and
 * dark mode (same approach as the tag palette in features/tags/colors.ts).
 */
export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badgeClass: string }
> = {
  Low: {
    label: "Low",
    badgeClass:
      "bg-slate-100 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300",
  },
  Medium: {
    label: "Medium",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  },
  High: {
    label: "High",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-200",
  },
};

/** Priorities in display order (matches the Prisma enum order). */
export const PRIORITY_ORDER: TaskPriority[] = [...priorities];
