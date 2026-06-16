jest.mock("onnxruntime-node", () => ({
  InferenceSession: {
    create: jest.fn().mockResolvedValue({
      run: jest.fn().mockResolvedValue({
        score: {
          data: new Float32Array([75.0])
        }
      })
    })
  },
  Tensor: jest.fn().mockImplementation((type, data, dims) => ({
    type,
    data,
    dims
  }))
}));

import request from "supertest";
import app from "../index";

describe("REST API Endpoints", () => {
  it("should return empty array for GET /api/leads initially", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should score a single lead via POST /api/score", async () => {
    const lead = {
      name: "Bob Builder",
      email: "bob@builder.com",
      platform: "TikTok",
      signals: ["sizing inquiries"],
      urgency: "medium",
      behavioralSentence: "sizing inquiries; Medium urgency"
    };

    const res = await request(app)
      .post("/api/score")
      .send(lead);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Bob Builder");
    expect(res.body.score).toBeDefined();
    expect(res.body.priority).toBeDefined();
    expect(res.body.id).toBeDefined();
  });

  it("should return leads list with the added lead", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toBe("Bob Builder");
  });
});
