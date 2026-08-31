---
name: feature-development
description: Playbook for adding or modifying a feature in meri-zindagi (diary/tasks/tags/profile/auth) consistently with the repo's two existing patterns. Use when implementing a new feature, adding a field/endpoint to an existing one, or unsure which pattern (server actions vs fetch+TanStack Query) to follow.
---

# Feature development

meri-zindagi has exactly two coexisting feature shapes under `src/features/<feature>/`.
Match whichever one the feature you're touching already uses — don't mix them, and don't
invent a third. (This is also documented at a high level in root `AGENTS.md`; this skill
gives the concrete step-by-step and cites real files.)

## Which pattern?

- **Server-action pattern** (`auth`, `profile`): a form posts directly to a
  `"use server"` action, no client-side cache. Use this when the feature is simple
  CRUD tied 1:1 to a form and doesn't need a filterable/cached list view.
  See `references/server-action-pattern.md`. Exemplar: `src/features/profile/`.
- **Fetch + TanStack Query pattern** (`diary`, `tasks`, `tags`): a `route.ts` handler
  backs a `hooks.ts` of query/mutation hooks with optimistic updates. Use this when the
  feature needs a paginated/filterable list, client-side caching, or offline read access
  (the TanStack Query cache persists to `localStorage`, see AGENTS.md). This is the
  pattern most new features should follow. See `references/query-hooks-pattern.md` and
  `references/route-handler-service-pattern.md`. Exemplar: `src/features/tasks/`.

Component placement and form/loading/error conventions are shared by both patterns —
see `references/ui-conventions.md`.

## Request-flow template (fetch + TanStack Query pattern)

For a new or modified list-backed feature, touch files in this order:

1. `src/features/<feature>/schemas.ts` — Zod schemas (`create<Feature>Schema`,
   `update<Feature>Schema`, `<feature>QuerySchema`), field primitives factored as
   module-level consts, `z.infer` types exported at the bottom.
2. `src/app/api/<feature>/route.ts` (+ `[id]/route.ts`) — `auth()` guard first in every
   handler, `safeParse` the body/query, delegate to the service.
3. `src/services/<feature>.ts` — `userId`-scoped, ownership-checked Prisma calls.
4. `src/features/<feature>/api.ts` — fetch wrappers, `toError()` helper for non-ok
   responses.
5. `src/features/<feature>/hooks.ts` — query-key factory + optimistic-update triad.
6. `src/features/<feature>/components/*.tsx` — never `src/components/<feature>/`.

Details and copy-paste-able shapes for steps 2–3 are in
`references/route-handler-service-pattern.md`; steps 4–5 in
`references/query-hooks-pattern.md`.

## Validation

There is no test runner in this repo (`docs/CODING_STANDARDS.md`'s Vitest/Playwright
section is aspirational — see AGENTS.md). After changing code, run:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

For UI-affecting changes, use the `run-meri-zindagi` skill's `smoke`/`shot` driver
commands to see the change working in a real browser — that's the closest thing to an
end-to-end check available here.
