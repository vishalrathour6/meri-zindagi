"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import type { Mood } from "../schemas";
import { MOOD_META, MOOD_ORDER } from "../mood";

type MoodPickerProps = {
  /** Selected mood, or `null` for none (controlled). */
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
};

/**
 * Per-mood highlight for the selected button. The app theme is grayscale, so
 * `bg-accent` reads as "unselected"; these give each mood a visible tint and
 * border, and pin the hover colours so the outline variant can't wash them out.
 */
const SELECTED_STYLES: Record<Mood, string> = {
  Happy:
    "border-amber-500 bg-amber-100 text-amber-950 hover:bg-amber-100 dark:border-amber-400 dark:bg-amber-400/25 dark:text-amber-50 dark:hover:bg-amber-400/25",
  Neutral:
    "border-sky-500 bg-sky-100 text-sky-950 hover:bg-sky-100 dark:border-sky-400 dark:bg-sky-400/25 dark:text-sky-50 dark:hover:bg-sky-400/25",
  Sad:
    "border-indigo-500 bg-indigo-100 text-indigo-950 hover:bg-indigo-100 dark:border-indigo-400 dark:bg-indigo-400/25 dark:text-indigo-50 dark:hover:bg-indigo-400/25",
};

/** Three emoji toggle buttons; clicking the active mood clears it. */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex items-center gap-2">
      {MOOD_ORDER.map((mood) => {
        const selected = value === mood;
        return (
          <Button
            key={mood}
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={selected}
            aria-label={MOOD_META[mood].label}
            title={MOOD_META[mood].label}
            onClick={() => onChange(selected ? null : mood)}
            className={cn(
              "text-lg leading-none transition-all",
              selected && cn("scale-105 border-2 shadow-sm", SELECTED_STYLES[mood]),
            )}
          >
            {MOOD_META[mood].emoji}
          </Button>
        );
      })}
    </div>
  );
}
