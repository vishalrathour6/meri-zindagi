import { describe, expect, it, vi } from "vitest";

import { withDbRetry } from "./db-retry";

function errorWithCode(code: string) {
  return Object.assign(new Error(code), { code });
}

describe("withDbRetry", () => {
  it("returns the result on the first successful attempt without retrying", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(withDbRetry(fn, { baseDelayMs: 0 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries a transient connection error and eventually succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(errorWithCode("ETIMEDOUT"))
      .mockRejectedValueOnce(errorWithCode("P1001"))
      .mockResolvedValueOnce("ok");

    await expect(withDbRetry(fn, { baseDelayMs: 0 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry a non-transient error", async () => {
    const fn = vi.fn().mockRejectedValue(errorWithCode("P2002"));
    await expect(withDbRetry(fn, { baseDelayMs: 0 })).rejects.toMatchObject({
      code: "P2002",
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry an error with no error code at all", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(withDbRetry(fn, { baseDelayMs: 0 })).rejects.toThrow("boom");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up and rethrows after exhausting retries", async () => {
    const fn = vi.fn().mockRejectedValue(errorWithCode("ECONNRESET"));
    await expect(
      withDbRetry(fn, { retries: 2, baseDelayMs: 0 }),
    ).rejects.toMatchObject({ code: "ECONNRESET" });
    expect(fn).toHaveBeenCalledTimes(3); // first attempt + 2 retries
  });
});
