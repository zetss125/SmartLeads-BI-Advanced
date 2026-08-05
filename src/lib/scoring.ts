import * as path from "path";
import * as fs from "fs";
import { tokenize } from "@/lib/tokenizer";
import { NormalizedLead, FactorScore, ScoringResult } from "@/types";

let ort: any = null;
try {
  ort = require("onnxruntime-node");
} catch {
  // onnxruntime-node binary not available (e.g. Vercel serverless)
}

let session: any = null;

function getModelPath(): string {
  const possiblePaths = [
    path.join(process.cwd(), "backend", "assets", "model.onnx"),
    path.join(process.cwd(), "assets", "model.onnx"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return "";
}

async function runModelInference(tokenIds: number[]): Promise<number> {
  if (!ort) return 50.0;

  const modelPath = getModelPath();
  if (!modelPath) return 50.0;

  try {
    if (!session) {
      session = await ort.InferenceSession.create(modelPath);
    }

    const bigIntIds = new BigInt64Array(tokenIds.map(id => BigInt(id)));
    const inputTensor = new ort.Tensor("int64", bigIntIds, [1, 32]);

    const feeds: Record<string, any> = { input_ids: inputTensor };
    const outputs = await session.run(feeds);
    const scoreTensor = outputs.score;
    const scoreData = scoreTensor.data as Float32Array;
    return scoreData[0];
  } catch {
    return 50.0;
  }
}

// ─── 10-Dimensional Factor Decomposition ──────────────────────────
// Each factor is scientifically grounded in retail purchasing theory.
// Positive factors contribute to purchase likelihood.
// Negative (resistance) factors reduce purchase likelihood.

interface FactorConfig {
  dimension: string;
  label: string;
  weight: number;
  keywords: string[];
  isResistance: boolean;
}

const FACTOR_CONFIG: FactorConfig[] = [
  {
    dimension: "purchase_intent",
    label: "Purchase Intent",
    weight: 0.20,
    keywords: ["cart", "added", "checkout", "buy", "purchase", "order", "payment", "subscribe"],
    isResistance: false,
  },
  {
    dimension: "product_engagement",
    label: "Product Engagement",
    weight: 0.15,
    keywords: ["viewed", "details", "browsed", "clicked", "comparison", "wishlist", "save", "favorite"],
    isResistance: false,
  },
  {
    dimension: "urgency_signals",
    label: "Urgency Signals",
    weight: 0.12,
    keywords: ["restock", "request", "limited", "exclusive", "urgent", "immediate", "now", "hurry", "fast"],
    isResistance: false,
  },
  {
    dimension: "social_proof",
    label: "Social Proof Seeking",
    weight: 0.08,
    keywords: ["review", "rating", "recommend", "popular", "bestseller", "trending", "star", "feedback"],
    isResistance: false,
  },
  {
    dimension: "price_sensitivity",
    label: "Price Sensitivity",
    weight: -0.10,
    keywords: ["discount", "coupon", "sale", "cheap", "price", "expensive", "cost", "deal", "promo"],
    isResistance: true,
  },
  {
    dimension: "quality_resistance",
    label: "Quality Resistance",
    weight: -0.08,
    keywords: ["return", "refund", "complaint", "broken", "defective", "worst", "terrible", "poor"],
    isResistance: true,
  },
  {
    dimension: "brand_affinity",
    label: "Brand Affinity",
    weight: 0.12,
    keywords: ["follow", "loyal", "repeat", "newsletter", "member", "subscribe", "fan", "love"],
    isResistance: false,
  },
  {
    dimension: "recency",
    label: "Recency",
    weight: 0.10,
    keywords: [], // Computed from timestamp, not keywords
    isResistance: false,
  },
  {
    dimension: "channel_strength",
    label: "Channel Strength",
    weight: 0.08,
    keywords: [], // Computed from platform
    isResistance: false,
  },
  {
    dimension: "sizing_fit_interest",
    label: "Sizing & Fit Interest",
    weight: 0.05,
    keywords: ["size", "sizing", "fit", "measurement", "length", "width", "chart", "guide"],
    isResistance: false,
  },
];

// Platform conversion strength scores (based on retail industry data)
const PLATFORM_STRENGTH: Record<string, number> = {
  instagram: 82,
  tiktok: 75,
  facebook: 65,
  linkedin: 58,
  twitter: 50,
  "twitter/x": 50,
  x: 50,
  unknown: 40,
};

function computeRecencyScore(dateStr: string): number {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= 1) return 100;
    if (hoursDiff <= 6) return 90;
    if (hoursDiff <= 24) return 75;
    if (hoursDiff <= 72) return 55;
    if (hoursDiff <= 168) return 35; // 7 days
    return 15;
  } catch {
    return 50; // Unknown date → medium score
  }
}

function computeKeywordScore(text: string, keywords: string[]): { score: number; evidence: string[] } {
  if (keywords.length === 0) return { score: 0, evidence: [] };

  const lower = text.toLowerCase();
  const evidence: string[] = [];
  let matches = 0;

  for (const kw of keywords) {
    if (lower.includes(kw)) {
      matches++;
      evidence.push(kw);
    }
  }

  // Score based on match density (more matches = higher score, with diminishing returns)
  const maxPossible = Math.min(keywords.length, 4); // Cap at 4 for normalization
  const matchRatio = Math.min(matches / maxPossible, 1.0);
  const score = Math.round(matchRatio * 100);

  return { score, evidence };
}

