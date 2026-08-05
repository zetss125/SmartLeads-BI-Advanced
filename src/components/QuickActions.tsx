"use client";

import { useState } from "react";
import { Plus, Upload, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";
import ChatbotPanel from "./ChatbotPanel";

export default function QuickActions() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Zap className="h-4 w-4 text-emerald-500" />
          Quick Actions
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link
            href="/upload"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Dataset
          </Link>
          
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Ask AI Assistant
          </button>
          
          <Link
            href="/leads"
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            View All Leads
          </Link>
        </div>
      </div>

      <ChatbotPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
