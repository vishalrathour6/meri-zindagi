/**
 * Fixed tag palette. Keys are stored on `Tag.color`; the values are Tailwind
 * classes tuned to stay legible in both light and dark mode. Using a preset
 * palette (rather than arbitrary hex) keeps badges predictable and theme-safe.
 */

/** Palette keys, as a const tuple so the Zod enum and types stay in sync. */
export const TAG_COLOR_KEYS = [
  "slate",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "blue",
  "violet",
  "pink",
] as const;

export type TagColor = (typeof TAG_COLOR_KEYS)[number];

/** Badge background/text classes for each palette key. */
export const TAG_COLORS: Record<TagColor, string> = {
  slate:
    "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200",
  red: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-200",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-200",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  green:
    "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-200",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-200",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-400/15 dark:text-pink-200",
};

/** Classes for a stored color, falling back to `slate` for unknown values. */
export function tagColorClasses(color: string): string {
  return TAG_COLORS[color as TagColor] ?? TAG_COLORS.slate;
}

/**
 * Deterministically pick a palette key from a tag name so inline-created tags
 * get a stable color without any extra UI (same name → same color).
 */
export function colorForName(name: string): TagColor {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return TAG_COLOR_KEYS[hash % TAG_COLOR_KEYS.length];
}
