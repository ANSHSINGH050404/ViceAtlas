"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NotificationsBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.ok ? r.json() : null).then((d) => { if (d) setUnread(d.unread); }).catch(() => {});
    const t = setInterval(() => {
      fetch("/api/notifications").then((r) => r.ok ? r.json() : null).then((d) => { if (d) setUnread(d.unread); }).catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <Link href="/notifications" className="fixed right-4 top-4 z-50 rounded-full border border-zinc-800 bg-[#111114] px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-[#b8ff65]/40">
      🔔 {unread > 0 ? unread : ""}
    </Link>
  );
}