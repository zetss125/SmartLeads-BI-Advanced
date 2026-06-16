import { tokenize } from "../utils/tokenizer";
import { applyBehavioralBoosts, scoreLead } from "../services/scoring";
import { NormalizedLead } from "../utils/normalizer";

describe("Tokenizer Utility", () => {
  it("should tokenize text into a sequence of 32 IDs", () => {
    const text = "Added to cart; Viewed details; HIGH urgency";
    const ids = tokenize(text);
    expect(ids).toBeInstanceOf(Array);
    expect(ids.length).toBe(32);
    // Padding token is 0
    expect(ids[31]).toBe(0);
    // Added should map to an index
    expect(ids[0]).toBeGreaterThan(1); // not <pad> or <unk>
  });

  it("should handle empty or undefined text by returning padded arrays", () => {
    const ids = tokenize("");
    expect(ids.length).toBe(32);
    expect(ids.every(id => id === 0)).toBe(true);
  });
});

describe("Behavioral Score Boosting", () => {
  const dummyLead: NormalizedLead = {
    name: "John Doe",
    email: "john@example.com",
    phone: "123",
    platform: "facebook",
    signals: ["added to cart"],
    urgency: "high",
    date: "2026-06-15",
    behavioralSentence: "Added to cart; HIGH urgency",
    contacted: false
  };

  it("should apply positive boosts for high-value actions", () => {
    const baseScore = 50.0;
    const finalScore = applyBehavioralBoosts(dummyLead, baseScore);
    // +15 for cart, +10 for high urgency = +25 boost
    expect(finalScore).toBe(75.0);
  });

  it("should bound the score to maximum of 100", () => {
    const baseScore = 95.0;
    const finalScore = applyBehavioralBoosts(dummyLead, baseScore);
    expect(finalScore).toBe(100.0);
  });

  it("should apply negative boost for low urgency", () => {
    const lowUrgencyLead: NormalizedLead = {
      ...dummyLead,
      urgency: "low",
      behavioralSentence: "Low urgency"
    };
    const baseScore = 50.0;
    const finalScore = applyBehavioralBoosts(lowUrgencyLead, baseScore);
    expect(finalScore).toBe(40.0);
  });
});

describe("ONNX Model Scorer", () => {
  it("should load model and output scored lead with priority", async () => {
    const lead: NormalizedLead = {
      name: "High Intent Buyer",
      email: "buyer@example.com",
      phone: "12345",
      platform: "instagram",
      signals: ["added to cart", "restock request"],
      urgency: "high",
      date: "2026-06-15",
      behavioralSentence: "Added to cart; Restock request; HIGH urgency",
      contacted: false
    };

    const scored = await scoreLead(lead);
    expect(scored.score).toBeDefined();
    expect(scored.score).toBeGreaterThanOrEqual(0);
    expect(scored.score).toBeLessThanOrEqual(100);
    expect(["High", "Medium", "Low"]).toContain(scored.priority);
  });
});
