import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createDiarySchema, diaryQuerySchema } from "@/features/diary/schemas";
import { badRequest, unauthorized } from "@/lib/api";
import { createDiary, listDiaries } from "@/services/diary";

// `/api/*` is NOT covered by the proxy matcher, so each handler guards itself.

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const parsed = diaryQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) return badRequest("Invalid search parameters.");

  const result = await listDiaries(session.user.id, parsed.data);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createDiarySchema.safeParse(body);
  if (!parsed.success) return badRequest("Please check the form and try again.");

  const diary = await createDiary(session.user.id, parsed.data);
  return NextResponse.json(diary, { status: 201 });
}
