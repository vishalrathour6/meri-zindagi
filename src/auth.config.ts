import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config. Contains no database access or Node-only providers
 * so it can be imported by the proxy (middleware) for optimistic route checks.
 * The full config with providers lives in `auth.ts`.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/diary", "/tasks", "/profile"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        nextUrl.pathname.startsWith(prefix),
      );

      // Block unauthenticated access to protected routes (redirects to signIn).
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
