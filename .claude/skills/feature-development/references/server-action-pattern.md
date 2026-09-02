# Server-action pattern

Used by `auth` and `profile`. No `api.ts`/`hooks.ts`, no TanStack Query — the form calls
a server action directly.

## Shape

`src/features/<feature>/schemas.ts` — plain `z.object` per action. Cross-field checks use
`.refine()` with `path: [...]` to attach the error to the specific field, e.g.
`changePasswordSchema` (`src/features/profile/schemas.ts`) refines that
`confirmPassword` matches and that `newPassword !== currentPassword`. Every schema
exports both the const and its inferred type
(`export type UpdateProfileInput = z.infer<typeof updateProfileSchema>`).

`src/features/<feature>/actions.ts` — `"use server"` at the top of the file. Every
exported action has the signature `(input: unknown): Promise<ActionResult>`, where

```ts
type ActionResult = { ok: true } | { ok: false; error: string };
```

is declared once per feature file (duplicated identically in `src/features/auth/actions.ts`
and `src/features/profile/actions.ts` — don't try to share it across features, that's the
existing convention). Body shape, always in this order:

1. `schema.safeParse(input)` → on failure, return a **generic** client-facing message
   (`"Please check the form and try again."`) — never leak Zod issue details to the
   client.
2. `await auth()` → `if (!session?.user?.id) return { ok: false, error: "You must be
   signed in." }`.
3. Do the Prisma work.
4. `return { ok: true }`.

`updateProfile` (`src/features/profile/actions.ts`) additionally calls
`unstable_update({ user: { name } })` from `@/auth` and `revalidatePath("/profile")`
after the DB write — needed because a server action changed session-visible data.

`authenticate()` (`src/features/auth/actions.ts`) is the one exception to the generic
try/catch shape: it calls `signIn("credentials", {...parsed.data, redirectTo:
"/dashboard"})` inside a try/catch, catches `AuthError` and maps
`error.type === "CredentialsSignin"` to a friendly message, but **re-throws anything
else** — including Next's internal `NEXT_REDIRECT` error used to perform the redirect.
Don't wrap `signIn()` in a catch that swallows non-`AuthError` errors; that would break
the redirect.

## Client side

Components (`src/features/profile/components/ProfileForm.tsx`,
`src/features/auth/components/login-form.tsx`) call the action directly in `onSubmit`:

```ts
const result = await updateProfile(values);
if (!result.ok) {
  toast.error(result.error);
  return;
}
toast.success(...);
```

No TanStack Query involved — check `result.ok`, don't `try/catch` a thrown error (that's
the fetch+query pattern's convention, not this one). `ProfileForm` also calls
`router.refresh()` after a successful session-affecting action, since a server component
needs to re-render with the updated session.

## Reuse between client and server validation

Unlike the fetch+query pattern, the **same** schema object is passed to both
`zodResolver(updateProfileSchema)` on the client and
`updateProfileSchema.safeParse(input)` on the server — full reuse, no divergence, because
none of these features have a field whose form-widget type differs from its wire type
(contrast with `dueDate` in the tasks feature — see `query-hooks-pattern.md`).
