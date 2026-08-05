"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { ArrowLeft, Heart, Loader2, MessageCircle, Send, UserPlus } from "lucide-react";
import { NormalizedLead, SocialPost } from "@/types";

export default function MockSocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [liveTotal, setLiveTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({
    postId: "post_denim_drop",
    user: "casey_live",
    email: "casey.live@example.com",
    text: "Please send the size chart and product link.",
  });
  const [createdLead, setCreatedLead] = useState<NormalizedLead | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch("/api/mock-social");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  const fetchLiveTotal = async () => {
    try {
      const res = await fetch("/api/live-feed");
      const data = await res.json();
      setLiveTotal(typeof data?.stats?.total === "number" ? data.stats.total : 0);
    } catch {
      setLiveTotal(0);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchLiveTotal();
    const interval = setInterval(fetchLiveTotal, 5000);
    return () => clearInterval(interval);
  }, []);

  const submitReply = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/mock-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reply),
      });
      const data = await res.json();
      if (data?.success && data?.lead) {
        setCreatedLead(data.lead);
        await fetchPosts();
        await fetchLiveTotal();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mock Social Media Page</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Reply under a marketed post and the response becomes a live scored lead.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Main app live leads</p>
            <p className="text-2xl font-bold text-emerald-600">{liveTotal}</p>
          </div>
        </div>

        {createdLead && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            {createdLead.name} was added to Leads Management with a score of {createdLead.score} and {createdLead.priority} priority.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 grid gap-6 lg:grid-cols-2">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
                  <img src={post.imageUrl} alt={post.campaign} className="h-64 w-full object-cover" />
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{post.brand}</p>
                        <p className="text-sm text-slate-500">{post.platform} · {post.campaign}</p>
                      </div>
                      <button
                        onClick={() => setReply({ ...reply, postId: post.id })}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                          reply.postId === post.id
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Select
                      </button>
                    </div>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{post.caption}</p>
                    <div className="mt-4 flex gap-5 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{post.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{(post.comments || []).length}</span>
                    </div>
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-700/50">
                      {(post.comments || []).slice(-3).map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{comment.user}</p>
                          <p className="text-slate-500 dark:text-slate-400">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <form onSubmit={submitReply} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
                  <UserPlus className="h-5 w-5 text-violet-600" />
                </div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Reply as a lead</h2>
              </div>
              <label className="mb-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Social username
                <input
                  value={reply.user}
                  onChange={(e) => setReply({ ...reply, user: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </label>
              <label className="mb-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
                <input
                  value={reply.email}
                  onChange={(e) => setReply({ ...reply, email: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </label>
              <label className="mb-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Comment
                <textarea
                  value={reply.text}
                  onChange={(e) => setReply({ ...reply, text: e.target.value })}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </label>
              <button
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Posting..." : "Post reply and create lead"}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
