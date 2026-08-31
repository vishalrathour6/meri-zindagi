# Route handler + service pattern

The backend half of the fetch+TanStack-Query pattern (`diary`, `tasks`, `tags`). Every
route file follows the same fixed template — copy it rather than improvising.

## Route handler template

Per HTTP verb in `src/app/api/<feature>/route.ts` / `[id]/route.ts`:

1. **Auth guard, always first, every handler:**
   ```ts
   const session = await auth();
   if (!session?.user?.id) return unauthorized();
   ```
   This is required even though page routes are separately protected by `src/proxy.ts`.
   `src/proxy.ts`'s matcher (`["/((?!api|_next/static|_next/image|favicon.ico).*)"]`)
   **excludes `/api/*`**, so nothing else guards these handlers. Skipping this check on a
   new route is a real, exploitable bug in this repo, not a defense-in-depth nicety.
2. **Validate.** Body: `const body = await request.json().catch(() => null); const
   parsed = someSchema.safeParse(body); if (!parsed.success) return
   badRequest("Please check the form and try again.");` — same generic message
   convention as the server-action pattern, no per-field Zod detail sent to the client.
   Query strings: `someQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))`.
3. **Dynamic segments are async** (Next 16 typed route context):
   `ctx: RouteContext<"/api/tasks/[id]">` then `const { id } = await ctx.params;`.
4. **Delegate to the service**, passing `session.user.id` as the first positional
   argument to every service function.
5. **Translate the service's return value.** Services return `T | null` for get/update
   and `boolean` for delete when the record doesn't belong to the caller (or doesn't
   exist) — handlers turn that into `if (!task) return notFound(...)` /
   `if (!deleted) return notFound(...)`. Successful `POST` →
   `NextResponse.json(task, { status: 201 })`; successful `DELETE` →
   `new NextResponse(null, { status: 204 })`.

The three response helpers live in `src/lib/api.ts` (12 lines total):

```ts
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
export const unauthorized = () => jsonError("Not authenticated.", 401);
export const badRequest = (message = "Invalid request.") => jsonError(message, 400);
export const notFound = (message = "Not found.") => jsonError(message, 404);
```

Every `{error: string}` body in the whole API surface flows through this — it's exactly
the shape each feature's `api.ts`'s `toError()` expects. Don't invent a new error body
shape for a new route.

## Service layer rules

`src/services/<feature>.ts` — doc-commented per file: "Every function is scoped by
`userId` so a user can only read or mutate their own X."

- Every exported function takes `userId: string` as its **first** parameter and folds it
  into the Prisma `where` clause via spread-conditionals, e.g.
  `where: Prisma.TaskWhereInput = { userId, ...(status ? { status } : {}), ... }`.
- **Updates need an explicit ownership check before writing** — relation writes (e.g.
  reassigning `tags`) can't go through `updateMany`, so `updateTask`/`updateDiary` first
  do `findFirst({ where: { id, userId }, select: { id: true } })`, return `null` if
  nothing matches, then `update({ where: { id }, ... })`. Follow this two-step shape for
  any new update that touches a relation field.
- **Deletes** use `deleteMany({ where: { id, userId } })` and check `count > 0` — a
  single atomic query that both scopes by owner and reports whether anything happened.
  No separate existence check needed here (unlike update).
- **Tag ids must be resolved through `resolveOwnedTagIds(userId, tagIds)`**
  (`src/services/tags.ts`) before being attached to a task or diary in create/update —
  this is what prevents a user from attaching another user's tag id to their own
  record. Call it the same way `services/tasks.ts` and `services/diary.ts` already do;
  don't attach `tagIds` straight from the request body.

## Known gap — no Prisma error handling

There is **no** `PrismaClientKnownRequestError`/error-code handling anywhere in this
repo (no `instanceof Prisma.*`, no `P2002` checks). Route handlers do not wrap service
calls in try/catch, so a thrown Prisma error (e.g. a unique-constraint violation) will
propagate uncaught out of the route handler and become Next's default unhandled 500 —
not the `{error}` JSON shape everything else uses. This is a pre-existing inconsistency,
not a pattern to replicate on purpose: if you're adding a write path where a constraint
violation is a realistic, user-triggerable outcome (e.g. a new `@@unique` constraint),
it's worth flagging in review rather than assuming it's already handled.
