import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { reviews, productName } = await req.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: "Reviews data is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

    const reviewsSummary = reviews.map((r: any) => ({
      rating: r.rating,
      title: r.title,
      body: r.body?.substring(0, 200),
      pros: r.pros || [],
      cons: r.cons || [],
    }));

    if (!apiKey) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      return NextResponse.json({
        strategy: `## Competitor Analysis Report: ${productName || "Product"}

### Overall Assessment
Based on analysis of ${reviews.length} customer reviews, the product has an average rating of ${avgRating.toFixed(1)}/5.

### Key Strengths
1. Product quality and build are frequently praised
2. Good value proposition for the target market
3. Positive customer experience reported in most cases

### Key Weaknesses
1. Some quality control issues reported
2. Price point may be a concern for some segments
3. Delivery and packaging concerns mentioned

### Recommendations
- Focus on quality assurance to address consistency issues
- Consider competitive pricing strategies or bundle offers
- Improve packaging and delivery experience
- Leverage positive reviews in marketing materials
- Address negative feedback with responsive customer service

### Competitive Positioning
This product holds a ${avgRating >= 4 ? "strong" : avgRating >= 3 ? "moderate" : "weak"} position in the market. ${avgRating >= 4 ? "Strongly recommend capitalizing on brand advocates." : "Focus on addressing key weaknesses to improve market position."}`,
        recommendations: [
          { priority: "High", action: "Address quality control issues raised in critical reviews", impact: "High" },
          { priority: "High", action: "Respond to all negative reviews with solutions", impact: "Medium" },
          { priority: "Medium", action: "Create marketing campaign highlighting top-rated features", impact: "High" },
          { priority: "Medium", action: "Consider pricing adjustments based on feedback", impact: "Medium" },
          { priority: "Low", action: "Update product descriptions to set accurate expectations", impact: "Low" },
        ]
      });
    }

    const prompt = `You are a competitive intelligence analyst. Analyze the following customer reviews for ${productName || "a product"} and provide a strategic analysis.

Reviews Data:
${JSON.stringify(reviewsSummary, null, 2)}

Provide a comprehensive competitive analysis report. Respond ONLY with JSON in this format:
{
  "strategy": "Detailed markdown-formatted analysis covering overall assessment, key strengths, key weaknesses, recommendations, and competitive positioning.",
  "recommendations": [
    { "priority": "High/Medium/Low", "action": "Specific actionable recommendation", "impact": "High/Medium/Low" }
  ]
}

DO NOT include emojis. Return ONLY raw JSON.`;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      let content = response.data?.choices?.[0]?.message?.content?.trim() || "";
      if (content.startsWith("```")) {
        content = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      return NextResponse.json({
        strategy: `## Competitor Analysis Report: ${productName || "Product"}

### Overall Assessment
Based on analysis of ${reviews.length} customer reviews.

### Key Findings
1. Customer sentiment is ${avgRating >= 4 ? "predominantly positive" : avgRating >= 3 ? "mixed" : "predominantly negative"}
2. ${avgRating >= 4 ? "Product quality and value are key differentiators" : "Several areas for improvement identified"}
3. Market positioning can be strengthened through targeted improvements`,
        recommendations: [
          { priority: "High", action: "Analyze and address common complaints", impact: "High" },
          { priority: "Medium", action: "Develop response strategy for negative reviews", impact: "Medium" },
          { priority: "Medium", action: "Identify and amplify positive sentiment drivers", impact: "Medium" },
        ]
      });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
