---
name: architecture
description: System-level architecture reference for meri-zindagi — layering, tech stack, data model, auth flow, and the PWA/offline setup. Use when orienting in the codebase, explaining how a request flows end to end, or checking whether docs/ARCHITECTURE.md's claims still hold (they often don't — this skill is the accurate replacement).
---

# Architecture

meri-zindagi is a Next.js 16 App Router diary + task manager. This skill is the
up-to-date system map; `docs/ARCHITECTURE.md` covers similar ground but has drifted
(it still describes a pre-refactor `src/services/` layout, `middleware.ts`, Recharts,
and a Playwright suite — none of which exist in this repo). Trust this file and the
actual code over `docs/` when they disagree. For the feature-by-feature implementation
playbook (which pattern to follow, file-by-file order), see the `feature-development`
skill instead — this one is the bird's-eye view.

## Request flow

```
app/ (pages, route handlers, server actions)
  -> features/<feature>/api.ts (fetch wrappers)  or  features/<feature>/actions.ts ("use server")
  -> src/app/api/<feature>/route.ts               (for the api.ts path)
  -> features/<feature>/service.ts                (business logic + Prisma calls)
     — or inline Prisma calls in actions.ts for auth/profile
  -> generated Prisma client (src/generated/prisma/client)
  -> Postgres (Neon)
```

Route handlers and server actions stay thin: auth check, validate, delegate. Every
`service.ts` function takes `userId` as an explicit argument and scopes its Prisma
`where` clause by it — the id is never trusted from the request body alone. See
`src/features/diary/service.ts` and `src/features/tags/service.ts` for the pattern,
including the one sanctioned cross-feature call: `diary`/`tasks` import
`resolveOwnedTagIds` from `features/tags/server.ts` (never a feature's internal
`service.ts`/`api.ts`/`hooks.ts`/`components/*` directly) to validate tag ownership
before attaching tags (`tags` never imports back from `diary`/`tasks`). A feature's
public surface is split across two files — `index.ts` for client-safe exports
(components, constants) and `server.ts` for server-only exports (Prisma-backed
functions) — deliberately never combined in one barrel, because a client component
transitively importing a barrel that also re-exports Prisma-backed code drags `pg`'s
Node-only internals into the client bundle and breaks the production build. This
boundary applies to any code importing into a feature from outside it, including
shared/common components under `src/components/` — see `feature-development`'s
`references/cross-feature-boundaries.md` for the full rule and worked examples.

Two coexisting feature shapes live under `src/features/<feature>/` — which one a
given feature uses, and the concrete file-by-file steps, are covered in the
`feature-development` skill, not repeated here.

## Auth flow (Auth.js v5, split config)

- `src/auth.config.ts` — edge-safe: no DB access, no Node-only providers. Holds
  `PROTECTED_PREFIXES` (`/dashboard`, `/diary`, `/tasks`, `/profile`) and the
  `authorized` callback that redirects logged-out users away from them.
- `src/proxy.ts` — Next.js 16's replacement for `middleware.ts` (default export,
  Node runtime). Imports `authConfig` and runs `NextAuth(authConfig).auth` on every
  route except `/api`, `_next/static`, `_next/image`, `favicon.ico` (see its
  `matcher`). This is *optimistic* auth only — a redirect, not a hard guard.
- `src/auth.ts` — full config: adds the Credentials provider (bcrypt password check
  against `User.passwordHash` via `src/lib/password.ts`) and JWT session strategy.
  No Prisma adapter — Credentials + JWT needs no Account/Session tables. Exports
  `handlers`, `auth`, `signIn`, `signOut`, `unstable_update`.
- **`/api` routes are excluded from the proxy matcher**, so every route handler
  calls `auth()` itself and returns `unauthorized()` (from `src/lib/api.ts`) on
  failure — there is no middleware-level API protection.
- Adding a new protected top-level route means adding its prefix to
  `PROTECTED_PREFIXES` in `auth.config.ts`, or it silently won't redirect.

## Data model

`prisma/schema.prisma` (Prisma v7, `prisma-client` generator, output at
`src/generated/prisma` — gitignored, not `@prisma/client`):

- `User` 1:N `Diary`, `Task`, `Tag`.
- `Diary` M:N `Tag`; optional `Mood` enum (`Happy`/`Neutral`/`Sad`).
- `Task` M:N `Tag`; `Status` enum (`Pending`/`Completed`), `Priority` enum
  (`Low`/`Medium`/`High`), optional `dueDate`.
- `Tag` is per-user (`@@unique([userId, name])`) — the same tag name can exist once
  per user, shared across their diaries and tasks.
- All four models index `userId` (`Diary`, `Task`, `Tag`) for the per-user scoping
  every service query does.

