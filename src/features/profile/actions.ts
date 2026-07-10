"use server";

import { revalidatePath } from "next/cache";

import { auth, unstable_update } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

import { changePasswordSchema, updateProfileSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Update the signed-in user's display name. Re-validates on the server, then
 * refreshes the session token via `unstable_update` so the new name is reflected
 * everywhere immediately (not just after the next sign-in).
 */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }

  const { name } = parsed.data;
  await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  await unstable_update({ user: { name } });
  revalidatePath("/profile");

  return { ok: true };
}

/**
 * Change the signed-in user's password. Verifies the current password before
 * storing a new bcrypt hash.
 */
export async function changePassword(input: unknown): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return { ok: false, error: "Your current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { ok: true };
}
