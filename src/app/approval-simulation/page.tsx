"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { ArrowLeft, CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";
import { LeadApproval } from "@/types";

const initialForm = {
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  platform: "Instagram",
  source: "Email consent request",
  campaign: "Spring Denim Retargeting",
  consentPersonalInfo: true,
  consentSocialAnalytics: true,
};

export default function ApprovalSimulationPage() {
  const [step, setStep] = useState<"email" | "form" | "confirmed">("email");
  const [form, setForm] = useState(initialForm);
  const [approvals, setApprovals] = useState<LeadApproval[]>([]);
  const [latestApproval, setLatestApproval] = useState<LeadApproval | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = async () => {
    try {
      const res = await fetch("/api/approvals");
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch {
      setApprovals([]);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 5000);
    return () => clearInterval(interval);
  }, []);

  const submitApproval = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setLatestApproval(data.approval);
        setStep("confirmed");
        await fetchApprovals();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Approval Email Simulation</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            A mock consent request flow that adds an approved lead to the live system.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
            {step === "email" && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-cyan-100 p-2 dark:bg-cyan-900/30">
                    <Mail className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">Mock email request</h2>
                    <p className="text-sm text-slate-500">From SmartLeads BI Consent Desk</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Subject: Please approve your data sharing request</p>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Hi Jordan, you interacted with our Spring Denim campaign. Please approve whether we can use your personal information and social media engagement details for follow-up, analytics, and customer support.
                  </p>
                  <button
                    onClick={() => setStep("form")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-700"
                  >
                    <Send className="h-4 w-4" />
                    Open approval form
                  </button>
                </div>
              </div>
            )}

            {step === "form" && (
              <form onSubmit={submitApproval} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Personal information approval form</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["name", "Full name"],
                    ["email", "Email"],
                    ["platform", "Social platform"],
                    ["campaign", "Campaign"],
                  ].map(([key, label]) => (
                    <label key={key} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {label}
                      <input
                        value={form[key as keyof typeof form] as string}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                      />
                    </label>
                  ))}
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.consentPersonalInfo}
                    onChange={(e) => setForm({ ...form, consentPersonalInfo: e.target.checked })}
                    className="mt-1"
                  />
                  I approve sharing my personal information for campaign follow-up.
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.consentSocialAnalytics}
                    onChange={(e) => setForm({ ...form, consentSocialAnalytics: e.target.checked })}
                    className="mt-1"
                  />
                  I approve using my social media interaction for analytics and lead scoring.
                </label>
                <button
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit approval"}
                </button>
              </form>
            )}

            {step === "confirmed" && latestApproval && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Confirmation email sent</h2>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {latestApproval.confirmationContent}
                </div>
                <button
                  onClick={() => {
                    setStep("email");
                    setLatestApproval(null);
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Run simulation again
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Live approval requests</h2>
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div key={approval.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900 dark:text-white">{approval.name}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {approval.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{approval.email}</p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{approval.requestContent}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(approval.submittedAt).toLocaleString()}</p>
                </div>
              ))}
              {approvals.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No approval requests have been submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