`DATABASE_URL` (pooled, for the app) and `DIRECT_URL` (direct, for
`prisma.config.ts` migrations/CLI) are both required — Prisma v7 does not auto-load
`.env`. `src/lib/prisma.ts` constructs the client with `PrismaPg` (the
`@prisma/adapter-pg` adapter for a standard `postgresql://` URL — not
`accelerateUrl`, which is only for a `prisma+postgres://` Accelerate URL), reuses a
single instance across hot reloads via `globalThis`, and wraps every query in
`withDbRetry` (`src/lib/db-retry.ts`, via `$extends`) so a Neon cold-start
connection failure (`ETIMEDOUT`, `P1001`, etc.) retries with backoff instead of
surfacing as a 500 — it only retries connection-phase errors, never query-logic
ones. Keep this wrapper if you ever touch Prisma client construction.

## Tech stack (as installed, not as aspirational docs claim)

| Concern | What's actually used |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | shadcn/ui (Radix primitives) + Tailwind CSS v4 |
| Forms | React Hook Form + `@hookform/resolvers` |
| Validation | Zod v4, colocated in `features/<feature>/schemas.ts` |
| Server state | TanStack Query v5, persisted to `localStorage` |
| Auth | Auth.js v5 beta (`next-auth@beta`), Credentials + JWT |
| ORM | Prisma v7 (`prisma-client` generator, not classic `@prisma/client`) |
| DB | PostgreSQL via Neon |
| Passwords | `bcryptjs` (pure JS, serverless-safe) |
| Icons / Toasts | `lucide-react` / `sonner` |
| Tests | Vitest only — no Playwright, no component-rendering setup |
| Package manager | pnpm (pinned via `packageManager`) |
| Deployment | Vercel, no Dockerfile/vercel.json |

Notably absent despite `docs/` mentioning them: Recharts, Playwright, Husky,
Commitlint. Don't assume they're available.

## Folder structure (current, not the pre-refactor one in docs/)

```
src/
├── app/                      # routes: (auth)/{login,register}, dashboard, diary,
│                              # tasks, profile, offline, api/{diary,tasks,tags,auth}
├── auth.ts, auth.config.ts   # Auth.js (see Auth flow above)
├── proxy.ts                  # Next 16 middleware replacement
├── components/
│   ├── ui/                   # shadcn/ui-generated, don't hand-edit structure
│   ├── layout/                # header/nav/theme-toggle, app-wide chrome
│   └── common/                # ServiceWorkerRegister etc.
│   # NOTE: components/diary, components/tasks, components/forms are empty
│   # (.gitkeep only) — feature UI now lives in features/<feature>/components/.
├── features/<feature>/       # schemas.ts + (api.ts+hooks.ts | actions.ts) +
│                              # service.ts (fetch-pattern features only) + components/
├── lib/                      # prisma.ts, db-retry.ts, api.ts, password.ts, format.ts, utils.ts
├── hooks/                     # cross-feature hooks (e.g. use-debounced-value)
├── generated/prisma/          # gitignored Prisma client output
└── types/                     # next-auth.d.ts session augmentation
```

`src/utils/` and `src/constants/` no longer hold real code (empty, `.gitkeep`
placeholders only) — don't add new files there; put shared helpers in `src/lib/` and
feature-specific constants inside the feature's own directory instead.

## PWA / offline

- `public/sw.js` is hand-written (no Workbox — fights Turbopack). Strategy: precache
  `/offline` + icons on install; static assets cache-first; navigations
  network-first falling back to cache then `/offline`; `GET /api/*` network-first
  falling back to last cached response; non-GET and `/api/auth/*` always pass
  through uncached. Bump `CACHE_VERSION` whenever caching behavior changes, or the
  change is a no-op for already-installed clients.
- SW registration (`src/components/common/service-worker-register.tsx`) is
  intentionally disabled under `next dev` — it conflicts with Turbopack. Only test
  install/offline behavior against a production build (`pnpm build && pnpm start`).
- `src/app/manifest.ts` is Next's typed `MetadataRoute.Manifest` export, not a
  static `manifest.json` — edit it as a TS function, not JSON.
- The TanStack Query cache persists to `localStorage` under the key `mz-query-cache`
  (`QUERY_CACHE_KEY` in `src/app/providers.tsx`) and is cleared on logout. Route any
  new query state through the shared `queryClient` in `providers.tsx` rather than a
  second `QueryClient` instance, or it won't participate in persistence/clearing.

## Validation

There's no architecture-specific test suite — run the standard gate after a
structural change:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

A change to `auth.config.ts`/`proxy.ts` or route protection is worth manually
verifying in a browser (the `run-meri-zindagi` skill can drive this) since the
`authorized` callback and matcher have no automated coverage.
