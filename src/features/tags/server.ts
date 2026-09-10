import "server-only";

/**
 * Server-only public surface for the `tags` feature. Kept in a separate file
 * from `./index.ts` (the client-safe barrel) so a client component can never
 * transitively pull in Prisma by importing this feature's UI pieces — see
 * `references/cross-feature-boundaries.md` in the `feature-development` skill.
 */
export { resolveOwnedTagIds } from "./service";
