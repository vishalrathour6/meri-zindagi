/**
 * Public surface for the `auth` feature — the only path other features (or
 * shared code outside `features/`) should import through. Everything else in
 * `auth/` (schemas.ts, the rest of actions.ts, components/) is internal.
 */
export { logout } from "./actions";
