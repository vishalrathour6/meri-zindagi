import type { CreateTagInput } from "./schemas";

/** Client-facing tag shape. */
export type Tag = {
  id: string;
  name: string;
  color: string;
};

async function toError(res: Response, fallback: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? fallback);
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch("/api/tags");
  if (!res.ok) throw await toError(res, "Failed to load tags.");
  return res.json();
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const res = await fetch("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await toError(res, "Failed to create the tag.");
  return res.json();
}
