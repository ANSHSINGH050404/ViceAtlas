"use client";

import { useEffect, useState } from "react";

type Props = {
  discoveryId: string;
  initialVoteScore: number;
  initialBookmarked: boolean;
};

export function DiscoveryActions({ discoveryId, initialVoteScore, initialBookmarked }: Props) {
  const [voteScore, setVoteScore] = useState(initialVoteScore);
  const [userVote, setUserVote] = useState(0);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [comments, setComments] = useState<{ id: string; body: string; createdAt: string; user: { name: string | null; username: string | null } }[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);

  async function vote(value: 1 | -1) {
    setLoading(true);
    const res = await fetch(`/api/discoveries/${discoveryId}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) });
    if (res.ok) {
      const data = await res.json();
      setVoteScore(data.voteScore);
      setUserVote(data.userVote);
    }
    setLoading(false);
  }

  async function toggleBookmark() {
    const res = await fetch(`/api/discoveries/${discoveryId}/bookmark`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setBookmarked(data.bookmarked);
    }
  }

  async function loadComments() {
    const res = await fetch(`/api/discoveries/${discoveryId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.data);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    const res = await fetch(`/api/discoveries/${discoveryId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: commentBody }) });
    if (res.ok) {
      setCommentBody("");
      loadComments();
    } else if (res.status === 401) {
      alert("Sign in to comment.");
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/discoveries/${discoveryId}/report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: reportReason }) });
    if (res.ok) {
      setShowReport(false);
      setReportReason("");
      alert("Report submitted.");
    }
  }

  useEffect(() => { loadComments(); }, [discoveryId]);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={loading} onClick={() => vote(1)} className={`rounded-xl border px-4 py-2 text-sm font-bold ${userVote === 1 ? "border-[#b8ff65] text-[#b8ff65]" : "border-zinc-800 text-zinc-300"}`}>▲ Upvote</button>
        <span className="text-sm text-zinc-400">{voteScore} votes</span>
        <button disabled={loading} onClick={() => vote(-1)} className={`rounded-xl border px-4 py-2 text-sm font-bold ${userVote === -1 ? "border-red-400 text-red-400" : "border-zinc-800 text-zinc-300"}`}>▼ Downvote</button>
        <button onClick={toggleBookmark} className={`rounded-xl border px-4 py-2 text-sm font-bold ${bookmarked ? "border-[#b8ff65] text-[#b8ff65]" : "border-zinc-800 text-zinc-300"}`}>{bookmarked ? "★ Saved" : "☆ Save"}</button>
        <button onClick={() => setShowReport(!showReport)} className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-bold text-zinc-300">Report</button>
      </div>

      {showReport && (
        <form onSubmit={submitReport} className="rounded-2xl border border-zinc-800 bg-[#111114] p-4">
          <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Reason for report..." className="w-full rounded-xl border border-zinc-800 bg-[#09090b] p-3 text-sm text-white" rows={3} />
          <button type="submit" className="mt-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white">Submit report</button>
        </form>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-5">
        <h3 className="font-bold">Comments ({comments.length})</h3>
        <form onSubmit={submitComment} className="mt-3 flex gap-2">
          <input value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Add a comment..." className="flex-1 rounded-xl border border-zinc-800 bg-[#09090b] px-3 py-2 text-sm text-white" />
          <button type="submit" className="rounded-xl bg-[#b8ff65] px-4 py-2 text-sm font-bold text-black">Post</button>
        </form>
        <div className="mt-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-zinc-800 p-3 text-sm">
              <p className="text-xs text-zinc-500">{c.user.username ?? c.user.name} · {new Date(c.createdAt).toLocaleDateString()}</p>
              <p className="mt-1 text-zinc-300">{c.body}</p>
            </div>
          ))}
          {!comments.length && <p className="mt-3 text-sm text-zinc-500">No comments yet.</p>}
        </div>
      </div>
    </div>
  );
}