# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `pnpm dev` — start the dev server (Turbopack; SW registration is disabled here, see AGENTS.md).
- `pnpm build` / `pnpm start` — production build / run.
- `pnpm lint` — ESLint (flat config, `eslint-config-next`).
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm format` — Prettier, writes in place.
- `pnpm db:generate` — regenerate the Prisma client (also runs automatically via `postinstall`).
- `pnpm db:migrate` — `prisma migrate dev`; run with `DIRECT_URL` set (see AGENTS.md env-vars note).
- There is no `test` script and no test runner installed — `docs/CODING_STANDARDS.md`'s
  Vitest/Playwright/Husky/Commitlint sections are aspirational, not present in this repo.

## Architecture notes

- Request flow is layered: `app/` (pages/route handlers) → `features/*/api.ts` or `actions.ts`
  → `src/services/*.ts` (business logic, Prisma calls) → generated Prisma client → Postgres.
  Route handlers and server actions stay thin; put logic in `services/`.
- Data model (`prisma/schema.prisma`): `User` 1:N `Diary`/`Task`/`Tag`, with `Diary`/`Task`
  M:N `Tag` (per-user tags, `@@unique([userId, name])`). `Diary` has an optional `Mood`
  enum (Happy/Neutral/Sad); `Task` has `Status` (Pending/Completed) and `Priority`
  (Low/Medium/High).
- `docs/` (PRD, ARCHITECTURE, DATABASE, REQUIREMENTS, UI_GUIDELINES, ROADMAP, CODING_STANDARDS)
  has useful background but drifts from the real setup in places (e.g. it still says
  `middleware.ts` and lists Recharts/Vitest/Playwright, none of which are in
  `package.json`) — prefer AGENTS.md and the actual code when they disagree.
