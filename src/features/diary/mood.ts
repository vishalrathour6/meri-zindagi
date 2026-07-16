import type { Mood } from "./schemas";
import { moods } from "./schemas";

/** Display metadata for each mood — emoji + human label. */
export const MOOD_META: Record<Mood, { emoji: string; label: string }> = {
  Happy: { emoji: "😊", label: "Happy" },
  Neutral: { emoji: "😐", label: "Neutral" },
  Sad: { emoji: "😞", label: "Sad" },
};

/** Moods in display order (matches the Prisma enum order). */
export const MOOD_ORDER: Mood[] = [...moods];
