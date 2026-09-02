import { describe, expect, it } from "vitest";

import { badRequest, notFound, unauthorized } from "./api";

async function readJson(res: Response) {
  return (await res.json()) as { error: string };
}

describe("unauthorized", () => {
  it("returns a 401 with the standard message", async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    await expect(readJson(res)).resolves.toEqual({
      error: "Not authenticated.",
    });
  });
});

describe("badRequest", () => {
  it("defaults to a generic 400 message", async () => {
    const res = badRequest();
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ error: "Invalid request." });
  });

  it("accepts a custom message", async () => {
    const res = badRequest("Please check the form and try again.");
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({
      error: "Please check the form and try again.",
    });
  });
});

describe("notFound", () => {
  it("defaults to a generic 404 message", async () => {
    const res = notFound();
    expect(res.status).toBe(404);
    await expect(readJson(res)).resolves.toEqual({ error: "Not found." });
  });

  it("accepts a custom message", async () => {
    const res = notFound("Task not found.");
    expect(res.status).toBe(404);
    await expect(readJson(res)).resolves.toEqual({ error: "Task not found." });
  });
});
