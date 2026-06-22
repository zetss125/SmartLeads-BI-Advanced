"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import LeadCard from "@/components/LeadCard";
import { Upload, Search, Loader2, Download } from "lucide-react";
import Link from "next/link";
import { NormalizedLead } from "@/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<NormalizedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<NormalizedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data);
      setFilteredLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    let filtered = [...leads];
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.email?.toLowerCase().includes(search.toLowerCase()) ||
          l.platform.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (priorityFilter) {
      filtered = filtered.filter(
        (l) => l.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    setFilteredLeads(filtered);
  }, [search, priorityFilter, leads]);

  const exportCSV = () => {
    const headers = [
      "Name", "Email", "Phone", "Platform", "Score",
      "Priority", "Urgency", "Signals", "Date", "Contacted",
    ];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.platform,
      l.score?.toString() || "",
      l.priority || "",
      l.urgency,
      l.signals.join("; "),
      l.date,
      l.contacted ? "Yes" : "No",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Leads Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Upload, analyze, and manage your leads
            </p>
          </div>
          <div className="flex gap-3">
            {filteredLeads.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl transition-colors font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            )}
            <Link
              href="/upload"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-medium"
            >
              <Upload className="h-4 w-4" />
              Upload Dataset
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, platform..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {["", "High", "Medium", "Low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    priorityFilter === p
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {p || "All"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Loading leads...
              </p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                <Upload className="h-6 w-6 text-slate-400 dark:text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No leads found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                {search || priorityFilter
                  ? "No leads match your current filters."
                  : "Upload a social media dataset to start generating AI scored leads automatically."}
              </p>
              {!search && !priorityFilter && (
                <Link
                  href="/upload"
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  Upload your first dataset
                </Link>
              )}
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-900/20">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id || Math.random()} lead={lead} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
