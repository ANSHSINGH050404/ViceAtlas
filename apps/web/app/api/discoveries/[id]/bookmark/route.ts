import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Sign in to bookmark." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.bookmark.findUnique({ where: { userId_discoveryId: { userId: session.user.id, discoveryId: id } } });
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }
  await prisma.bookmark.create({ data: { userId: session.user.id, discoveryId: id } });
  return NextResponse.json({ bookmarked: true });
}