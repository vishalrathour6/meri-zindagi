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
- **Feature structure:** feature code lives under `src/features/<feature>/`
  (`schemas.ts`, `actions.ts` server actions, `components/`).
- **Never commit** until the user explicitly says so.
