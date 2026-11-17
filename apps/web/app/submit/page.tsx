"use client";

import Link from "next/link";
import { useState } from "react";

const categories = [
  ["LOCATION", "Hidden location"], ["EASTER_EGG", "Easter egg"], ["VEHICLE", "Vehicle"],
  ["COLLECTIBLE", "Collectible"], ["NPC_ENCOUNTER", "NPC encounter"], ["MYSTERY", "Mystery"], ["OTHER", "Other"]
];

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("MYSTERY");
  const [region, setRegion] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const payload = { title, description, category, region: region || undefined,
      ...(latitude && longitude ? { latitude: Number(latitude), longitude: Number(longitude) } : {}) };
    const response = await fetch("/api/discoveries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setError(result.error || "Unable to submit."); return; }
    window.location.href = `/discoveries/${result.data.slug}`;
  }

  return <main className="mx-auto min-h-screen max-w-2xl px-5 py-12">
    <Link href="/" className="text-sm text-zinc-400 hover:text-[#b8ff65]">← Back to ViceAtlas</Link>
    <p className="mt-10 text-xs font-bold tracking-[.2em] text-[#b8ff65]">CONTRIBUTE TO THE ATLAS</p>
    <h1 className="mt-2 text-4xl font-black">Submit a discovery.</h1>
    <p className="mt-3 text-sm leading-6 text-zinc-500">Share what you found. Include enough detail for another player to investigate it. Do not upload copyrighted game files or material you do not have permission to share.</p>
    <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-zinc-800 bg-[#111114] p-6">
      <Field label="Discovery title"><input required minLength={5} maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Strange lights beneath the pier" className="field"/></Field>
      <Field label="Category"><select value={category} onChange={e=>setCategory(e.target.value)} className="field">{categories.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>
      <Field label="What did you find?"><textarea required minLength={20} maxLength={3000} rows={6} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe what happened, where you found it and how someone else can reproduce it..." className="field resize-y"/></Field>
      <Field label="Region (optional)"><input value={region} onChange={e=>setRegion(e.target.value)} placeholder="e.g. Vice City" className="field"/></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude (optional)"><input type="number" step="any" value={latitude} onChange={e=>setLatitude(e.target.value)} placeholder="25.77" className="field"/></Field>
        <Field label="Longitude (optional)"><input type="number" step="any" value={longitude} onChange={e=>setLongitude(e.target.value)} placeholder="-80.19" className="field"/></Field>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-[#b8ff65] py-3 font-bold text-black disabled:opacity-50">{busy ? "Submitting..." : "Submit discovery"}</button>
    </form>
    <style jsx>{`.field{width:100%;border:1px solid #3f3f46;background:#09090b;border-radius:12px;padding:12px 14px;color:#f4f4f5;outline:none}.field:focus{border-color:#b8ff65}`}</style>
  </main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-zinc-300">{label}</span>{children}</label>;
}
