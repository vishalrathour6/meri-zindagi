"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useCreateTag, useTags } from "../hooks";
import { TagBadge } from "./TagBadge";

type TagPickerProps = {
  /** Selected tag ids (controlled). */
  value: string[];
  onChange: (ids: string[]) => void;
};

/**
 * Inline multi-select for tags. Lists the user's existing tags, toggles them on
 * click, and lets the user create a new tag on the fly when the typed name
 * matches nothing.
 */
export function TagPicker({ value, onChange }: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: tags = [] } = useTags();
  const createMutation = useCreateTag();

  const selectedTags = useMemo(
    () => tags.filter((tag) => value.includes(tag.id)),
    [tags, value],
  );

  const trimmed = query.trim();
  const hasExactMatch = tags.some(
    (tag) => tag.name.toLowerCase() === trimmed.toLowerCase(),
  );

  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  }

  async function handleCreate() {
    if (!trimmed) return;
    try {
      const tag = await createMutation.mutateAsync({ name: trimmed });
      if (!value.includes(tag.id)) onChange([...value, tag.id]);
      setQuery("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create the tag.",
      );
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {selectedTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} onRemove={() => toggle(tag.id)} />
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 gap-1 px-2 text-xs font-normal"
          >
            <Plus className="size-3.5" />
            Add tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {trimmed ? "No matching tags." : "No tags yet."}
              </CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => toggle(tag.id)}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        value.includes(tag.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <TagBadge tag={tag} />
                  </CommandItem>
                ))}
                {trimmed && !hasExactMatch ? (
                  <CommandItem
                    value={`__create__${trimmed}`}
                    onSelect={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    <Plus className="size-4" />
                    Create “{trimmed}”
                  </CommandItem>
                ) : null}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
