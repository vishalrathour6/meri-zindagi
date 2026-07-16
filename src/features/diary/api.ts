import type { CreateDiaryInput, UpdateDiaryInput } from "./schemas";

/**
 * Client-facing diary shape. Dates cross the wire as ISO strings (JSON has no
 * Date type), so we model them as strings rather than reusing Prisma's type.
 */
export type Diary = {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: { id: string; name: string; color: string }[];
  createdAt: string;
  updatedAt: string;
};

export type DiaryListParams = {
  q?: string;
  date?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
};

export type DiaryListResult = {
  items: Diary[];
  total: number;
  page: number;
  pageSize: number;
};

/** Pull the `{ error }` message off a failed response, with a fallback. */
async function toError(res: Response, fallback: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? fallback);
}

export async function fetchDiaries(
  params: DiaryListParams,
): Promise<DiaryListResult> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.date) search.set("date", params.date);
  if (params.tag) search.set("tag", params.tag);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const res = await fetch(`/api/diary?${search.toString()}`);
  if (!res.ok) throw await toError(res, "Failed to load diary entries.");
  return res.json();
}

export async function createDiary(input: CreateDiaryInput): Promise<Diary> {
  const res = await fetch("/api/diary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await toError(res, "Failed to create the entry.");
  return res.json();
}

export async function updateDiary(
  id: string,
  input: UpdateDiaryInput,
): Promise<Diary> {
  const res = await fetch(`/api/diary/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await toError(res, "Failed to save the entry.");
  return res.json();
}

export async function deleteDiary(id: string): Promise<void> {
  const res = await fetch(`/api/diary/${id}`, { method: "DELETE" });
  if (!res.ok) throw await toError(res, "Failed to delete the entry.");
}
