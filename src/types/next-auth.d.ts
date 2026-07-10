import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /** Expose the DB user id (sourced from the JWT `sub` claim) on the session. */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
