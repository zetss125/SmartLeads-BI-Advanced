"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MarketingPanel from "@/components/MarketingPanel";
import Link from "next/link";
import { BarChart3, MailCheck, MessageSquareText, ShieldCheck, Users, Target, TrendingUp, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    customers: 0,
    approvals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/live-feed");
        const data = await res.json();
        setStats({
          total: data.stats.total,
          high: data.stats.high,
          medium: data.stats.medium,
          low: data.stats.low,
          customers: data.stats.customers,
          approvals: data.stats.approvals,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Dashboard
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6 mb-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    High Priority
                  </h3>
                </div>
                <p className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.high}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Medium Priority
                  </h3>
                </div>
                <p className="mt-3 text-3xl font-bold text-amber-500 dark:text-amber-400">
                  {stats.medium}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Low Priority
                  </h3>
                </div>
                <p className="mt-3 text-3xl font-bold text-rose-500 dark:text-rose-400">
                  {stats.low}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Leads
                  </h3>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Customers
                  </h3>
                </div>
                <p className="mt-3 text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.customers}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <MailCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Approvals
                  </h3>
                </div>
                <p className="mt-3 text-3xl font-bold text-violet-600 dark:text-violet-400">
                  {stats.approvals}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Link
                href="/live-growth"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-emerald-500/10"
              >
                <span className="font-medium">Live growth graph</span>
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </Link>
              <Link
                href="/approval-simulation"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-cyan-500/10"
              >
                <span className="font-medium">Approval email flow</span>
                <MailCheck className="h-5 w-5 text-cyan-600" />
              </Link>
              <Link
                href="/mock-social"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-violet-500/10"
              >
                <span className="font-medium">Mock social post</span>
                <MessageSquareText className="h-5 w-5 text-violet-600" />
              </Link>
            </div>

            <MarketingPanel />
          </>
        )}
      </div>
    </Layout>
  );
}
