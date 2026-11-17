import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, name: true, username: true, image: true, bio: true, reputation: true, createdAt: true,
      _count: { select: { discoveries: true, comments: true, votes: true } },
      discoveries: {
        where: { status: { not: "REJECTED" } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { _count: { select: { votes: true, comments: true } } }
      }
    }
  });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ data: user });
}