import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({ body: z.string().trim().min(1).max(2000) });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { discoveryId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true, username: true, image: true } } }
  });
  return NextResponse.json({ data: comments });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });

  const { id } = await params;
  const discovery = await prisma.discovery.findUnique({ where: { id } });
  if (!discovery) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid comment." }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { body: parsed.data.body, userId: session.user.id, discoveryId: id },
    include: { user: { select: { id: true, name: true, username: true, image: true } } }
  });

  if (discovery.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: discovery.authorId,
        type: "COMMENT",
        title: "New comment on your discovery",
        body: `${session.user.name ?? "Someone"} commented on "${discovery.title}".`,
        link: `/discoveries/${discovery.slug}`
      }
    });
  }

  return NextResponse.json({ data: comment }, { status: 201 });
}