import * as path from "path";
import * as fs from "fs";
import { tokenize } from "@/lib/tokenizer";
import { NormalizedLead } from "@/types";

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

export function applyBehavioralBoosts(lead: NormalizedLead, baseScore: number): number {
  let boostedScore = baseScore;
  const sentence = lead.behavioralSentence.toLowerCase();

  if (sentence.includes("cart") && (sentence.includes("added") || sentence.includes("add"))) {
    boostedScore += 15.0;
  }
  if (sentence.includes("restock") && (sentence.includes("request") || sentence.includes("req"))) {
    boostedScore += 15.0;
  }
  if (sentence.includes("sizing") || sentence.includes("size") || sentence.includes("fit")) {
    boostedScore += 10.0;
  }
  if (sentence.includes("wishlist") || sentence.includes("save")) {
    boostedScore += 5.0;
  }
  if (lead.urgency === "high" || sentence.includes("high urgency")) {
    boostedScore += 10.0;
  } else if (lead.urgency === "low" || sentence.includes("low urgency")) {
    boostedScore -= 10.0;
  }

  return Math.min(100.0, Math.max(0.0, boostedScore));
}

export async function scoreLead(lead: NormalizedLead): Promise<NormalizedLead> {
  const tokenIds = tokenize(lead.behavioralSentence);
  const baseScore = await runModelInference(tokenIds);
  const finalScore = applyBehavioralBoosts(lead, baseScore);

  let priority: "High" | "Medium" | "Low" = "Low";
  if (finalScore >= 80.0) {
    priority = "High";
  } else if (finalScore >= 45.0) {
    priority = "Medium";
  }

  return {
    ...lead,
    score: parseFloat(finalScore.toFixed(1)),
    priority
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
