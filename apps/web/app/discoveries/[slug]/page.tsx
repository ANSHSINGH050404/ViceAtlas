import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DiscoveryActions } from "@/components/discovery-actions";

export const dynamic = "force-dynamic";

export default async function DiscoveryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.discovery.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, username: true } },
      evidence: true,
      tags: { include: { tag: true } },
      _count: { select: { votes: true, comments: true, evidence: true } }
    }
  });
  if (!item || item.status === "REJECTED") notFound();

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  let bookmarked = false;
  if (session) {
    const bm = await prisma.bookmark.findUnique({ where: { userId_discoveryId: { userId: session.user.id, discoveryId: item.id } } });
    bookmarked = !!bm;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12">
      <Link href="/discoveries" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← All discoveries</Link>
      <div className="mt-12 flex items-center gap-2 text-xs uppercase tracking-wider text-[#b8ff65]">
        {item.category.replaceAll("_", " ")} <span className="text-zinc-600">/</span><span className="text-zinc-400">{item.status.replaceAll("_", " ")}</span>
      </div>
      <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{item.title}</h1>
      <p className="mt-4 text-sm text-zinc-500">Discovered by {item.author.username ?? item.author.name} · {item.createdAt.toLocaleDateString()}</p>
      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.map((t) => <span key={t.tagId} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">#{t.tag.name}</span>)}
        </div>
      )}
      <article className="mt-10 whitespace-pre-wrap rounded-3xl border border-zinc-800 bg-[#111114] p-7 text-base leading-8 text-zinc-300">{item.description}</article>
      {(item.region || item.latitude !== null) && (
        <div className="mt-5 rounded-2xl border border-zinc-800 p-5 text-sm text-zinc-400">
          {item.region && <p>Region: {item.region}</p>}
          {item.latitude !== null && <p className="mt-1">Coordinates: {item.latitude}, {item.longitude}</p>}
        </div>
      )}
      {item.evidence.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">Evidence</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {item.evidence.map((e) => (
              <a key={e.id} href={e.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-zinc-800 bg-[#111114] p-4 text-sm text-zinc-300 hover:border-[#b8ff65]/40">
                <p className="text-xs uppercase text-zinc-500">{e.type}</p>
                {e.caption && <p className="mt-1">{e.caption}</p>}
                <p className="mt-2 truncate text-[#b8ff65]">{e.url}</p>
              </a>
            ))}
          </div>
        </div>
      )}
      <DiscoveryActions discoveryId={item.id} initialVoteScore={item.voteScore} initialBookmarked={bookmarked} />
      <p className="mt-12 border-t border-zinc-800 pt-6 text-xs text-zinc-600">Unofficial fan-made community content. Verify findings independently; this page is not official game information.</p>
    </main>
  );
}