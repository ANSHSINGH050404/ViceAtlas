import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { trackAgents } from "@databuddy/sdk/agents";

export async function middleware(request: NextRequest) {
  await trackAgents(request).catch(() => {});
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/:path*.md", "/:path*.txt"]
};