"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDateLabel, toDateParam } from "@/lib/format";
import { TagPicker } from "@/features/tags/components/TagPicker";

import type { Task, TaskListParams } from "../api";
import { useCreateTask, useUpdateTask } from "../hooks";
import { priorities } from "../schemas";
import { PRIORITY_META } from "../priority";

const formSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long"),
  dueDate: z.date().optional(),
  priority: z.enum(priorities),
  tagIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The task being edited, or `null` to create a new one. */
  task: Task | null;
  params: TaskListParams;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  params,
}: TaskFormDialogProps) {
  const isEditing = task !== null;
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask(params);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      priority: "Medium",
      tagIds: [],
    },
  });

  // Reset the form to match the selected task each time the dialog opens.
  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
        priority: task?.priority ?? "Medium",
        tagIds: task?.tags.map((tag) => tag.id) ?? [],
      });
    }
  }, [open, task, form]);

  async function onSubmit(values: FormValues) {
    const dueDate = values.dueDate ? toDateParam(values.dueDate) : null;
    const description = values.description.trim();
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: task.id,
          input: {
            title: values.title,
            description,
            dueDate,
            priority: values.priority,
            tagIds: values.tagIds,
          },
        });
        toast.success("Task updated.");
      } else {
        await createMutation.mutateAsync({
          title: values.title,
          description,
          dueDate,
          priority: values.priority,
          tagIds: values.tagIds,
        });
        toast.success("Task added.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this task."
              : "Add a task to your list."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What needs doing?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any details… (optional)"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due date</FormLabel>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className="justify-start font-normal"
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {field.value
                              ? formatDateLabel(field.value)
                              : "No due date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {field.value ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.onChange(undefined)}
                      >
                        <X className="mr-1 size-3.5" />
                        Clear
                      </Button>
                    ) : null}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_META[p].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <TagPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving…"
                  : isEditing
                    ? "Save changes"
                    : "Add task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
