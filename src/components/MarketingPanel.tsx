"use client";

import { useState } from "react";
import { Target, CheckCircle2, ListTodo } from "lucide-react";

export default function MarketingPanel() {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignTasks: true }),
      });
      const data = await response.json();
      setStrategy(data.strategy);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI Marketing Strategy
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Automated strategies based on lead behavior
            </p>
          </div>
        </div>
        {!strategy && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        )}
      </div>

      {strategy ? (
        <div className="space-y-6">
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
            {strategy.split("\n").map((line, i) => (
              <p key={i} className="mb-1">
                {line || "\u00A0"}
              </p>
            ))}
          </div>

          {tasks.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-emerald-500" />
                Action Items
              </h3>
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                  >
                    <button onClick={() => toggleTask(task.id)} className="shrink-0">
                      <CheckCircle2
                        className={`h-5 w-5 transition-colors ${
                          completedTasks.has(task.id)
                            ? "text-emerald-500"
                            : "text-slate-300 dark:text-slate-600 hover:text-emerald-500"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm ${
                        completedTasks.has(task.id)
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-medium">{task.assignee}: </span>
                      {task.title}
                    </span>
                    <span
                      className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                        task.priority === "High"
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                          : task.priority === "Medium"
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => {
              setStrategy(null);
              setTasks([]);
              setCompletedTasks(new Set());
            }}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Generate New Strategy
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <Target className="h-6 w-6 text-slate-400 dark:text-slate-300" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click &quot;Generate Plan&quot; to create a targeted marketing
            strategy based on your current lead pool.
          </p>
        </div>
      )}
    </div>
  );
}
