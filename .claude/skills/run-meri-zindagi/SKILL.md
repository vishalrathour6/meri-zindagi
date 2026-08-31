---
name: run-meri-zindagi
description: Build, run, and drive the meri-zindagi Next.js app (diary + tasks manager). Use when asked to start meri-zindagi, run the dev server, take a screenshot of its UI, register/log in a test user, or verify a change in the diary/tasks/auth flow end-to-end.
---

Meri Zindagi is a Next.js 16 (Turbopack) app with Auth.js credentials
login and a Prisma/Neon Postgres backend. There is no browser-automation
tool installed in the repo (no Playwright, no `chromium-cli`) — drive it
with `.claude/skills/run-meri-zindagi/driver.cjs`, a small standalone
script using `playwright-core` against the machine's installed Google
Chrome.

All paths below are relative to the repo root.

## Prerequisites

- Google Chrome must already be installed and on `PATH` as
  `google-chrome`. Verified present at `/usr/bin/google-chrome`
  (v138) in this container — no `apt-get` needed here. If it's
  missing on a fresh machine, install a real Chrome/Chromium package
  first; `playwright-core` alone does not bundle a browser.
- Node + pnpm as the main project already requires (see root
  `AGENTS.md`).
- A reachable `DATABASE_URL` in `.env` (Neon Postgres in this repo).
  The driver's `smoke` command registers a brand-new user against
  whichever database `.env` points to — see Gotchas.

## Setup

One-time, inside this skill directory (kept isolated from the
project's own pnpm lockfile — this is agent tooling, not a project
dependency):

```bash
cd .claude/skills/run-meri-zindagi
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund
```

This installs `playwright-core` only (no bundled Chromium download —
we drive the system Chrome via `channel: "chrome"` instead, which
avoids needing `apt-get` for Chromium's shared-lib dependencies).

Root project deps must already be installed (`pnpm install` at repo
root) so `pnpm dev` resolves.

## Build

No separate build step for local driving — `pnpm dev` runs Turbopack
in dev mode directly.

## Run (agent path)

Start the dev server in the background from the repo root, then drive
it with the script:

```bash
pnpm dev > /tmp/mz-dev.log 2>&1 &
disown
for i in {1..30}; do curl -sf http://localhost:3000 >/dev/null && break; sleep 1; done
```

Then, from `.claude/skills/run-meri-zindagi/`:

```bash
node driver.cjs smoke
```

`smoke` registers a fresh throwaway user, logs in, opens the diary's
"New entry" panel, selects a mood, and screenshots each step (light
and dark). It prints any browser console errors it captured. On
success:

```
landing: http://localhost:3000/ - Meri Zindagi — Daily Diary & Task Manager
post-auth: http://localhost:3000/dashboard
mood buttons found: 3
smoke OK, screenshots in .../run-meri-zindagi/shots
```

Screenshots land in `.claude/skills/run-meri-zindagi/shots/`:
`01-landing.png`, `02-dashboard.png`, `03-diary-empty.png`,
`04-new-entry.png`, `05-mood-selected-light.png`,
`06-mood-selected-dark.png`.

Other driver commands:

| command | what it does |
|---|---|
| `node driver.cjs smoke` | full register → login → diary → mood-pick flow, 6 screenshots |
| `node driver.cjs nav <path>` | navigate to `<path>` unauthenticated, print resolved URL/title, screenshot to `shots/nav.png` |
| `node driver.cjs shot <path> <out.png>` | navigate to `<path>`, full-page screenshot to an explicit file |

Override the target with `MZ_BASE_URL` (default
`http://localhost:3000`) and the screenshot directory with
`MZ_SHOT_DIR`.

Stop the server by freeing the port (`$!` after `pnpm dev &` is the
pnpm wrapper, not the Next.js process, and won't forward signals):

```bash
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill
```

## Run (human path)

```bash
pnpm dev   # → http://localhost:3000, Ctrl-C to stop
```

## Test

No test script exists in this repo (`docs/CODING_STANDARDS.md`'s
Vitest/Playwright section is aspirational — nothing is installed).
`node driver.cjs smoke` is the closest thing to an end-to-end check.

---

## Gotchas

- **Protected routes redirect through `/login?callbackUrl=...`.**
  `src/auth.config.ts`'s `PROTECTED_PREFIXES` covers `/dashboard`,
  `/diary`, `/tasks`, `/profile`. `node driver.cjs nav /diary`
  unauthenticated lands on the login page, not `/diary` — that's
  correct behavior, not a driver bug.
- **Registration doesn't log you in.** Submitting `/register`
  redirects to `/login`; you still have to fill and submit the login
  form. The driver's `registerAndLogin` does both steps.
- **First request after `pnpm dev` starts is slow (Turbopack
  on-demand compile).** Wait on `page.waitForURL(...)` /
  `waitUntil: "networkidle"`, not a fixed `sleep` — a fixed 1.5s
  sleep once caught the register form still showing "Creating
  account…".
- **The mood picker only exists inside "New entry."** It's not on the
  diary list view — open it via the button with
  `aria-label="Add diary entry"` first.
- **`smoke` writes a real user row to whatever `DATABASE_URL` is
  active.** In this repo `.env` currently points at a Neon cloud
  database, not a local one — each `smoke` run permanently registers
  a new `driver+<pid><rand>@example.test` account with no cleanup.
  Harmless throwaway data, but don't point this at a database you
  don't want extra rows in.
- **No bundled Chromium needed.** `playwright-core` with
  `channel: "chrome"` drives the machine's real Google Chrome
  directly — this sidesteps `npx playwright install`'s browser
  version pinning and the shared-library `apt-get` dance entirely,
  as long as `google-chrome` is already on the box.

## Troubleshooting

- **`browserType.launch: Executable doesn't exist at
  .../chromium_headless_shell-.../chrome-headless-shell`**: happens
  if you use the full `playwright` package (which tries to launch its
  own pinned, possibly-not-downloaded Chromium build) instead of
  `playwright-core` + `channel: "chrome"`. Use this driver as-is
  rather than swapping in bare `chromium.launch()`.
- **`mood buttons found: 0`**: means you're still on the diary list
  view, not the entry editor — the driver clicks
  `[aria-label="Add diary entry"]` first; if that selector ever
  changes in `DiaryToolbar.tsx`, update it here too.
- **`EADDRINUSE` on `pnpm dev`**: a previous run's server is still
  bound. `lsof -ti:3000 -sTCP:LISTEN | xargs -r kill` before
  relaunching — `$!` from the backgrounded `pnpm dev &` is the pnpm
  wrapper's PID, not the Next.js process, so killing it alone doesn't
  free the port.
