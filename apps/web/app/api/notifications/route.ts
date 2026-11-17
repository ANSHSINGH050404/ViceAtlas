import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const unread = await prisma.notification.count({ where: { userId: session.user.id, read: false } });
  return NextResponse.json({ data: notifications, unread });
}

const readSchema = z.object({ id: z.string().optional(), all: z.boolean().optional() });

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = readSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid." }, { status: 400 });

  if (parsed.data.all) {
    await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
  } else if (parsed.data.id) {
    await prisma.notification.updateMany({ where: { id: parsed.data.id, userId: session.user.id }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}