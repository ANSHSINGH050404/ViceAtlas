import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createDiscoverySchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(20).max(3000),
  category: z.enum(["LOCATION", "EASTER_EGG", "VEHICLE", "COLLECTIBLE", "NPC_ENCOUNTER", "MYSTERY", "OTHER"]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  region: z.string().trim().max(100).optional(),
  gameVersion: z.string().trim().max(50).optional()
}).refine((data) => (data.latitude === undefined) === (data.longitude === undefined), {
  message: "Latitude and longitude must be supplied together."
});

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const take = Math.min(Number(searchParams.get("take") || 20), 50);

  const discoveries = await prisma.discovery.findMany({
    where: {
      status: { not: "REJECTED" },
      ...(category ? { category: category as never } : {}),
      ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] } : {})
    },
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(take) && take > 0 ? take : 20,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { votes: true, comments: true, evidence: true } }
    }
  });

  return NextResponse.json({ data: discoveries });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Sign in to submit a discovery." }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = createDiscoverySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid discovery data.", issues: parsed.error.flatten() }, { status: 400 });

  const baseSlug = slugify(parsed.data.title) || "discovery";
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

  const discovery = await prisma.discovery.create({
    data: { ...parsed.data, slug, authorId: session.user.id },
    include: { author: { select: { id: true, name: true, username: true } } }
  });

  return NextResponse.json({ data: discovery }, { status: 201 });
}
