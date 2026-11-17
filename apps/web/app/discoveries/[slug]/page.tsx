import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DiscoveryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.discovery.findUnique({
    where: { slug },
    include: { author: { select: { name: true, username: true } }, evidence: true, _count: { select: { votes: true, comments: true } } }
  });
  if (!item || item.status === "REJECTED") notFound();

  return <main className="mx-auto min-h-screen max-w-3xl px-5 py-12">
    <Link href="/discoveries" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← All discoveries</Link>
    <div className="mt-12 flex items-center gap-2 text-xs uppercase tracking-wider text-[#b8ff65]">{item.category.replaceAll("_"," ")} <span className="text-zinc-600">/</span><span className="text-zinc-400">{item.status.replaceAll("_"," ")}</span></div>
    <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{item.title}</h1>
    <p className="mt-4 text-sm text-zinc-500">Discovered by {item.author.username ?? item.author.name} · {item.createdAt.toLocaleDateString()}</p>
    <article className="mt-10 whitespace-pre-wrap rounded-3xl border border-zinc-800 bg-[#111114] p-7 text-base leading-8 text-zinc-300">{item.description}</article>
    {(item.region || item.latitude !== null) && <div className="mt-5 rounded-2xl border border-zinc-800 p-5 text-sm text-zinc-400">{item.region && <p>Region: {item.region}</p>}{item.latitude !== null && <p className="mt-1">Coordinates: {item.latitude}, {item.longitude}</p>}</div>}
    <div className="mt-6 flex gap-5 text-sm text-zinc-500"><span>{item._count.votes} community votes</span><span>{item._count.comments} comments</span></div>
    <p className="mt-12 border-t border-zinc-800 pt-6 text-xs text-zinc-600">Unofficial fan-made community content. Verify findings independently; this page is not official game information.</p>
  </main>;
}
