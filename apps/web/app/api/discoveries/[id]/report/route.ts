import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reportSchema = z.object({ reason: z.string().trim().min(5).max(500) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Sign in to report." }, { status: 401 });

  const { id } = await params;
  const discovery = await prisma.discovery.findUnique({ where: { id } });
  if (!discovery) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid report." }, { status: 400 });

  await prisma.report.create({ data: { reason: parsed.data.reason, reporterId: session.user.id, discoveryId: id } });
  return NextResponse.json({ ok: true }, { status: 201 });
}