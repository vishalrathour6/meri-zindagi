import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// Next.js 16 renamed Middleware to Proxy. This runs the edge-safe Auth.js config
// for optimistic auth checks (the `authorized` callback in auth.config.ts),
// redirecting unauthenticated users away from protected routes.
export default NextAuth(authConfig).auth;

export const config = {
  // Run on all routes except Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
