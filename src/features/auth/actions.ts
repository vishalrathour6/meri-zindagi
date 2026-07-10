"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

import { loginSchema, registerSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Create a new user from validated register input. Re-validates on the server
 * (never trust the client), rejects duplicate emails, and stores a bcrypt hash.
 */
export async function registerUser(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { name, email, passwordHash } });

  return { ok: true };
}

/**
 * Sign in with credentials. On success Auth.js throws a redirect to
 * `/dashboard` (re-thrown here so Next can handle it); on failure a friendly
 * message is returned. `undefined` means the redirect fired (success).
 */
export async function authenticate(
  input: unknown,
): Promise<{ ok: false; error: string } | undefined> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please enter your email and password." };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, error: "Invalid email or password." };
      }
      return { ok: false, error: "Something went wrong. Please try again." };
    }
    // Re-throw redirects (NEXT_REDIRECT) and any non-auth errors.
    throw error;
  }
}

/** Sign out and return to the landing page. */
export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
