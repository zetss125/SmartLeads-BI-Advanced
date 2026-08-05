"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, X, Zap, CheckCircle2, Bell } from "lucide-react";

interface UrgentAlert {
  id: string;
  leadName: string;
  trigger: string;
  recommendedAction: string;
  leadId: string;
  minutesAgo: number;
  timestamp: string;
}

interface SmartLeadsEvent {
  id: string;
  type: string;
  payload: Record<string, any>;
  timestamp: string;
  urgency: "critical" | "high" | "normal";
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<UrgentAlert[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [eventCount, setEventCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleSSEEvent = useCallback((event: SmartLeadsEvent) => {
    setEventCount((c) => c + 1);

    if (event.type === "lead.urgent_alert") {
      const payload = event.payload || {};
      const alert: UrgentAlert = {
        id: event.id,
        leadName: payload.leadName || "Unknown",
        trigger: payload.trigger || "Urgent signal detected",
        recommendedAction: payload.recommendedAction || "Follow up immediately",
        leadId: payload.leadId || "",
        minutesAgo: payload.minutesAgo || 0,
        timestamp: event.timestamp,
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 10));
    }
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/events");
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SmartLeadsEvent;
        handleSSEEvent(data);
      } catch {
        // Ignore parse errors (e.g. heartbeat comments)
      }
    };

    es.onerror = () => {
      // Reconnect handled automatically by EventSource
    };

    return () => {
      es.close();
    };
  }, [handleSSEEvent]);

  const activeAlerts = alerts.filter((a) => !dismissed.has(a.id));

  const dismissAlert = (alertId: string) => {
    setDismissed((prev) => new Set(prev).add(alertId));
  };

  const dismissAll = () => {
    setDismissed(new Set(alerts.map((a) => a.id)));
    setExpanded(false);
  };

  if (activeAlerts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/5 border-b border-emerald-100 dark:border-emerald-500/10">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <div className="relative">
            <Bell className="h-4 w-4" />
            {eventCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-xs font-medium">
            Real-time monitoring active — {eventCount} events tracked
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-red-200 dark:border-red-500/20">
      {/* Alert Header Bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-500/10 dark:to-amber-500/10 hover:from-red-100 hover:to-amber-100 dark:hover:from-red-500/15 dark:hover:to-amber-500/15 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="h-5 w-5 text-red-600 dark:text-red-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">
                {activeAlerts.length}
              </span>
            </span>
          </div>
          <span className="text-sm font-semibold text-red-700 dark:text-red-300">
            {activeAlerts.length} lead{activeAlerts.length !== 1 ? "s" : ""} require
            immediate follow-up
          </span>
          <span className="text-xs text-red-500 dark:text-red-400">
            — cart abandoned / restock requested
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {expanded ? "Collapse" : "Expand"}
          </span>
        </div>
      </button>

      {/* Expanded Alert Details */}
      {expanded && (
        <div className="bg-white dark:bg-slate-800/50 divide-y divide-slate-100 dark:divide-slate-700/50">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {alert.leadName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {alert.trigger}
                    {alert.minutesAgo > 0 && ` — ${alert.minutesAgo} min ago`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 max-w-[200px] truncate hidden sm:block">
                  {alert.recommendedAction}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alert.id);
                  }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Dismiss"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alert.id);
                  }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Close"
                >
                  <X className="h-3 w-3 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={dismissAll}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
            >
              Dismiss all alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
