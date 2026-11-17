import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const voteSchema = z.object({ value: z.union([z.literal(1), z.literal(-1)]) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Sign in to vote." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid vote." }, { status: 400 });

  const discovery = await prisma.discovery.findUnique({ where: { id } });
  if (!discovery) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const existing = await prisma.vote.findUnique({ where: { userId_discoveryId: { userId: session.user.id, discoveryId: id } } });

  let delta = 0;
  if (!existing) {
    await prisma.vote.create({ data: { userId: session.user.id, discoveryId: id, value: parsed.data.value } });
    delta = parsed.data.value;
  } else if (existing.value === parsed.data.value) {
    await prisma.vote.delete({ where: { id: existing.id } });
    delta = -existing.value;
  } else {
    await prisma.vote.update({ where: { id: existing.id }, data: { value: parsed.data.value } });
    delta = parsed.data.value - existing.value;
  }

  const updated = await prisma.discovery.update({
    where: { id },
    data: { voteScore: { increment: delta } },
    select: { voteScore: true }
  });

  if (delta !== 0 && discovery.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: discovery.authorId,
        type: "VOTE",
        title: "New vote on your discovery",
        body: `${session.user.name ?? "Someone"} voted on "${discovery.title}".`,
        link: `/discoveries/${discovery.slug}`
      }
    });
    await prisma.user.update({ where: { id: discovery.authorId }, data: { reputation: { increment: delta } } });
  }

  return NextResponse.json({ voteScore: updated.voteScore, userVote: existing && existing.value === parsed.data.value ? 0 : parsed.data.value });
}