import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createTagSchema } from "@/features/tags/schemas";
import { badRequest, unauthorized } from "@/lib/api";
import { createTag, listTags } from "@/services/tags";

// `/api/*` is NOT covered by the proxy matcher, so each handler guards itself.

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const tags = await listTags(session.user.id);
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createTagSchema.safeParse(body);
  if (!parsed.success) return badRequest("Please check the form and try again.");

  const tag = await createTag(session.user.id, parsed.data);
  return NextResponse.json(tag, { status: 201 });
}
