import { SocialInteraction, PipelineStageResult, PipelineDecision } from "@/types";
import { generateId } from "@/lib/encryption";

// ─── Stage 1: Language Filter ─────────────────────────────────────

function stageLanguageFilter(interaction: SocialInteraction): PipelineStageResult {
  const start = Date.now();
  const text = interaction.text;

  // Simple English detection: check for common English characters and patterns
  const hasLatinChars = /[a-zA-Z]/.test(text);
  const nonLatinRatio = (text.replace(/[a-zA-Z0-9\s.,!?'"@#$%&*()\-:;/\\]/g, "").length) / Math.max(text.length, 1);

  let decision: PipelineDecision = "pass";
  let reason = "English text detected";
  let confidence = 0.9;

  if (!hasLatinChars || nonLatinRatio > 0.5) {
    decision = "filter_out";
    reason = `Non-English content detected (non-Latin character ratio: ${(nonLatinRatio * 100).toFixed(0)}%)`;
    confidence = 0.85;
  }

  return {
    stageName: "Language Filter",
    stageIndex: 0,
    decision,
    reason,
    confidence,
    processingTimeMs: Date.now() - start + Math.random() * 5,
  };
}

// ─── Stage 2: Spam Filter ─────────────────────────────────────────

function stageSpamFilter(interaction: SocialInteraction): PipelineStageResult {
  const start = Date.now();
  const text = interaction.text.toLowerCase();

  const spamPatterns = [
    /(.)\1{5,}/,                          // Repeated characters (aaaaaa)
    /(https?:\/\/\S+\s*){3,}/,            // 3+ URLs
    /🔥{3,}|💰{3,}|🎉{3,}/,              // Excessive emojis
    /\b(free money|click here|win now|guaranteed|act now)\b/i,
    /\b(follow back|f4f|s4s|l4l)\b/i,     // Follow-for-follow spam
  ];

  let decision: PipelineDecision = "pass";
  let reason = "No spam patterns detected";
  let confidence = 0.92;

  for (const pattern of spamPatterns) {
    if (pattern.test(text) || pattern.test(interaction.text)) {
      decision = "filter_out";
      reason = `Spam pattern detected: ${pattern.source.substring(0, 30)}...`;
      confidence = 0.88;
      break;
    }
  }

  // Check for very short messages (< 3 words)
  if (decision === "pass" && text.split(/\s+/).length < 2) {
    decision = "flag_review";
    reason = "Very short message — may lack purchase intent";
    confidence = 0.6;
  }

  return {
    stageName: "Spam Filter",
    stageIndex: 1,
    decision,
    reason,
    confidence,
    processingTimeMs: Date.now() - start + Math.random() * 8,
  };
}

// ─── Stage 3: Intent Classification ──────────────────────────────

interface IntentResult {
  decision: PipelineDecision;
  reason: string;
  confidence: number;
  signals: string[];
  sentimentScore: number;
}

function stageIntentClassification(interaction: SocialInteraction): PipelineStageResult & { intentSignals: string[]; sentimentScore: number } {
  const start = Date.now();
  const text = interaction.text.toLowerCase();

  const intentPatterns: { category: string; keywords: string[]; signal: string }[] = [
    {
      category: "purchase_intent",
      keywords: ["buy", "price", "how much", "where can i get", "in stock", "available", "order", "purchase", "add to cart", "checkout"],
      signal: "Purchase Intent",
    },
    {
      category: "product_interest",
      keywords: ["size", "fit", "color", "when available", "measurements", "sizing", "chart", "guide", "length"],
      signal: "Product Interest",
    },
    {
      category: "restock_demand",
      keywords: ["restock", "sold out", "when back", "out of stock", "bring back", "restocking", "waiting for"],
      signal: "Restock Demand",
    },
    {
      category: "social_engagement",
      keywords: ["love this", "amazing", "want", "need", "obsessed", "gorgeous", "beautiful", "perfect"],
      signal: "Social Engagement",
    },
    {
      category: "complaint",
      keywords: ["broken", "refund", "terrible", "worst", "disappointed", "poor quality", "never again"],
      signal: "Complaint Signal",
    },
  ];

  const detectedSignals: string[] = [];
  let totalMatches = 0;
  let hasComplaint = false;

  for (const pattern of intentPatterns) {
    for (const kw of pattern.keywords) {
      if (text.includes(kw)) {
        if (!detectedSignals.includes(pattern.signal)) {
          detectedSignals.push(pattern.signal);
        }
        totalMatches++;
        if (pattern.category === "complaint") hasComplaint = true;
      }
    }
  }

  // Sentiment scoring (-1 to 1)
  const positiveWords = ["love", "amazing", "great", "perfect", "beautiful", "want", "need", "please", "thank"];
  const negativeWords = ["hate", "terrible", "worst", "broken", "never", "disappointed", "poor", "bad", "refund"];

  let sentimentScore = 0;
  for (const w of positiveWords) {
    if (text.includes(w)) sentimentScore += 0.15;
  }
  for (const w of negativeWords) {
    if (text.includes(w)) sentimentScore -= 0.2;
  }
  sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

  let decision: PipelineDecision = "filter_out";
  let reason = "No purchase intent signals detected";
  let confidence = 0.7;

  if (detectedSignals.length >= 2) {
    decision = "pass";
    reason = `Strong intent: ${detectedSignals.join(", ")}`;
    confidence = 0.95;
  } else if (detectedSignals.length === 1 && !hasComplaint) {
    decision = "pass";
    reason = `Single intent signal: ${detectedSignals[0]}`;
    confidence = 0.78;
  } else if (hasComplaint) {
    decision = "flag_review";
    reason = `Complaint detected — needs human review`;
    confidence = 0.82;
  }

  return {
    stageName: "Intent Classification",
    stageIndex: 2,
    decision,
    reason,
    confidence,
    processingTimeMs: Date.now() - start + Math.random() * 15,
    intentSignals: detectedSignals,
    sentimentScore,
  };
}

// ─── Stage 4: Deduplication ──────────────────────────────────────

const recentConversions = new Map<string, number>(); // key: user+postId, value: timestamp

function stageDeduplication(interaction: SocialInteraction): PipelineStageResult {
  const start = Date.now();
  const key = `${interaction.user}::${interaction.postId}`;
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  let decision: PipelineDecision = "pass";
  let reason = "No duplicate interaction found";
  let confidence = 1.0;

  const lastSeen = recentConversions.get(key);
  if (lastSeen && now - lastSeen < twentyFourHours) {
    decision = "filter_out";
    const minutesAgo = Math.round((now - lastSeen) / 60000);
    reason = `Duplicate: same user+post interaction ${minutesAgo} min ago`;
    confidence = 0.99;
  } else {
    recentConversions.set(key, now);
  }

  // Clean old entries
  for (const [k, v] of recentConversions.entries()) {
    if (now - v > twentyFourHours) recentConversions.delete(k);
  }

  return {
    stageName: "Deduplication",
    stageIndex: 3,
    decision,
    reason,
    confidence,
    processingTimeMs: Date.now() - start + Math.random() * 3,
  };
}

// ─── Full Pipeline Execution ─────────────────────────────────────

export interface PipelineResult {
  interaction: SocialInteraction;
  stages: PipelineStageResult[];
  finalDecision: PipelineDecision;
  intentSignals: string[];
  sentimentScore: number;
  totalProcessingMs: number;
}

export function runPipeline(interaction: SocialInteraction): PipelineResult {
  const stages: PipelineStageResult[] = [];
  let finalDecision: PipelineDecision = "pass";
  let intentSignals: string[] = [];
  let sentimentScore = 0;

  // Stage 1: Language
  const langResult = stageLanguageFilter(interaction);
  stages.push(langResult);
  if (langResult.decision === "filter_out") {
    finalDecision = "filter_out";
    return { interaction, stages, finalDecision, intentSignals, sentimentScore, totalProcessingMs: stages.reduce((s, r) => s + r.processingTimeMs, 0) };
  }

  // Stage 2: Spam
  const spamResult = stageSpamFilter(interaction);
  stages.push(spamResult);
  if (spamResult.decision === "filter_out") {
    finalDecision = "filter_out";
    return { interaction, stages, finalDecision, intentSignals, sentimentScore, totalProcessingMs: stages.reduce((s, r) => s + r.processingTimeMs, 0) };
  }

  // Stage 3: Intent
  const intentResult = stageIntentClassification(interaction);
  stages.push(intentResult);
  intentSignals = intentResult.intentSignals;
  sentimentScore = intentResult.sentimentScore;
  if (intentResult.decision === "filter_out") {
    finalDecision = "filter_out";
    return { interaction, stages, finalDecision, intentSignals, sentimentScore, totalProcessingMs: stages.reduce((s, r) => s + r.processingTimeMs, 0) };
  }

  // Stage 4: Dedup
  const dedupResult = stageDeduplication(interaction);
  stages.push(dedupResult);
  if (dedupResult.decision === "filter_out") {
    finalDecision = "filter_out";
    return { interaction, stages, finalDecision, intentSignals, sentimentScore, totalProcessingMs: stages.reduce((s, r) => s + r.processingTimeMs, 0) };
  }

  // Check for any "flag_review" decisions
  if (stages.some((s) => s.decision === "flag_review")) {
    finalDecision = "flag_review";
  }

  const totalProcessingMs = stages.reduce((s, r) => s + r.processingTimeMs, 0);
  return { interaction, stages, finalDecision, intentSignals, sentimentScore, totalProcessingMs };
}

// ─── Demo Interaction Generator ──────────────────────────────────

const DEMO_INTERACTIONS: Omit<SocialInteraction, "id" | "timestamp">[] = [
  { platform: "Instagram", user: "fashionista_maya", text: "Omg I need this in size M! How much is it?", postId: "post_denim_drop", campaign: "Spring Denim Retargeting" },
  { platform: "TikTok", user: "sneaker_head_99", text: "RESTOCK please! Been waiting for the blue ones to come back!", postId: "post_sneaker_restock", campaign: "Limited Sneaker Restock" },
  { platform: "Facebook", user: "travel_sarah", text: "Does this come in leather? I want to buy one for my trip", postId: "post_weekend_bag", campaign: "Weekend Travel Bag Launch" },
  { platform: "Instagram", user: "bot_spam_42", text: "🔥🔥🔥🔥🔥 FREE MONEY click here win now!!! 💰💰💰", postId: "post_denim_drop", campaign: "Spring Denim Retargeting" },
  { platform: "TikTok", user: "中文用户", text: "这个多少钱？我想买一个", postId: "post_sneaker_restock", campaign: "Limited Sneaker Restock" },
  { platform: "Instagram", user: "casual_liz", text: "cute", postId: "post_denim_drop", campaign: "Spring Denim Retargeting" },
  { platform: "Facebook", user: "angry_karen", text: "This broke after one week, worst quality ever. I want a refund immediately!", postId: "post_weekend_bag", campaign: "Weekend Travel Bag Launch" },
  { platform: "TikTok", user: "fitness_omar", text: "What size chart should I look at? I'm between L and XL. Also, is this available in black?", postId: "post_sneaker_restock", campaign: "Limited Sneaker Restock" },
  { platform: "Instagram", user: "deal_hunter", text: "Love the style! Any discount codes? Is there a sale coming up?", postId: "post_denim_drop", campaign: "Spring Denim Retargeting" },
  { platform: "Facebook", user: "repeat_buyer_jen", text: "I bought the last collection and loved it! When can I order the new one?", postId: "post_weekend_bag", campaign: "Weekend Travel Bag Launch" },
  { platform: "TikTok", user: "style_alex", text: "Added to cart but the shipping is expensive. Can you offer free shipping?", postId: "post_sneaker_restock", campaign: "Limited Sneaker Restock" },
  { platform: "Instagram", user: "review_reader", text: "How do previous buyers rate the quality? Any reviews? Is this a bestseller?", postId: "post_denim_drop", campaign: "Spring Denim Retargeting" },
];

let demoIndex = 0;

export function getNextDemoInteraction(): SocialInteraction {
  const template = DEMO_INTERACTIONS[demoIndex % DEMO_INTERACTIONS.length];
  demoIndex++;

  return {
    ...template,
    id: generateId("social"),
    timestamp: new Date().toISOString(),
  };
}

export function getDemoInteractionBatch(count: number): SocialInteraction[] {
  const batch: SocialInteraction[] = [];
  for (let i = 0; i < count; i++) {
    batch.push(getNextDemoInteraction());
  }
  return batch;
}
