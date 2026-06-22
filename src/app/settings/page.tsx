"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Moon, Sun, Bell, Shield, Globe } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const isDark = stored === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Settings
        </h1>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Appearance
            </h2>

            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? "bg-slate-700 text-slate-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {darkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Toggle dark mode interface theme
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  darkMode ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Preferences
            </h2>

            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Notifications
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive alerts when new leads are scored
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Auto-refresh Dashboard
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Automatically refresh lead data every 10 seconds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p>SmartLeads BI v2.0.0</p>
              <p>AI Lead Scoring &amp; Marketing Assistant</p>
              <p>Built with Next.js, Tailwind CSS, and OpenRouter AI</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
