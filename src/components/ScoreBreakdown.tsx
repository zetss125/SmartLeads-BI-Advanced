"use client";

import { FactorScore } from "@/types";

interface Props {
  factors: FactorScore[];
  confidenceLevel?: number;
  trendLine?: string;
  recommendedAction?: string;
}

function getBarColor(factor: FactorScore): string {
  if (factor.weight < 0) {
    // Resistance factor — higher is worse
    if (factor.rawValue >= 60) return "bg-red-500";
    if (factor.rawValue >= 30) return "bg-amber-500";
    return "bg-slate-300 dark:bg-slate-600";
  }
  // Positive factor — higher is better
  if (factor.rawValue >= 70) return "bg-emerald-500";
  if (factor.rawValue >= 40) return "bg-amber-500";
  return "bg-slate-300 dark:bg-slate-600";
}

function getTrendIcon(trend: string): string {
  if (trend === "rising") return "↑";
  if (trend === "declining") return "↓";
  return "→";
}

function getTrendColor(trend: string, isResistance: boolean): string {
  if (isResistance) {
    if (trend === "rising") return "text-red-500";
    if (trend === "declining") return "text-emerald-500";
    return "text-slate-400";
  }
  if (trend === "rising") return "text-emerald-500";
  if (trend === "declining") return "text-red-500";
  return "text-slate-400";
}

export default function ScoreBreakdown({ factors, confidenceLevel, trendLine, recommendedAction }: Props) {
  if (!factors || factors.length === 0) return null;

  const positiveFactors = factors.filter((f) => f.weight >= 0);
  const resistanceFactors = factors.filter((f) => f.weight < 0);

  return (
    <div className="space-y-4">
      {/* Confidence & Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Confidence:
          </span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(confidenceLevel || 0) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
              {Math.round((confidenceLevel || 0) * 100)}%
            </span>
          </div>
        </div>
        {trendLine && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendLine === "accelerating"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                : trendLine === "decelerating"
                ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {trendLine === "accelerating" ? "↑ Accelerating" : trendLine === "decelerating" ? "↓ Decelerating" : "→ Steady"}
          </span>
        )}
      </div>

      {/* Positive Factors */}
      <div>
        <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider">
          Contributing Factors
        </h4>
        <div className="space-y-2">
          {positiveFactors.map((factor) => (
            <div key={factor.dimension} className="group">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {factor.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${getTrendColor(factor.trend, false)}`}
                  >
                    {getTrendIcon(factor.trend)}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {factor.rawValue}
                  <span className="text-[10px] text-slate-400 ml-0.5">
                    ×{factor.weight.toFixed(2)}
                  </span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(factor)}`}
                  style={{ width: `${factor.rawValue}%` }}
                />
              </div>
              {(factor.evidence || []).length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(factor.evidence || []).map((e, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resistance Factors */}
      {resistanceFactors.some((f) => f.rawValue > 0) && (
        <div>
          <h4 className="text-xs font-semibold text-red-500 dark:text-red-400 mb-2 uppercase tracking-wider">
            Resistance Factors
          </h4>
          <div className="space-y-2">
            {resistanceFactors
              .filter((f) => f.rawValue > 0)
              .map((factor) => (
                <div key={factor.dimension} className="group">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {factor.label}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${getTrendColor(factor.trend, true)}`}
                      >
                        {getTrendIcon(factor.trend)}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-red-500 dark:text-red-400">
                      {factor.rawValue}
                      <span className="text-[10px] text-red-400 ml-0.5">
                        ×{factor.weight.toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(factor)}`}
                      style={{ width: `${factor.rawValue}%` }}
                    />
                  </div>
                  {(factor.evidence || []).length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(factor.evidence || []).map((e, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recommended Action */}
      {recommendedAction && (
        <div className="mt-3 p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
            💡 {recommendedAction}
          </p>
        </div>
      )}
    </div>
  );
}
