"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTags } from "../hooks";

/** Sentinel value for "no tag filter" (Select items can't be empty strings). */
export const ALL_TAGS = "all";

type TagFilterSelectProps = {
  /** Selected tag id, or `ALL_TAGS` for no filter. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Dropdown to filter a list to a single tag, fed by the user's tags. */
export function TagFilterSelect({
  value,
  onChange,
  className,
}: TagFilterSelectProps) {
  const { data: tags = [] } = useTags();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className} aria-label="Filter by tag">
        <SelectValue placeholder="All tags" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_TAGS}>All tags</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
