import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { withDbRetry } from "@/lib/db-retry";

// Reuse a single PrismaClient across hot reloads / serverless invocations to
// avoid exhausting database connections. See docs scalability notes.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  // Retry transient connection failures (e.g. Neon compute waking from
  // auto-suspend) around every query, so cold starts don't surface as 500s.
  return new PrismaClient({ adapter }).$extends({
    query: {
      $allOperations({ args, query }) {
        return withDbRetry(() => query(args));
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
