/**
 * Client-safe public surface for the `tags` feature — the only path other
 * features (or shared code outside `features/`) should import UI pieces
 * through. For the server-only surface (Prisma-backed functions), import
 * from `./server` instead — never from this file, and never from
 * `./service` directly outside this feature. Keeping the two separate stops
 * a client component's import of e.g. `ALL_TAGS` from dragging Prisma (and
 * therefore `pg`'s Node-only internals) into the client bundle — see
 * `references/cross-feature-boundaries.md` in the `feature-development`
 * skill for what happens if they're merged into one barrel.
 */
export { TagBadge } from "./components/TagBadge";
export { TagPicker } from "./components/TagPicker";
export { TagFilterSelect, ALL_TAGS } from "./components/TagFilterSelect";
