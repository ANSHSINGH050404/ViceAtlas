"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const result = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (result.error) setError(result.error.message || "Unable to sign in.");
    else window.location.href = "/";
  }

  return <main className="grid min-h-screen place-items-center px-5"><div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111114] p-8">
    <Link href="/" className="text-sm font-black tracking-[.16em]">VICE<span className="text-[#b8ff65]">ATLAS</span></Link>
    <h1 className="mt-8 text-3xl font-black">Welcome back.</h1><p className="mt-2 text-sm text-zinc-500">Sign in to add to the atlas.</p>
    <form onSubmit={submit} className="mt-8 space-y-4">
      <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-[#b8ff65]"/>
      <input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-[#b8ff65]"/>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-[#b8ff65] py-3 font-bold text-black disabled:opacity-50">{busy ? "Signing in..." : "Sign in"}</button>
    </form>
    <div className="mt-6">
      <button onClick={async () => {
        setBusy(true); setError("");
        const result = await authClient.signIn.social({ provider: "google", callbackURL: "/", errorCallbackURL: "/sign-in?error=google" });
        setBusy(false);
        if (result?.error) setError(result.error.message || "Google sign-in failed.");
      }} disabled={busy} className="w-full rounded-xl border border-zinc-700 py-3 font-semibold hover:border-[#b8ff65] hover:text-[#b8ff65] disabled:opacity-50">{busy ? "Redirecting..." : "Continue with Google"}</button>
    </div>
    <p className="mt-6 text-center text-xs text-zinc-500">New here? <Link href="/sign-up" className="text-[#b8ff65]">Create an account</Link></p>
  </div></main>;
}
