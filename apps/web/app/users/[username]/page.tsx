import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, name: true, username: true, image: true, bio: true, reputation: true, createdAt: true,
      _count: { select: { discoveries: true, comments: true } },
      discoveries: {
        where: { status: { not: "REJECTED" } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, slug: true, title: true, category: true, status: true, voteScore: true, createdAt: true }
      }
    }
  });
  if (!user) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-12">
      <Link href="/discoveries" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← Back</Link>
      <div className="mt-8 flex items-center gap-4">
        {user.image ? <img src={user.image} alt="" className="h-16 w-16 rounded-full" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold">{(user.username ?? user.name)[0]?.toUpperCase()}</div>}
        <div>
          <h1 className="text-3xl font-black">{user.username ?? user.name}</h1>
          {user.bio && <p className="mt-1 text-sm text-zinc-400">{user.bio}</p>}
          <p className="mt-1 text-xs text-zinc-500">Reputation: {user.reputation} · {user._count.discoveries} discoveries · {user._count.comments} comments</p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">Discoveries</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {user.discoveries.map((d) => (
          <Link key={d.id} href={`/discoveries/${d.slug}`} className="rounded-2xl border border-zinc-800 bg-[#111114] p-4 hover:border-[#b8ff65]/40">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">{d.category.replaceAll("_", " ")}</div>
            <div className="mt-2 font-bold">{d.title}</div>
            <div className="mt-2 text-xs text-zinc-500">{d.voteScore} votes · {d.createdAt.toLocaleDateString()}</div>
          </Link>
        ))}
        {!user.discoveries.length && <p className="text-sm text-zinc-500">No discoveries yet.</p>}
      </div>
    </main>
  );
}