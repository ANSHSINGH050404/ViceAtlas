import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DiscoveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const category = sp.category;
  const tag = sp.tag;
  const sort = sp.sort || "newest";

  const orderBy =
    sort === "top" ? { voteScore: "desc" as const } :
    sort === "discussed" ? { comments: { _count: "desc" as const } } :
    { createdAt: "desc" as const };

  const items = await prisma.discovery.findMany({
    where: {
      status: { not: "REJECTED" },
      ...(category ? { category: category as never } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {})
    },
    orderBy,
    take: 60,
    include: {
      author: { select: { name: true, username: true } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, comments: true, evidence: true } }
    }
  }).catch(() => []);

  const categories = ["LOCATION", "EASTER_EGG", "VEHICLE", "COLLECTIBLE", "NPC_ENCOUNTER", "MYSTERY", "OTHER"];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-12">
      <Link href="/" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← ViceAtlas</Link>
      <p className="mt-10 text-xs font-bold tracking-[.2em] text-[#b8ff65]">FIELD INTELLIGENCE</p>
      <h1 className="mt-2 text-4xl font-black">All discoveries</h1>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input name="q" defaultValue={q} placeholder="Search discoveries..." className="rounded-xl border border-zinc-800 bg-[#111114] px-4 py-2 text-sm text-white outline-none focus:border-[#b8ff65]/60" />
        <select name="category" defaultValue={category || ""} className="rounded-xl border border-zinc-800 bg-[#111114] px-4 py-2 text-sm text-white">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c.replaceAll("_", " ")}</option>)}
        </select>
        <select name="sort" defaultValue={sort} className="rounded-xl border border-zinc-800 bg-[#111114] px-4 py-2 text-sm text-white">
          <option value="newest">Newest</option>
          <option value="top">Top voted</option>
          <option value="discussed">Most discussed</option>
        </select>
        <button type="submit" className="rounded-xl bg-[#b8ff65] px-4 py-2 text-sm font-bold text-black">Filter</button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id} href={`/discoveries/${item.slug}`} className="rounded-2xl border border-zinc-800 bg-[#111114] p-5 hover:border-[#b8ff65]/40">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
              <span>{item.category.replaceAll("_", " ")}</span>
              <span>{item.status.replaceAll("_", " ")}</span>
            </div>
            <h2 className="mt-4 font-bold">{item.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">{item.description}</p>
            {item.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tags.map((t) => <span key={t.tagId} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">#{t.tag.name}</span>)}
              </div>
            )}
            <p className="mt-5 text-xs text-zinc-500">by {item.author.username ? <Link href={`/users/${item.author.username}`} className="hover:text-[#b8ff65]">{item.author.username}</Link> : item.author.name} · {item.voteScore} votes · {item._count.comments} comments</p>
          </Link>
        ))}
      </div>
      {!items.length && <p className="mt-8 text-zinc-500">No discoveries yet. Be the first to contribute.</p>}
    </main>
  );
}