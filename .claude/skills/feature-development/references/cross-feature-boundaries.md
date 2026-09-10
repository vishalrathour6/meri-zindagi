# Cross-feature boundaries

meri-zindagi is feature-driven: each feature under `src/features/<feature>/` owns its
schemas, hooks/actions, API logic, service, and components. This doc covers the rules
for when code *outside* a feature needs something *from* it.

## The rule

Never import a feature's internal files directly from outside that feature —
`service.ts`, `api.ts`, `hooks.ts`, `schemas.ts`, or anything under `components/`. This
applies to feature-to-feature imports **and** to shared/common code (e.g.
`src/components/`) reaching into a feature — both count as "outside." Import only from
that feature's public entry point(s) — small, curated re-export files that are its
public surface. Don't `export *` the whole feature through them — list exactly the
symbols something outside actually needs, so they stay a real boundary, not a rubber
stamp.

**Not a violation:** a feature's own `app/api/<feature>/route.ts` or `actions.ts`
calling directly into that same feature's `service.ts`. That's the feature's own entry
point calling its own internals, not a cross-feature reach.

**Add these entry points only when something outside the feature actually needs
them.** Don't pre-create empty barrels for features with no external consumers — as of
this writing that's `diary`, `tasks`, and `profile`.

## Two entry points, never one — `index.ts` vs. `server.ts`

A feature's public surface is split across **two files**, not one:

- **`index.ts`** — client-safe exports only: components, constants, pure values.
- **`server.ts`** — server-only exports: Prisma-backed service functions.

**Never combine both in the same file.** This was tried and it broke the production
build: `tags/index.ts` originally re-exported both `resolveOwnedTagIds` (from
`service.ts`, which imports Prisma) and three client components. `tasks/components/TasksWorkspace.tsx`
(a `"use client"` component) imports only `ALL_TAGS` from that barrel — but Turbopack's
production build still pulled the entire barrel's module graph into the client bundle,
including `resolveOwnedTagIds` → `service.ts` → `@/lib/prisma` → `pg`, which needs
Node built-ins (`tls`, `util/types`) that don't exist in a browser bundle. The build
failed with `Module not found: Can't resolve 'tls'` and a cascading chunking error on
an unrelated shared component. Tree-shaking unused named exports does **not** reliably
save you here — the fix was splitting the barrel by runtime target, not relying on
dead-code elimination.

## Worked examples

`src/features/tags/index.ts` (client-safe):

```ts
export { TagBadge } from "./components/TagBadge";
export { TagPicker } from "./components/TagPicker";
export { TagFilterSelect, ALL_TAGS } from "./components/TagFilterSelect";
```

`src/features/tags/server.ts` (server-only):

```ts
import "server-only";

export { resolveOwnedTagIds } from "./service";
```

Consumers: `src/features/diary/service.ts` and `src/features/tasks/service.ts` import
`resolveOwnedTagIds` from `@/features/tags/server`. `src/features/diary/components/*`
and `src/features/tasks/components/*` import `TagBadge`/`TagPicker`/`TagFilterSelect`/
`ALL_TAGS` from `@/features/tags`. Never `@/features/tags/service` or
`@/features/tags/components/TagBadge` directly.

`src/features/auth/index.ts` — the shared `src/components/layout/logout-button.tsx`
needs the `logout` server action:

```ts
export { logout } from "./actions";
```

(No `server.ts`/`server-only` needed here — `logout` lives in `actions.ts`, which
already has `"use server"` at the top; Next's server-action boundary provides the same
protection natively, and `actions.ts` has no client-imported sibling file to leak
into.)

## The `server-only` guard

Every feature's `server.ts` (and `service.ts` itself, as defense in depth) should start
with `import "server-only";`. This doesn't prevent the Turbopack module-resolution
failure described above on its own — that happens before the guard would even run —
but it's still worth keeping: if `service.ts` is ever imported directly by a client
file (bypassing `server.ts` entirely, a plain internal-import violation), it fails
loudly and immediately with a clear message instead of silently shipping broken
client code. `actions.ts`-pattern features (`auth`, `profile`) don't need this — the
`"use server"` directive already gives them the same protection.

**When adding a new cross-feature export:** if it's a component/constant, put it in
`index.ts`. If it touches Prisma or anything server-only, put it in `server.ts`. If
you're not sure which, check whether the file it comes from imports `@/lib/prisma` (or
anything that does) — if so, it belongs in `server.ts`.

## Process rules (apply to any change, not just cross-feature imports)

- **Inspect the existing feature's structure before creating a file.** Check what
  pattern the feature already uses (`references/server-action-pattern.md` vs.
  `references/query-hooks-pattern.md`) and what's already there before adding
  anything.
- **Reuse existing abstractions before creating new ones** — the query-key factory
  shape, `toError()`, the shared `queryClient` in `providers.tsx`, `resolveOwnedTagIds`,
  the response helpers in `src/lib/api.ts`, etc. A new need that looks like an existing
  one should extend or call the existing abstraction, not duplicate it.
- **Don't introduce a third feature-shape pattern.** There are exactly two
  (server-action, fetch+TanStack-Query) — see the top-level `SKILL.md`. A feature that
  seems to need something different is worth a conversation, not a silent third
  pattern.
- **Don't move existing code unless explicitly requested.** A refactor that happens to
  touch a file is not license to relocate unrelated code in the same pass.
