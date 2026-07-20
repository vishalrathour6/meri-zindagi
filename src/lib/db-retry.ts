/**
 * Retry helper for transient database *connection* failures.
 *
 * Neon's serverless compute auto-suspends after inactivity; the first query
 * after a cold start can fail DNS resolution or time out before it ever reaches
 * the database (surfacing as `EAI_AGAIN`, `ETIMEDOUT`, connection refused, etc.).
 * These attempts fail at connection time, so the statement never executed —
 * which is what makes retrying them safe even for writes.
 *
 * We only retry connection-phase errors (never query-logic errors) and cap the
 * total wait so a genuinely-down database still surfaces reasonably fast.
 */

/**
 * Error codes that indicate the query never reached the database. Covers both
 * the socket-level codes bubbled up by the `pg` adapter and Prisma's own
 * "can't reach / lost the database server" codes.
 */
const TRANSIENT_CONNECTION_CODES = new Set([
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EPIPE",
  "P1001", // Can't reach database server
  "P1002", // Database server reached but timed out
  "P1017", // Server has closed the connection
]);

function isTransientConnectionError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && TRANSIENT_CONNECTION_CODES.has(code);
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export type WithDbRetryOptions = {
  /** Number of retries *after* the first attempt (default 4 → 5 tries total). */
  retries?: number;
  /** Base backoff in ms; doubles each retry (300 → 300, 600, 1200, 2400). */
  baseDelayMs?: number;
};

/**
 * Run `fn`, retrying only on transient connection failures with exponential
 * backoff. Non-connection errors (and the final attempt) are rethrown as-is.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  { retries = 4, baseDelayMs = 300 }: WithDbRetryOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !isTransientConnectionError(error)) throw error;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
}
