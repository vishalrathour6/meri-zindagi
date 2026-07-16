import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { tagColorClasses } from "../colors";
import type { Tag } from "../api";

type TagBadgeProps = {
  tag: Pick<Tag, "name" | "color">;
  /** When provided, renders a remove button that calls back on click. */
  onRemove?: () => void;
  className?: string;
};

/** Renders one tag as a colored badge, optionally with a remove control. */
export function TagBadge({ tag, onRemove, className }: TagBadgeProps) {
  return (
    <Badge className={cn(tagColorClasses(tag.color), className)}>
      {tag.name}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 ml-0.5 rounded-full opacity-70 hover:opacity-100"
          aria-label={`Remove ${tag.name}`}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </Badge>
  );
}
