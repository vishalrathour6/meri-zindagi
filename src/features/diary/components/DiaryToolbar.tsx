"use client";

import { CalendarIcon, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagFilterSelect } from "@/features/tags/components/TagFilterSelect";

import { formatDateLabel } from "../utils";
import { moods } from "../schemas";
import { MOOD_META } from "../mood";

type DiaryToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  tag: string;
  onTagChange: (value: string) => void;
  mood: string;
  onMoodChange: (value: string) => void;
  onNew: () => void;
};

export function DiaryToolbar({
  search,
  onSearchChange,
  date,
  onDateChange,
  tag,
  onTagChange,
  mood,
  onMoodChange,
  onNew,
}: DiaryToolbarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search entries…"
            className="pl-8"
            aria-label="Search diary entries"
          />
        </div>
        <Button onClick={onNew} size="icon" aria-label="Add diary entry">
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-start font-normal"
            >
              <CalendarIcon className="mr-2 size-4" />
              {date ? formatDateLabel(date) : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {date ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateChange(undefined)}
          >
            <X className="mr-1 size-3.5" />
            Clear
          </Button>
        ) : null}
        <Select value={mood} onValueChange={onMoodChange}>
          <SelectTrigger className="w-full flex-1 min-w-28" aria-label="Filter by mood">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            {moods.map((m) => (
              <SelectItem key={m} value={m}>
                {MOOD_META[m].emoji} {MOOD_META[m].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TagFilterSelect
          value={tag}
          onChange={onTagChange}
          className="w-full flex-1 min-w-28"
        />
      </div>
    </div>
  );
}
