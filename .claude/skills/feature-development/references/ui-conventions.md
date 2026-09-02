# UI conventions

Shared by both feature patterns.

## Component placement

Real domain components live under `src/features/<feature>/components/*.tsx` — e.g.
`src/features/tasks/components/{TaskList,TaskItem,TaskFormDialog,TasksToolbar,
TasksWorkspace,DeleteTaskDialog}.tsx`, `src/features/diary/components/{DiaryList,
DiaryEditor,DiaryToolbar,DiaryWorkspace,MoodPicker,DeleteDiaryDialog}.tsx`.

`src/components/diary/`, `src/components/tasks/`, and `src/components/forms/` each
contain **only a `.gitkeep`** — they're empty, intentionally-scaffolded placeholders left
over from an earlier plan, not the real location. `docs/ARCHITECTURE.md` still describes
`components/diary`/`components/tasks` as if they held domain components; that's stale —
follow the actual code, not that doc. Don't put new diary/task/tag/profile/auth
components there.

`src/components/` only holds genuinely shared, feature-agnostic pieces:
`components/ui/*` (shadcn primitives, generated via the CLI), `components/layout/*`
(`app-header.tsx`, `main-nav.tsx`, `mobile-nav.tsx`, `nav-items.ts`, `theme-toggle.tsx`,
`logout-button.tsx`), and `components/common/service-worker-register.tsx`.

## Form boilerplate

Every form (`ProfileForm.tsx`, `login-form.tsx`, `TaskFormDialog.tsx`) follows the same
hand-declared shape — there is **no shared field-wrapper component** beyond the raw
shadcn primitives in `src/components/ui/form.tsx` (`Form`/`FormField`/`FormItem`/
`FormLabel`/`FormControl`/`FormMessage`):

```tsx
const form = useForm<SomeInput>({ resolver: zodResolver(someSchema), defaultValues: {...} });

async function onSubmit(values: SomeInput) { ... }

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
    <FormField
      control={form.control}
      name="x"
      render={({ field }) => (
        <FormItem>
          <FormLabel>...</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? "Saving…" : "Save"}
    </Button>
  </form>
</Form>
```

Every field is declared this way by hand — don't reach for a `<TextField name=...
label=... />`-style abstraction, it doesn't exist here (`src/components/forms/` is an
empty placeholder, see above). Submit buttons uniformly disable on
`form.formState.isSubmitting` and swap the label to an "-ing…" gerund;
`ProfileForm.tsx` additionally disables while `!form.formState.isDirty`.

Use `cn()` from `src/lib/utils.ts` (`twMerge(clsx(inputs))`) for any conditional
className, matching e.g. `DiaryList.tsx`'s
`cn("hover:bg-accent ... p-3", entry.id === selectedId && "border-primary bg-accent")`.

## Loading / error / empty states

There are **no** route-level `error.tsx`/`loading.tsx`/`not-found.tsx` files anywhere
under `src/app/` — that's not the convention in this repo, don't introduce them as if
they were expected. Instead, every list-rendering client component inlines its own
three-branch state handling before the happy path, using TanStack Query's
`isLoading`/`isError` plus an empty-array check. The exact same shape appears in both
`TaskList.tsx` and `DiaryList.tsx`:

```tsx
if (isLoading) return (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} ... />)}
  </div>
);
if (isError) return <p className="text-destructive py-6 text-sm">Couldn't load your X. Please try again.</p>;
if (items.length === 0) return <p className="text-muted-foreground py-6 text-sm">No X yet. ... to get started.</p>;
return <ul>...</ul>;
```

Follow this order (loading → error → empty → happy path) and these exact Tailwind
tokens (`text-destructive`, `text-muted-foreground`) for a new list component, rather
than adding a new shared `<EmptyState>`/`<QueryState>` wrapper — none exists today and
introducing one would be a new abstraction, not documentation of an existing pattern.
