import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DiscoveriesPage() {
  const items = await prisma.discovery.findMany({
    where: { status: { not: "REJECTED" } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { name: true, username: true } }, _count: { select: { votes: true, comments: true } } }
  }).catch(() => []);

  return <main className="mx-auto min-h-screen max-w-6xl px-5 py-12">
    <Link href="/" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← ViceAtlas</Link>
    <p className="mt-10 text-xs font-bold tracking-[.2em] text-[#b8ff65]">FIELD INTELLIGENCE</p>
    <h1 className="mt-2 text-4xl font-black">All discoveries</h1>
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(item=><Link key={item.id} href={`/discoveries/${item.slug}`} className="rounded-2xl border border-zinc-800 bg-[#111114] p-5 hover:border-[#b8ff65]/40">
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-500"><span>{item.category.replaceAll("_"," ")}</span><span>{item.status.replaceAll("_"," ")}</span></div>
        <h2 className="mt-4 font-bold">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">{item.description}</p>
        <p className="mt-5 text-xs text-zinc-500">by {item.author.username ?? item.author.name} · {item._count.votes} votes</p>
      </Link>)}
    </div>
    {!items.length && <p className="mt-8 text-zinc-500">No discoveries yet. Be the first to contribute.</p>}
  </main>;
}
