"use client";

import { Star, Clock, Tag, Mail, Smartphone } from "lucide-react";
import { NormalizedLead } from "@/types";

export default function LeadCard({ lead }: { lead: NormalizedLead }) {
  const isHigh = (lead.score || 0) >= 80;
  const isMedium = (lead.score || 0) >= 45 && (lead.score || 0) < 80;

  const scoreColor = isHigh
    ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20"
    : isMedium
    ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20"
    : "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20";

  const badgeColor = isHigh
    ? "bg-emerald-500"
    : isMedium
    ? "bg-amber-500"
    : "bg-rose-500";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700/50">
      <div className={`absolute top-0 right-0 h-1 w-full ${badgeColor}`} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white truncate">
            {lead.name || "Anonymous User"}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <Tag className="h-3 w-3 shrink-0" />{" "}
            {lead.platform || "Social Media"} &bull;{" "}
            {lead.date
              ? new Date(lead.date).toLocaleDateString()
              : "Recent"}
          </p>
        </div>
        <div
          className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-full border ${scoreColor}`}
        >
          <span className="font-bold text-sm">{lead.score}</span>
        </div>
      </div>

      {(lead.email || lead.phone) && (
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          {lead.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {lead.email}
            </span>
          )}
          {lead.phone && (
            <span className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {lead.phone}
            </span>
          )}
        </div>
      )}

      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-4 italic">
        &ldquo;{lead.behavioralSentence}&rdquo;
      </p>

      <div className="flex flex-wrap gap-2">
        {lead.signals?.map((signal, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            <Star className="h-3 w-3 text-emerald-500" />
            {signal}
          </span>
        ))}
        {lead.urgency === "high" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <Clock className="h-3 w-3" />
            High Urgency
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            lead.priority === "High"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              : lead.priority === "Medium"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
          }`}
        >
          {lead.priority} Priority
        </span>
        {lead.contacted && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Contacted
          </span>
        )}
      </div>
    </div>
  );
}
