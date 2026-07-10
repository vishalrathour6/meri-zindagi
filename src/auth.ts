import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { loginSchema } from "@/features/auth/schemas";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

/**
 * Full Auth.js instance. Uses JWT sessions with a Credentials provider that
 * verifies email/password against the database. No Prisma adapter is wired
 * because the schema (User/Diary/Task) intentionally has no
 * Account/Session/VerificationToken tables; add the adapter if/when OAuth or
 * database sessions are introduced.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    session({ session, token }) {
      // Auth.js stores the user id on `token.sub` by default; expose it.
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
