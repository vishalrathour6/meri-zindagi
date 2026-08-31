# Fetch + TanStack Query pattern

Used by `diary`, `tasks`, `tags`. `schemas.ts` + `api.ts` (fetch wrappers) + `hooks.ts`
(TanStack Query hooks), backed by `src/app/api/<feature>/route.ts` →
`src/services/<feature>.ts` (see `route-handler-service-pattern.md` for that half).

## `api.ts` — fetch wrappers

No Zod here — pure `fetch` wrappers returning typed promises. The client-facing type is
defined **independently** of the Prisma model because dates cross the wire as ISO
strings: `src/features/tasks/api.ts`'s `Task` type has `dueDate: string | null`,
`createdAt: string`, not `Date` — don't reuse Prisma's generated type here.

Every function follows:

```ts
const res = await fetch(...);
if (!res.ok) throw await toError(res, "fallback message");
return res.json();
```

`toError` is a local helper that parses `{ error?: string }` from the failed response
body (matching `src/lib/api.ts`'s `jsonError` shape) and falls back to a generic message
if the body doesn't parse.

## `hooks.ts` — query keys and mutations

`"use client"` at the top. Exports a hierarchical query-key factory:

```ts
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
};
```

`all` → `lists()` → `list(params)`. List reads use the fully-specific `list(params)` key
(the params object is part of the key, so each filter/page combination gets its own cache
entry); mutations invalidate the broader `lists()` key so every cached param combination
refetches.

**Create** (`useCreateTask`): no optimistic update, just
`onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() })`.

**Update/delete** (`useUpdateTask(params)`, `useDeleteTask(params)`): full optimistic
triad, closing over `key = taskKeys.list(params)` for the currently-displayed list only
(not every cached variant):

```ts
onMutate: async (...) => {
  await queryClient.cancelQueries({ queryKey: key });
  const previous = queryClient.getQueryData<TaskListResult>(key);
  if (previous) queryClient.setQueryData(key, { ...previous, items: previous.items.map/filter(...) });
  return { previous };
},
onError: (_err, _vars, context) => {
  if (context?.previous) queryClient.setQueryData(key, context.previous);
},
onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
```

Follow this exact shape for a new mutation: cancel + snapshot in `onMutate`, roll back in
`onError` using the returned context, always invalidate in `onSettled` regardless of
outcome.

## Cache persistence (context, not something to reconfigure per-feature)

The shared `QueryClient` and its `localStorage` persistence are configured once in
`src/app/providers.tsx`, not per-feature:

- `QUERY_CACHE_KEY = "mz-query-cache"`.
- `staleTime: 60_000`, `refetchOnWindowFocus: false`, `gcTime: 1000 * 60 * 60 * 24`.
- `createAsyncStoragePersister` with `storage: typeof window !== "undefined" ?
  window.localStorage : undefined` — the `undefined` on SSR makes it a no-op.
- Comment ties this to the offline goal: last-loaded diary/tasks/tags stay readable
  offline. A new feature's `hooks.ts` gets this for free by using the shared
  `queryClient` — don't create a second `QueryClient` instance.

## Client-schema vs. wire-schema divergence (intentional)

`src/features/tasks/components/TaskFormDialog.tsx` defines its **own local** Zod schema
(`formSchema`) rather than reusing `createTaskSchema`/`updateTaskSchema` from
`schemas.ts`, because the calendar widget needs a `Date` object
(`dueDate: z.date().optional()`) while the server schema expects a `YYYY-MM-DD` string.
The component converts with `toDateParam()` from `@/lib/format` on submit. This is a
deliberate, existing split — if a new field has this same client-widget-type vs.
wire-type mismatch, follow the same pattern (local form schema + a small adapter
function), don't try to force one shared schema to serve both.
