import { NextResponse } from "next/server";

/** Consistent `{ error }` JSON body for failed API responses. */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export const unauthorized = () => jsonError("Not authenticated.", 401);
export const badRequest = (message = "Invalid request.") =>
  jsonError(message, 400);
export const notFound = (message = "Not found.") => jsonError(message, 404);
