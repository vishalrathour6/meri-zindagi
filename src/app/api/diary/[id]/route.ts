import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateDiarySchema } from "@/features/diary/schemas";
import { badRequest, notFound, unauthorized } from "@/lib/api";
import { deleteDiary, getDiary, updateDiary } from "@/services/diary";

// `/api/*` is NOT covered by the proxy matcher, so each handler guards itself.

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/diary/[id]">,
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await ctx.params;
  const diary = await getDiary(session.user.id, id);
  if (!diary) return notFound("Diary entry not found.");

  return NextResponse.json(diary);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/diary/[id]">,
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = updateDiarySchema.safeParse(body);
  if (!parsed.success) return badRequest("Please check the form and try again.");

  const diary = await updateDiary(session.user.id, id, parsed.data);
  if (!diary) return notFound("Diary entry not found.");

  return NextResponse.json(diary);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/diary/[id]">,
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await ctx.params;
  const deleted = await deleteDiary(session.user.id, id);
  if (!deleted) return notFound("Diary entry not found.");

  return new NextResponse(null, { status: 204 });
}
