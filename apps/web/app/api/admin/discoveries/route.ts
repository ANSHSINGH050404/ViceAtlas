import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } });
  return user?.isAdmin ? session : null;
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const status = request.nextUrl.searchParams.get("status") || "PENDING";
  const discoveries = await prisma.discovery.findMany({
    where: { status: status as never },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, username: true } },
      _count: { select: { votes: true, comments: true, reports: true } }
    }
  });
  return NextResponse.json({ data: discoveries });
}

const patchSchema = z.object({ id: z.string(), status: z.enum(["PENDING", "COMMUNITY_CONFIRMED", "VERIFIED", "REJECTED"]) });

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid." }, { status: 400 });

  const discovery = await prisma.discovery.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    select: { id: true, slug: true, title: true, authorId: true }
  });

  await prisma.notification.create({
    data: {
      userId: discovery.authorId,
      type: "MODERATION",
      title: `Your discovery was ${parsed.data.status.toLowerCase().replace(/_/g, " ")}`,
      body: `"${discovery.title}" status changed to ${parsed.data.status}.`,
      link: `/discoveries/${discovery.slug}`
    }
  });

  return NextResponse.json({ data: discovery });
}