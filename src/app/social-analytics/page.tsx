"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  BarChart3,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Activity,
  RefreshCw,
  Download,
  Link2,
  Loader2,
} from "lucide-react";

interface SocialLead {
  id: string;
  username: string;
  platform: string;
  followers: number;
  engagement: number;
  lastPost: string;
  content: string;
  comments: number;
  likes: number;
}

interface Comment {
  id: string;
  leadId: string;
  user: string;
  text: string;
  timestamp: string;
  sentiment: string;
}

export default function SocialAnalyticsPage() {
  const [data, setData] = useState<{
    followers: number;
    following: number;
    posts: number;
    engagement: number;
    leads: SocialLead[];
    comments: Comment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/social-analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const syncToMain = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/social-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-leads" }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncResult(
          `Successfully synced ${json.count} leads to the main app!`
        );
      } else {
        setSyncResult("Failed to sync leads.");
      }
    } catch {
      setSyncResult("Failed to connect to analytics API.");
    } finally {
      setSyncing(false);
    }
  };

  const generateDataset = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/social-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-dataset",
          params: { count: 15 },
        }),
      });
      const json = await res.json();
      if (json.success && json.dataset) {
        const csv = [
          Object.keys(json.dataset[0]).join(","),
          ...json.dataset.map((r: any) =>
            Object.values(r)
              .map((v) => `"${v}"`)
              .join(",")
          ),
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "social-media-dataset.csv";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      console.error("Failed to generate dataset");
    } finally {
      setGenerating(false);
    }
  };

  const getCommentsForLead = (leadId: string) => {
    return data?.comments.filter((c) => c.leadId === leadId) || [];
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Social Media Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitor social media engagement and sync leads to SmartLeads BI
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateDataset}
              disabled={generating}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl transition-colors font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {generating ? "Generating..." : "Generate Dataset"}
            </button>
            <button
              onClick={syncToMain}
              disabled={syncing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              <Link2 className="h-4 w-4" />
              {syncing ? "Syncing..." : "Sync to Main App"}
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm">
            {syncResult}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {[
            {
              label: "Total Followers",
              value: data?.followers?.toLocaleString() || "0",
              icon: Users,
              color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
            },
            {
              label: "Engagement Rate",
              value: `${data?.engagement || 0}%`,
              icon: Activity,
              color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
            },
            {
              label: "Posts",
              value: data?.posts?.toLocaleString() || "0",
              icon: Share2,
              color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
            },
            {
              label: "Active Leads",
              value: data?.leads?.length?.toString() || "0",
              icon: BarChart3,
              color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Social Media Leads
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {data?.leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors ${
                    selectedLead === lead.id
                      ? "bg-emerald-50 dark:bg-emerald-500/5"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedLead(
                      selectedLead === lead.id ? null : lead.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {lead.username}
                      </p>
                      <p className="text-sm text-slate-500">{lead.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {lead.followers.toLocaleString()} followers
                      </p>
                      <p className="text-xs text-slate-500">
                        {lead.engagement}% eng.
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                    {lead.content}
                  </p>
                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {lead.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {lead.comments}
                    </span>
                  </div>

                  {selectedLead === lead.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Comments
                      </h4>
                      <div className="space-y-3">
                        {getCommentsForLead(lead.id).map((comment) => (
                          <div
                            key={comment.id}
                            className="flex gap-3 text-sm"
                          >
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
                              {comment.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                {comment.user}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400">
                                {comment.text}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    comment.sentiment === "positive"
                                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                      : comment.sentiment === "negative"
                                      ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                      : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                  }`}
                                >
                                  {comment.sentiment}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {new Date(comment.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {getCommentsForLead(lead.id).length === 0 && (
                          <p className="text-sm text-slate-400">
                            No comments for this lead.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <button
                onClick={syncToMain}
                disabled={syncing}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <Link2 className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium text-sm">
                    {syncing ? "Syncing..." : "Connect to Main App"}
                  </p>
                  <p className="text-xs opacity-75">
                    Sync social leads to SmartLeads BI
                  </p>
                </div>
              </button>

              <button
                onClick={generateDataset}
                disabled={generating}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium text-sm">
                    {generating ? "Generating..." : "Generate Dataset"}
                  </p>
                  <p className="text-xs opacity-75">
                    Create sample social media CSV data
                  </p>
                </div>
              </button>

              <button
                onClick={fetchData}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium text-sm">Refresh Data</p>
                  <p className="text-xs opacity-75">
                    Pull latest analytics data
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-500/5 dark:to-blue-500/5 border border-emerald-100 dark:border-emerald-500/10">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Connected to Main App
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use the sync button to transfer social media leads directly to
                SmartLeads BI for AI scoring and marketing strategy generation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
