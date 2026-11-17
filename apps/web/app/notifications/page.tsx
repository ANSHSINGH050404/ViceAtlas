import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) {
    return <main className="mx-auto min-h-screen max-w-3xl px-5 py-12"><p className="text-zinc-400">Sign in to view notifications.</p></main>;
  }
  const notifications = await prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← Back</Link>
      <h1 className="mt-6 text-3xl font-black">Notifications</h1>
      <div className="mt-6 space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className={`rounded-2xl border p-4 ${n.read ? "border-zinc-800" : "border-[#b8ff65]/40"}`}>
            <div className="font-bold">{n.title}</div>
            {n.body && <p className="mt-1 text-sm text-zinc-400">{n.body}</p>}
            <p className="mt-2 text-xs text-zinc-600">{n.createdAt.toLocaleString()}</p>
            {n.link && <Link href={n.link} className="mt-2 inline-block text-xs text-[#b8ff65]">View →</Link>}
          </div>
        ))}
        {!notifications.length && <p className="text-sm text-zinc-500">No notifications yet.</p>}
      </div>
    </main>
  );
}