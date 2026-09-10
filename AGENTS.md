<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project conventions (Meri Zindagi)

These are verified against the installed packages and are past most training cutoffs —
trust them over prior knowledge.

- **Next.js 16:** middleware is now `src/proxy.ts` (default export, runs on the Node
  runtime), not `middleware.ts`. The route matcher lives in the exported `config`.
- **Prisma v7:** uses the `prisma-client` generator → generated client at
  `src/generated/prisma/client` (gitignored + eslint-ignored, not `@prisma/client`).
  `DATABASE_URL` is loaded from `.env` via `prisma.config.ts` (Prisma does NOT read
  `.env` automatically in v7). The `PrismaClient` constructor requires either
  `{ adapter }` for a standard `postgresql://` URL (we use `PrismaPg` from
  `@prisma/adapter-pg` — see `src/lib/prisma.ts`) or `{ accelerateUrl }` for a
  Prisma Postgres `prisma+postgres://` URL. Local dev DB: `npx prisma dev`.
- **Auth.js v5 (`next-auth@beta`):** split config.
  - `src/auth.config.ts` — edge-safe, no DB/Node-only providers; holds the
    `authorized` callback + `pages.signIn`; imported by `src/proxy.ts`.
  - `src/auth.ts` — full config: Credentials provider + JWT strategy; exports
    `handlers`, `auth`, `signIn`, `signOut`. No Prisma adapter (Credentials + JWT
    needs no Account/Session tables). Session `id` is exposed via `jwt`/`session`
    callbacks; types augmented in `src/types/next-auth.d.ts`.
- **Passwords:** hashed with `bcryptjs` (pure-JS, serverless-safe) via
  `src/lib/password.ts`.
- **Validation:** Zod v4 schemas colocated in `src/features/<feature>/schemas.ts`.
- **shadcn/ui:** add components with `pnpm dlx shadcn@latest add <name> -y` →
  lands in `src/components/ui`. Icons: `lucide-react`. Toasts: `sonner`.
- **Feature structure:** two coexisting patterns under `src/features/<feature>/` —
  match whichever one the feature you're touching already uses; don't mix them.
  - `auth`, `profile`: `schemas.ts` + `actions.ts` (server actions, `"use server"`)
    + `components/`.
  - `diary`, `tasks`, `tags`: `schemas.ts` + `api.ts` (fetch wrappers) + `hooks.ts`
    (TanStack Query hooks, query-key factories, optimistic updates) + `components/`,
    backed by `src/app/api/<feature>/route.ts` → `features/<feature>/service.ts`.
- **`features/<feature>/service.ts`:** business logic and Prisma calls live here, not
  in route handlers or actions. Services always scope queries by `userId` — the id
  alone is never trusted. `diary` and `tasks` import `resolveOwnedTagIds` from
  `features/tags/server.ts` (not `index.ts` — see next bullet) to validate tag
  ownership — a normal, one-directional cross-feature dependency (tags never imports
  from diary/tasks).
- **Cross-feature boundaries:** never import another feature's internal files
  (`service.ts`, `api.ts`, `hooks.ts`, `schemas.ts`, or a `components/*` file) directly
  — this includes shared/common code under `src/components/` reaching into a feature,
  not just feature-to-feature. Import only from that feature's public entry point(s):
  `index.ts` for client-safe exports (components, constants) and a separate
  `server.ts` for server-only exports (Prisma-backed service functions) — **never
  combine both in one barrel file.** A client component transitively importing a
  barrel that also re-exports a Prisma-backed function drags `pg`'s Node-only
  internals into the client bundle and breaks the production build (confirmed: this
  happened with a combined `tags/index.ts` and was fixed by splitting it into
  `index.ts` + `server.ts`, each guarded by `import "server-only"` where relevant).
  Add these entry points to a feature only once something outside it actually needs
  to consume it — don't pre-create empty barrels for features with no external
  consumers (currently `diary`, `tasks`, `profile`). A feature's own
  `app/api/<feature>/route.ts` or `actions.ts` calling directly into that same
  feature's `service.ts` is not a cross-feature import and stays as-is. See the
  `feature-development` skill's `references/cross-feature-boundaries.md` for the
  worked examples and the process rules (inspect existing structure before adding
  files, reuse existing abstractions, don't introduce a third feature-shape pattern,
  don't move existing code unless asked).
- **API routes self-guard auth:** `src/proxy.ts`'s matcher excludes `/api`, so
  every route handler calls `auth()` and returns `unauthorized()` itself. Reuse
  the shared helpers in `src/lib/api.ts` (`unauthorized`, `badRequest`, `notFound`).
- **Protected pages:** `src/auth.config.ts` has a hardcoded `PROTECTED_PREFIXES`
  array — add any new top-level protected route there or it won't redirect
  unauthenticated users.
- **Linting:** `eslint.config.mjs` ignores `src/generated/**` (Prisma client) and
  `.claude/**` (Claude Code skills/agents — isolated package.json/lockfile, not
  application source; `driver.cjs` is intentionally CommonJS).
- **Package manager:** pnpm only (`packageManager` pin + lockfile matter for
  Vercel build parity — don't bump the pnpm version without regenerating the
  lockfile). Scripts: `dev`, `build`, `lint`, `typecheck`, `format`, `test`,
  `test:watch`, `db:generate`, `db:migrate`.
- **Unit tests:** Vitest (`vitest.config.mts`, alias `@` → `./src`,
  `environment: "node"`). Colocated `*.test.ts` files, currently covering
  `src/lib/*`, `src/features/tags/colors.ts`, and the Zod schemas in
  `src/features/*/schemas.ts` — pure-logic unit tests only, no component
  rendering or route-handler tests yet. `pnpm test` runs once; `pnpm test:watch`
  for watch mode.
- **Env vars:** `DATABASE_URL` (pooled) vs `DIRECT_URL` (direct — used by
  `prisma.config.ts` for migrations/CLI). Run `db:migrate` with `DIRECT_URL` set,
  or a pooled-only URL can hit PgBouncer prepared-statement errors. `AUTH_SECRET`
  via `npx auth secret`. Neon is the Postgres provider.
- **DB retry wrapper:** `src/lib/prisma.ts` wraps all queries via
  `src/lib/db-retry.ts` (`$extends`) to retry Neon cold-start connection errors.
  Keep this when touching the Prisma client setup.
- **PWA:** hand-written `public/sw.js` (no Workbox) — bump `CACHE_VERSION` when
  changing caching behavior or the change is a no-op for existing installs. SW
  registration is intentionally disabled under `next dev` (fights Turbopack).
  `src/app/manifest.ts` is Next's `MetadataRoute.Manifest` API, not a static
  JSON file. The TanStack Query cache persists to `localStorage`
  (`mz-query-cache`) and is cleared on logout — route new query state through
  the shared `queryClient` to stay consistent.
- **Deployment:** Vercel + Neon, no Dockerfile/vercel.json — don't introduce one
  assuming a different target.
- **`docs/`:** background on architecture/requirements, but
  `docs/CODING_STANDARDS.md`'s Testing section is now partly real (Vitest unit
  tests exist, see above) and partly still aspirational (Playwright e2e doesn't);
  its Tooling section's Husky/Commitlint claims are still aspirational — neither
  is installed.
- **Never commit** until the user explicitly says so.
