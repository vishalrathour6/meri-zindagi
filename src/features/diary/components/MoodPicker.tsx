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
              "text-lg leading-none",
              selected && "border-primary bg-accent",
            )}
          >
            {MOOD_META[mood].emoji}
          </Button>
        );
      })}
    </div>
  );
}