function determineTrend(evidence: string[]): "rising" | "stable" | "declining" {
  // Heuristic based on evidence strength
  if (evidence.length >= 3) return "rising";
  if (evidence.length >= 1) return "stable";
  return "declining";
}

export function computeFactorScores(lead: NormalizedLead): FactorScore[] {
  const sentence = lead.behavioralSentence || "";
  const signalText = (lead.signals || []).join(" ") + " " + sentence;

  return FACTOR_CONFIG.map((config) => {
    let rawValue = 0;
    let evidence: string[] = [];

    if (config.dimension === "recency") {
      rawValue = computeRecencyScore(lead.date);
      evidence = [`Date: ${lead.date}`];
    } else if (config.dimension === "channel_strength") {
      const platform = (lead.platform || "unknown").toLowerCase();
      rawValue = PLATFORM_STRENGTH[platform] || PLATFORM_STRENGTH["unknown"];
      evidence = [`Platform: ${lead.platform}`];
    } else {
      const result = computeKeywordScore(signalText, config.keywords);
      rawValue = result.score;
      evidence = result.evidence.map((e) => `Detected: "${e}"`);
    }

    // Apply urgency boost for urgency_signals dimension
    if (config.dimension === "urgency_signals") {
      if (lead.urgency === "high") {
        rawValue = Math.min(100, rawValue + 40);
        evidence.push("Urgency level: HIGH");
      } else if (lead.urgency === "low") {
        rawValue = Math.max(0, rawValue - 20);
        evidence.push("Urgency level: low");
      }
    }

    const contribution = parseFloat((rawValue * config.weight).toFixed(2));

    return {
      dimension: config.dimension,
      label: config.label,
      rawValue,
      weight: config.weight,
      contribution,
      evidence,
      trend: determineTrend(evidence),
    };
  });
}

function computeFinalScore(factors: FactorScore[], onnxBaseScore: number): ScoringResult {
  // Combine ONNX contextual understanding with factor decomposition
  const factorSum = factors.reduce((sum, f) => sum + f.contribution, 0);

  // ONNX provides 40% weight, factor decomposition provides 60%
  const blendedScore = (onnxBaseScore * 0.4) + (factorSum * 0.6 * 100 / Math.abs(factors.reduce((s, f) => s + Math.abs(f.weight), 0)));

  const finalScore = Math.min(100.0, Math.max(0.0, blendedScore));

  let priority: "High" | "Medium" | "Low" = "Low";
  if (finalScore >= 80.0) priority = "High";
  else if (finalScore >= 45.0) priority = "Medium";

  // Confidence based on how many factors have evidence
  const factorsWithEvidence = factors.filter((f) => f.evidence.length > 0 && f.rawValue > 0).length;
  const confidenceLevel = parseFloat((factorsWithEvidence / factors.length).toFixed(2));

  // Overall trend
  const risingCount = factors.filter((f) => f.trend === "rising").length;
  const decliningCount = factors.filter((f) => f.trend === "declining").length;
  let trendLine: "accelerating" | "steady" | "decelerating" = "steady";
  if (risingCount > decliningCount + 2) trendLine = "accelerating";
  else if (decliningCount > risingCount + 2) trendLine = "decelerating";

  // Recommended action based on score and factors
  let recommendedAction = "Monitor and nurture with content marketing.";
  if (finalScore >= 80) {
    recommendedAction = "Immediate outreach: Send personalized offer or direct contact within 1 hour.";
  } else if (finalScore >= 65) {
    recommendedAction = "High-touch follow-up: Send targeted email or retargeting ad within 4 hours.";
  } else if (finalScore >= 45) {
    recommendedAction = "Nurture sequence: Add to drip campaign with educational content.";
  } else if (finalScore >= 25) {
    recommendedAction = "Awareness: Include in broad marketing campaigns.";
  }

  return {
    finalScore: parseFloat(finalScore.toFixed(1)),
    priority,
    factors,
    trendLine,
    recommendedAction,
    confidenceLevel,
  };
}

export async function scoreLead(lead: NormalizedLead): Promise<NormalizedLead> {
  const tokenIds = tokenize(lead.behavioralSentence);
  const onnxBaseScore = await runModelInference(tokenIds);

  const factors = computeFactorScores(lead);
  const result = computeFinalScore(factors, onnxBaseScore);

  return {
    ...lead,
    score: result.finalScore,
    priority: result.priority,
    scoreBreakdown: result.factors,
    confidenceLevel: result.confidenceLevel,
    trendLine: result.trendLine,
    recommendedAction: result.recommendedAction,
  };
}

export async function scoreBatchLeads(leads: NormalizedLead[]): Promise<NormalizedLead[]> {
  const scoredLeads: NormalizedLead[] = [];
  for (const lead of leads) {
    const scored = await scoreLead(lead);
    scoredLeads.push(scored);
  }
  return scoredLeads;
}

// Re-export for backward compatibility
export function applyBehavioralBoosts(lead: NormalizedLead, baseScore: number): number {
  const factors = computeFactorScores(lead);
  const result = computeFinalScore(factors, baseScore);
  return result.finalScore;
}
