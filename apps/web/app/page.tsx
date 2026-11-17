import Link from "next/link";
import { ArrowUpRight, Compass, Map, Search, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { DiscoveryMap } from "@/components/discovery-map";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const categoryLabels = {
  LOCATION: "Locations",
  EASTER_EGG: "Easter eggs",
  VEHICLE: "Vehicles",
  COLLECTIBLE: "Collectibles",
  NPC_ENCOUNTER: "NPC encounters",
  MYSTERY: "Mysteries",
  OTHER: "Other"
} as const;

export default async function HomePage() {
  const discoveries = await prisma.discovery.findMany({
    where: { status: { not: "REJECTED" } },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { author: { select: { name: true, username: true } }, _count: { select: { votes: true, comments: true } } }
  }).catch(() => []);

  const markers = discoveries
    .filter((item) => item.latitude !== null && item.longitude !== null)
    .map((item) => ({ id: item.id, title: item.title, latitude: item.latitude!, longitude: item.longitude!, category: item.category }));

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-5 pb-16 md:px-10">
      <header className="flex h-20 items-center justify-between border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#b8ff65] text-black"><Compass size={21} /></span>
          <span className="text-lg font-black tracking-[.16em]">VICE<span className="text-[#b8ff65]">ATLAS</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#explore" className="hover:text-white">Explore</a>
          <a href="#discoveries" className="hover:text-white">Discoveries</a>
          <a href="#about" className="hover:text-white">About</a>
        </nav>
        <Link href="/sign-in" className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold hover:border-[#b8ff65] hover:text-[#b8ff65]">Sign in <ArrowUpRight className="ml-1 inline" size={14}/></Link>
      </header>

      <section className="grid gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:items-center md:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8ff65]/25 bg-[#b8ff65]/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#b8ff65]">
            <span className="size-1.5 rounded-full bg-[#b8ff65]" /> COMMUNITY-POWERED DISCOVERY
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-.055em] md:text-7xl">THE WORLD IS<br/><span className="text-[#b8ff65]">BIGGER</span> THAN<br/>THE STORY.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">A living field guide to the places, mysteries, encounters and details players uncover across Leonida.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#explore" className="rounded-full bg-[#b8ff65] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#d0ff9b]">Explore the atlas <Map className="ml-2 inline" size={16}/></a>
            <Link href="/submit" className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold hover:border-zinc-500">Submit a discovery <ArrowUpRight className="ml-2 inline" size={16}/></Link>
          </div>
          <p className="mt-5 text-xs text-zinc-600">Unofficial fan-made community project. Not affiliated with Rockstar Games.</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-[#b8ff65]/5 blur-2xl"/>
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#111114] p-3">
            <div className="mb-3 flex items-center justify-between px-2 pt-1 text-xs text-zinc-500"><span>LEONIDA / FIELD MAP</span><span className="text-[#b8ff65]">LIVE ATLAS</span></div>
            <DiscoveryMap markers={markers} compact />
            <div className="flex items-center justify-between px-2 py-3 text-xs text-zinc-500"><span>Community intelligence, mapped.</span><span>01 / EXPLORE</span></div>
          </div>
        </div>
      </section>

      <section id="explore" className="scroll-mt-8 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold tracking-[.2em] text-[#b8ff65]">THE ATLAS</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Explore the unknown.</h2></div>
          <span className="hidden text-sm text-zinc-500 sm:block">Community discoveries, not official game data</span>
        </div>
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111114] p-2">
          <DiscoveryMap markers={markers} />
        </div>
      </section>

      <section id="discoveries" className="py-20">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="text-xs font-bold tracking-[.2em] text-[#b8ff65]">INTELLIGENCE FEED</p><h2 className="mt-2 text-3xl font-bold">Recent discoveries</h2></div>
          <Link href="/discoveries" className="text-sm text-zinc-400 hover:text-[#b8ff65]">View all <ArrowUpRight className="ml-1 inline" size={14}/></Link>
        </div>
        {discoveries.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {discoveries.map((item) => (
              <Link key={item.id} href={`/discoveries/${item.slug}`} className="group rounded-2xl border border-zinc-800 bg-[#111114] p-5 transition hover:-translate-y-1 hover:border-[#b8ff65]/40">
                <div className="mb-5 flex items-center justify-between"><span className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">{categoryLabels[item.category]}</span><span className="text-[10px] text-zinc-500">{item.status.replaceAll("_", " ")}</span></div>
                <h3 className="text-lg font-bold group-hover:text-[#b8ff65]">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{item.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-xs text-zinc-500"><span>by {item.author.username ?? item.author.name}</span><span>{item._count.votes} votes · {item._count.comments} comments</span></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
            <Sparkles className="mx-auto mb-4 text-[#b8ff65]" size={25}/>
            <h3 className="text-lg font-bold">The atlas is waiting for its first discoveries.</h3>
            <p className="mt-2 text-sm text-zinc-500">Seed the network with your first community finding.</p>
            <Link href="/sign-in" className="mt-5 inline-block rounded-full bg-[#b8ff65] px-5 py-2.5 text-sm font-bold text-black">Join the network</Link>
          </div>
        )}
      </section>

      <section id="about" className="grid gap-5 border-t border-zinc-800 py-16 md:grid-cols-3">
        <Feature icon={<Search size={20}/>} title="Find the obscure" body="Search discoveries by category, location and community tags."/>
        <Feature icon={<ShieldCheck size={20}/>} title="Verify together" body="Evidence and community review help separate discoveries from speculation."/>
        <Feature icon={<Trophy size={20}/>} title="Earn your place" body="Build a public explorer profile and get credit for what you uncover."/>
      </section>
      <footer className="flex flex-col justify-between gap-3 border-t border-zinc-800 py-7 text-xs text-zinc-600 md:flex-row"><span>© 2026 ViceAtlas · Built by the community.</span><span>Fan-made, unofficial and independent.</span></footer>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-6"><div className="mb-5 grid size-10 place-items-center rounded-xl bg-[#b8ff65]/10 text-[#b8ff65]">{icon}</div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p></div>;
}
