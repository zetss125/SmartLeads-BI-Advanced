"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MarketingPanel from "@/components/MarketingPanel";
import { Users, Target, TrendingUp, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/leads");
        const leads = await res.json();
        setStats({
          total: leads.length,
          high: leads.filter((l: any) => l.priority === "High").length,
          medium: leads.filter((l: any) => l.priority === "Medium").length,
          low: leads.filter((l: any) => l.priority === "Low").length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
            </div>

            <MarketingPanel />
          </>
        )}
      </div>
    </Layout>
  );
}
