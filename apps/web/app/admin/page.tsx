"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: string; title: string; category: string; status: string; createdAt: string; author: { username: string | null; name: string }; _count: { votes: number; comments: number; reports: number } };

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/admin/discoveries?status=${status}`);
    if (!res.ok) { setError("Forbidden or error."); return; }
    const data = await res.json();
    setItems(data.data);
    setError("");
  }

  useEffect(() => { load(); }, [status]);

  async function update(id: string, newStatus: string) {
    const res = await fetch("/api/admin/discoveries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
    if (res.ok) load();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12">
      <Link href="/" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← Back</Link>
      <h1 className="mt-6 text-3xl font-black">Moderation queue</h1>
      <div className="mt-4 flex gap-2">
        {["PENDING", "COMMUNITY_CONFIRMED", "VERIFIED", "REJECTED"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${status === s ? "border-[#b8ff65] text-[#b8ff65]" : "border-zinc-800 text-zinc-400"}`}>{s}</button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-zinc-800 bg-[#111114] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">{item.category} · {item._count.reports} reports</div>
                <div className="mt-1 font-bold">{item.title}</div>
                <div className="mt-1 text-xs text-zinc-500">by {item.author.username ?? item.author.name} · {item._count.votes} votes · {item._count.comments} comments</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => update(item.id, "COMMUNITY_CONFIRMED")} className="rounded-xl border border-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300">Confirm</button>
                <button onClick={() => update(item.id, "VERIFIED")} className="rounded-xl border border-[#b8ff65]/40 px-3 py-1.5 text-xs font-bold text-[#b8ff65]">Verify</button>
                <button onClick={() => update(item.id, "REJECTED")} className="rounded-xl border border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-400">Reject</button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && <p className="mt-6 text-sm text-zinc-500">No items.</p>}
      </div>
    </main>
  );
}