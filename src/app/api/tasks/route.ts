import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createTaskSchema, taskQuerySchema } from "@/features/tasks/schemas";
import { badRequest, unauthorized } from "@/lib/api";
import { createTask, listTasks } from "@/services/tasks";

// `/api/*` is NOT covered by the proxy matcher, so each handler guards itself.

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const parsed = taskQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) return badRequest("Invalid search parameters.");

  const result = await listTasks(session.user.id, parsed.data);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) return badRequest("Please check the form and try again.");

  const task = await createTask(session.user.id, parsed.data);
  return NextResponse.json(task, { status: 201 });
}
