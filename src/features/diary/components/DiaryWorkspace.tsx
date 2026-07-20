"use client";

import { useMemo, useState } from "react";
import { NotebookPen } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ALL_TAGS } from "@/features/tags/components/TagFilterSelect";

import type { Diary, DiaryListParams } from "../api";
import { useDeleteDiary, useDiaries } from "../hooks";
import { toDateParam } from "../utils";
import { DeleteDiaryDialog } from "./DeleteDiaryDialog";
import { DiaryEditor } from "./DiaryEditor";
import { DiaryList } from "./DiaryList";
import { DiaryToolbar } from "./DiaryToolbar";

export function DiaryWorkspace() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [tag, setTag] = useState<string>(ALL_TAGS);
  const [mood, setMood] = useState<string>(ALL_TAGS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Diary | null>(null);

  const params: DiaryListParams = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      date: date ? toDateParam(date) : undefined,
      tag: tag === ALL_TAGS ? undefined : tag,
      mood: mood === ALL_TAGS ? undefined : (mood as DiaryListParams["mood"]),
      page: 1,
      pageSize: 100,
    }),
    [debouncedSearch, date, tag, mood],
  );

  const { data, isLoading, isError } = useDiaries(params);
  const deleteMutation = useDeleteDiary(params);

  const items = useMemo(() => data?.items ?? [], [data]);
  const selected = items.find((entry) => entry.id === selectedId) ?? null;
  const showEditor = isCreating || selected !== null;

  function handleSelect(entry: Diary) {
    setIsCreating(false);
    setSelectedId(entry.id);
  }

  function handleNew() {
    setSelectedId(null);
    setIsCreating(true);
  }

  function handleCreated(entry: Diary) {
    setIsCreating(false);
    setSelectedId(entry.id);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        toast.success("Entry deleted.");
        if (selectedId === target.id) setSelectedId(null);
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete the entry.",
        );
        setDeleteTarget(null);
      },
    });
  }

  return (
    <>
      <Card className="grid gap-0 p-0 md:grid-cols-[320px_1fr]">
        <div className="flex min-w-0 flex-col gap-4 p-4">
          <DiaryToolbar
            search={search}
            onSearchChange={setSearch}
            date={date}
            onDateChange={setDate}
            tag={tag}
            onTagChange={setTag}
            mood={mood}
            onMoodChange={setMood}
            onNew={handleNew}
          />
          <Separator />
          <DiaryList
            items={items}
            selectedId={selectedId}
            onSelect={handleSelect}
            isLoading={isLoading}
            isError={isError}
          />
        </div>

        <div className="min-w-0 border-t p-4 md:border-t-0 md:border-l md:p-6">
          {showEditor ? (
            <DiaryEditor
              key={selected?.id ?? "new"}
              entry={selected}
              onCreated={handleCreated}
              onDeleteRequest={() => setDeleteTarget(selected)}
            />
          ) : (
            <div className="text-muted-foreground flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center">
              <NotebookPen className="size-8" />
              <p className="max-w-xs text-sm">
                Select an entry to read or edit it, or start a new one.
              </p>
            </div>
          )}
        </div>
      </Card>

      <DeleteDiaryDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        entryTitle={deleteTarget?.title}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
