"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { getNextDemoInteraction, runPipeline, PipelineResult } from "@/lib/socialPipeline";
import { SocialInteraction } from "@/types";
import { Play, Square, Settings, CheckCircle, XCircle, AlertTriangle, ArrowRight, Activity, Filter, Brain, CopyCheck } from "lucide-react";

export default function SocialPipelinePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PipelineResult[]>([]);
  const [speedMs, setSpeedMs] = useState(2500); // 2.5s between interactions
  
  const metrics = {
    total: results.length,
    passed: results.filter(r => r.finalDecision === "pass").length,
    filtered: results.filter(r => r.finalDecision === "filter_out").length,
    flagged: results.filter(r => r.finalDecision === "flag_review").length,
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        const interaction = getNextDemoInteraction();
        const result = runPipeline(interaction);
        setResults(prev => [result, ...prev].slice(0, 50));
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, speedMs]);

  const toggleRunning = () => setIsRunning(!isRunning);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Social Ingestion Pipeline
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Live visualization of the 4-stage NLP filtering and scoring engine.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4 text-sm text-slate-600 dark:text-slate-300">
              <label>Speed:</label>
              <select 
                value={speedMs} 
                onChange={e => setSpeedMs(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1"
                disabled={isRunning}
              >
                <option value={5000}>Slow (5s)</option>
                <option value={2500}>Normal (2.5s)</option>
                <option value={1000}>Fast (1s)</option>
                <option value={200}>Max (200ms)</option>
              </select>
            </div>
            <button
              onClick={toggleRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium text-white ${
                isRunning ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Stop Pipeline" : "Start Ingestion"}
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" /> Total Processed
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.total}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Passed (Leads Created)
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{metrics.passed}</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl border border-rose-100 dark:border-rose-500/20">
            <div className="text-rose-700 dark:text-rose-400 text-sm font-medium mb-1 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Filtered Out
            </div>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{metrics.filtered}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
            <div className="text-amber-700 dark:text-amber-400 text-sm font-medium mb-1 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Flagged for Review
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{metrics.flagged}</div>
          </div>
        </div>

        {/* Pipeline Diagram */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
          <StageIcon icon={Filter} name="1. Language" />
          <ArrowRight className="text-slate-300 dark:text-slate-600" />
          <StageIcon icon={Settings} name="2. Spam" />
          <ArrowRight className="text-slate-300 dark:text-slate-600" />
          <StageIcon icon={Brain} name="3. Intent NLP" />
          <ArrowRight className="text-slate-300 dark:text-slate-600" />
          <StageIcon icon={CopyCheck} name="4. Deduplication" />
        </div>

        {/* Live Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            Live Ingestion Feed
          </h2>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden min-h-[400px]">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p>Pipeline is idle. Click "Start Ingestion" to begin.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {results.map((result, idx) => (
                  <PipelineResultCard key={result.interaction.id} result={result} isNew={idx === 0 && isRunning} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StageIcon({ icon: Icon, name }: { icon: any, name: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-12 w-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      </div>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{name}</span>
    </div>
  );
}

function PipelineResultCard({ result, isNew }: { result: PipelineResult, isNew: boolean }) {
  const { interaction, stages, finalDecision, intentSignals, sentimentScore, totalProcessingMs } = result;
  
  const statusColors = {
    pass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    filter_out: "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20",
    flag_review: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",
  };

  const statusIcons = {
    pass: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    filter_out: <XCircle className="h-5 w-5 text-rose-500" />,
    flag_review: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  };

  return (
    <div className={`p-4 transition-all duration-500 ${isNew ? "bg-blue-50/50 dark:bg-blue-500/5" : ""}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Interaction Source */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {interaction.platform}
            </span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              @{interaction.user}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(interaction.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 italic">
            "{interaction.text}"
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span>Post: {interaction.postId.replace("post_", "")}</span>
            <span>{totalProcessingMs.toFixed(1)}ms proc.</span>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="flex-[1.5] flex gap-2">
          {stages.map((stage) => (
            <div 
              key={stage.stageName}
              className={`flex-1 flex flex-col p-2 rounded border ${
                stage.decision === "pass" 
                  ? "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700" 
                  : stage.decision === "filter_out"
                  ? "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30"
                  : "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                {stage.stageName}
              </span>
              <div className="flex items-center gap-1 mb-1">
                {stage.decision === "pass" ? (
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                ) : stage.decision === "filter_out" ? (
                  <XCircle className="h-3 w-3 text-rose-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
                <span className="text-xs font-medium truncate">
                  {Math.round(stage.confidence * 100)}% conf.
                </span>
              </div>
              <span className="text-[10px] leading-tight text-slate-600 dark:text-slate-400 line-clamp-2" title={stage.reason}>
                {stage.reason}
              </span>
            </div>
          ))}
          
          {/* Pad missing stages if filtered early */}
          {Array.from({ length: 4 - stages.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 flex flex-col p-2 rounded border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 opacity-50 justify-center items-center">
              <span className="text-xs text-slate-400">—</span>
            </div>
          ))}
        </div>

        {/* Final Decision */}
        <div className={`w-48 p-3 rounded-lg border flex flex-col justify-center ${statusColors[finalDecision]}`}>
          <div className="flex items-center gap-2 mb-2">
            {statusIcons[finalDecision]}
            <span className="font-semibold text-sm">
              {finalDecision === "pass" ? "Lead Created" : finalDecision === "filter_out" ? "Discarded" : "Needs Review"}
            </span>
          </div>
          
          {finalDecision === "pass" && (
            <div className="space-y-1">
              {intentSignals.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {intentSignals.map((s, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/50 dark:bg-black/20 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {sentimentScore !== 0 && (
                <div className="text-[10px] font-medium">
                  Sentiment: {sentimentScore > 0 ? "+" : ""}{sentimentScore.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
