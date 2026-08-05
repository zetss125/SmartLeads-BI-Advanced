"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { ArrowLeft, BarChart3, Loader2, Users } from "lucide-react";
import { LiveEvent, LiveHistoryPoint } from "@/types";

export default function LiveGrowthPage() {
  const [history, setHistory] = useState<LiveHistoryPoint[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [stats, setStats] = useState({ total: 0, customers: 0, approvals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const res = await fetch("/api/live-feed");
        const data = await res.json();
        setHistory(Array.isArray(data?.history) ? data.history : []);
        setEvents(Array.isArray(data?.events) ? data.events : []);
        const s = data?.stats && typeof data.stats === "object" ? data.stats : {};
        setStats({
          total: typeof s.total === "number" ? s.total : 0,
          customers: typeof s.customers === "number" ? s.customers : 0,
          approvals: typeof s.approvals === "number" ? s.approvals : 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 3500);
    return () => clearInterval(interval);
  }, []);

  const chart = useMemo(() => {
    const points = history.length > 1 ? history : [
      { timestamp: new Date().toISOString(), totalLeads: stats.total, customers: stats.customers, approvals: stats.approvals },
    ];
    const maxValue = Math.max(1, ...points.flatMap((p) => [p.totalLeads, p.customers]));
    const width = 720;
    const height = 260;
    const padding = 26;

    const toPoint = (value: number, index: number) => {
      const x = padding + (index / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    };

    return {
      width,
      height,
      leadLine: points.map((p, index) => toPoint(p.totalLeads, index)).join(" "),
      customerLine: points.map((p, index) => toPoint(p.customers, index)).join(" "),
    };
  }, [history, stats]);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Lead Growth</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              A live mock graph of leads and customers increasing across the app.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Leads</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Customers</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.customers}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500">Approvals</p>
              <p className="text-2xl font-bold text-violet-600">{stats.approvals}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Live acquisition graph</h2>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />Leads</span>
                  <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-cyan-500" />Customers</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl bg-slate-50 p-4 dark:bg-slate-900/40">
                <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[320px] w-full">
                  <defs>
                    <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((line) => (
                    <line
                      key={line}
                      x1="26"
                      x2="694"
                      y1={26 + line * 62}
                      y2={26 + line * 62}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="1"
                    />
                  ))}
                  <polyline points={chart.leadLine} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={chart.customerLine} fill="none" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-cyan-100 p-2 dark:bg-cyan-900/30">
                  <Users className="h-5 w-5 text-cyan-600" />
                </div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Recent live activity</h2>
              </div>
              <div className="space-y-4">
                {events.slice(0, 8).map((event) => (
                  <div key={event.id} className="border-l-2 border-emerald-400 pl-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{event.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
