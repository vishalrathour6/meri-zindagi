import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateTaskSchema } from "@/features/tasks/schemas";
import { badRequest, notFound, unauthorized } from "@/lib/api";
import { deleteTask, getTask, updateTask } from "@/services/tasks";

// `/api/*` is NOT covered by the proxy matcher, so each handler guards itself.

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/tasks/[id]">,
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await ctx.params;
  const task = await getTask(session.user.id, id);
  if (!task) return notFound("Task not found.");

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/tasks/[id]">,
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) return badRequest("Please check the form and try again.");

  const task = await updateTask(session.user.id, id, parsed.data);
  if (!task) return notFound("Task not found.");

  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/tasks/[id]">,
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await ctx.params;
  const deleted = await deleteTask(session.user.id, id);
  if (!deleted) return notFound("Task not found.");

  return new NextResponse(null, { status: 204 });
}
