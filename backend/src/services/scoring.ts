import * as path from "path";
import * as fs from "fs";
import * as ort from "onnxruntime-node";
import { tokenize } from "../utils/tokenizer";
import { NormalizedLead } from "../utils/normalizer";

let session: ort.InferenceSession | null = null;
const MODEL_PATH = path.join(__dirname, "../../assets/model.onnx");

/**
 * Initializes the ONNX session if it has not been initialized yet.
 */
async function getONNXSession(): Promise<ort.InferenceSession> {
  if (session) return session;
  
  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`ONNX model file not found at ${MODEL_PATH}. Make sure to run the training script first.`);
  }

  try {
    session = await ort.InferenceSession.create(MODEL_PATH);
    return session;
  } catch (error) {
    throw new Error(`Failed to load ONNX model: ${(error as Error).message}`);
  }
}

/**
 * Runs inference on a single sequence of token IDs.
 */
async function runModelInference(tokenIds: number[]): Promise<number> {
  const sess = await getONNXSession();
  
  // PyTorch long mapping requires int64 tensor. In JS, represent with BigInt64Array.
  const bigIntIds = new BigInt64Array(tokenIds.map(id => BigInt(id)));
  
  // Input dimensions: [1, 32]
  const inputTensor = new ort.Tensor("int64", bigIntIds, [1, 32]);
  
  try {
    const feeds: Record<string, ort.Tensor> = { input_ids: inputTensor };
    const outputs = await sess.run(feeds);
    
    // Output score tensor
    const scoreTensor = outputs.score;
    const scoreData = scoreTensor.data as Float32Array;
    return scoreData[0];
  } catch (error) {
    // Fallback if model inference fails
    return 50.0;
  }
}

/**
 * Applies rule-based score boosts reflecting retail sales team priorities.
 */
export function applyBehavioralBoosts(lead: NormalizedLead, baseScore: number): number {
  let boostedScore = baseScore;
  const sentence = lead.behavioralSentence.toLowerCase();

  // Weighted signal boosts
  if (sentence.includes("cart") && (sentence.includes("added") || sentence.includes("add"))) {
    boostedScore += 15.0; // Added to cart boost
  }
  if (sentence.includes("restock") && (sentence.includes("request") || sentence.includes("req"))) {
    boostedScore += 15.0; // Restock request boost
  }
  if (sentence.includes("sizing") || sentence.includes("size") || sentence.includes("fit")) {
    boostedScore += 10.0; // Sizing inquiry boost
  }
  if (sentence.includes("wishlist") || sentence.includes("save")) {
    boostedScore += 5.0; // Wishlist save boost
  }
  if (lead.urgency === "high" || sentence.includes("high urgency")) {
    boostedScore += 10.0; // High urgency boost
  } else if (lead.urgency === "low" || sentence.includes("low urgency")) {
    boostedScore -= 10.0; // Low urgency penalty
  }

  // Constrain final score to [0, 100]
  return Math.min(100.0, Math.max(0.0, boostedScore));
}

/**
 * Scores a single lead, mapping raw score to priority category.
 */
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

/**
 * Scores a batch of leads.
 */
export async function scoreBatchLeads(leads: NormalizedLead[]): Promise<NormalizedLead[]> {
  const scoredLeads: NormalizedLead[] = [];
  for (const lead of leads) {
    const scored = await scoreLead(lead);
    scoredLeads.push(scored);
  }
  return scoredLeads;
}
