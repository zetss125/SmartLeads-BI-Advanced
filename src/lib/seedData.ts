import { addLeads, getLeads } from "@/store";
import { NormalizedLead } from "@/types";
import { generateId } from "@/lib/encryption";
import { computeFactorScores } from "@/lib/scoring";

export async function ensureDemoData() {
  const existing = getLeads();
  if (existing.length > 0) return; // Already seeded

  const demoLeads: NormalizedLead[] = [
    {
      name: "Emma Thompson",
      email: "emma.t@example.com",
      phone: "+1 (555) 019-2834",
      platform: "Instagram",
      signals: ["Added to Cart", "Viewed Size Guide"],
      urgency: "high",
      date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      behavioralSentence: "Added to cart; Viewed size guide; HIGH urgency",
    },
    {
      name: "Marcus Chen",
      email: "m.chen@example.com",
      phone: "",
      platform: "TikTok",
      signals: ["Requested Restock Notification", "Liked 5 posts"],
      urgency: "high",
      date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      behavioralSentence: "Requested restock notification; Liked 5 posts; HIGH urgency",
    },
    {
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      phone: "+1 (555) 837-1922",
      platform: "Facebook",
      signals: ["Asked about shipping times", "Saved to wishlist"],
      urgency: "medium",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      behavioralSentence: "Asked about shipping times; Saved to wishlist; Medium urgency",
    },
    {
      name: "David Garcia",
      email: "david.g@example.com",
      phone: "",
      platform: "Twitter",
      signals: ["Complained about previous order quality"],
      urgency: "low",
      date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      behavioralSentence: "Complained about previous order quality; Low urgency",
    },
    {
      name: "Jessica Lee",
      email: "jess.lee99@example.com",
      phone: "+1 (555) 234-5678",
      platform: "Instagram",
      signals: ["Viewed checkout page", "Used discount code"],
      urgency: "medium",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      behavioralSentence: "Viewed checkout page; Used discount code; Medium urgency",
    }
  ];

  // Pre-score the demo leads so the dashboard looks complete immediately
  const scoredLeads = demoLeads.map(lead => {
    const factors = computeFactorScores(lead);
    
    // Simulate ONNX base score for demo
    let baseScore = 50;
    if (lead.urgency === "high") baseScore += 20;
    if (lead.signals.includes("Complained about previous order quality")) baseScore -= 30;

    const factorSum = factors.reduce((sum, f) => sum + f.contribution, 0);
    const blendedScore = (baseScore * 0.4) + (factorSum * 0.6 * 100 / Math.abs(factors.reduce((s, f) => s + Math.abs(f.weight), 0) || 1));
    const finalScore = Math.min(100.0, Math.max(0.0, blendedScore));

    let priority: "High" | "Medium" | "Low" = "Low";
    if (finalScore >= 80.0) priority = "High";
    else if (finalScore >= 45.0) priority = "Medium";

    return {
      ...lead,
      id: generateId("lead"),
      score: parseFloat(finalScore.toFixed(1)),
      priority,
      scoreBreakdown: factors,
      confidenceLevel: 0.85,
      trendLine: "steady" as const,
      recommendedAction: finalScore >= 80 ? "Immediate outreach" : "Nurture sequence",
      contacted: false
    };
  });

  addLeads(scoredLeads);
}
