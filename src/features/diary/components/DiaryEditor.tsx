"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagPicker } from "@/features/tags/components/TagPicker";

import type { Diary } from "../api";
import { useCreateDiary, useUpdateDiary } from "../hooks";
import { createDiarySchema, type CreateDiaryInput } from "../schemas";
import { formatDateLabel } from "../utils";

type DiaryEditorProps = {
  /** The entry being edited, or `null` to compose a new one. */
  entry: Diary | null;
  onCreated: (entry: Diary) => void;
  onDeleteRequest: () => void;
};

export function DiaryEditor({
  entry,
  onCreated,
  onDeleteRequest,
}: DiaryEditorProps) {
  const isEditing = entry !== null;
  const createMutation = useCreateDiary();
  const updateMutation = useUpdateDiary();

  const form = useForm<CreateDiaryInput>({
    resolver: zodResolver(createDiarySchema),
    defaultValues: {
      title: entry?.title ?? "",
      content: entry?.content ?? "",
      tagIds: entry?.tags.map((tag) => tag.id) ?? [],
    },
  });

  async function onSubmit(values: CreateDiaryInput) {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: entry.id, input: values });
        toast.success("Entry updated.");
      } else {
        const created = await createMutation.mutateAsync(values);
        toast.success("Entry saved.");
        form.reset({ title: "", content: "", tagIds: [] });
        onCreated(created);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {isEditing ? "Edit entry" : "New entry"}
          </h2>
          {isEditing ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
              Created {formatDateLabel(entry.createdAt)} · Updated{" "}
              {formatDateLabel(entry.updatedAt)}
            </p>
          ) : null}
        </div>
        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDeleteRequest}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1 size-4" />
            Delete
          </Button>
        ) : null}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="A title for today" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex flex-1 flex-col">
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write about your day…"
                    className="min-h-[240px] flex-1 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tagIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagPicker
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Save entry"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
